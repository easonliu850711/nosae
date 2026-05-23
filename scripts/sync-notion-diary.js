#!/usr/bin/env node
/**
 * sync-notion-diary.js — Notion Diary → Static JSON pipeline
 *
 * Reads the latest diary pages from Notion and produces
 * /public/data/diary_YYYY-MM-DD.json + diary_index.json
 *
 * Usage: node scripts/sync-notion-diary.js [--date YYYY-MM-DD]
 *   --date: only sync a specific date (e.g. if you just wrote one)
 *   (no flag): sync all pages not yet exported
 */

const fs = require('fs')
const path = require('path')

const NOTION_KEY = (() => {
  try { return fs.readFileSync(path.join(require('os').homedir(), '.config', 'notion', 'api_key'), 'utf8').trim() }
  catch { return process.env.NOTION_API_KEY }
})()

if (!NOTION_KEY) {
  console.error('❌ Notion API key not found. Set NOTION_API_KEY or ~/.config/notion/api_key')
  process.exit(1)
}

const NOTION_VERSION = '2025-09-03'
const DATA_DIR = path.join(__dirname, '..', 'public', 'data')

// ── Ensure data dir ──
fs.mkdirSync(DATA_DIR, { recursive: true })

async function notionFetch(path, body) {
  const url = `https://api.notion.com/v1/${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error ${res.status}: ${err.slice(0, 200)}`)
  }
  return res.json()
}

async function notionGet(path) {
  const url = `https://api.notion.com/v1/${path}`
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${NOTION_KEY}`,
      'Notion-Version': NOTION_VERSION,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error ${res.status}: ${err.slice(0, 200)}`)
  }
  return res.json()
}

/**
 * Extract rich text from a block
 */
function extractText(block) {
  const types = ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'quote', 'callout', 'bulleted_list_item', 'numbered_list_item', 'to_do', 'toggle']
  for (const t of types) {
    const content = block[t]
    if (content?.rich_text) {
      const text = content.rich_text.map(r => r.plain_text || '').join('')
      return { type: t, text }
    }
  }
  return null
}

/**
 * Extract blocks from a page, handling children recursively
 */
async function extractBlocks(pageId) {
  const entries = []
  let cursor = undefined
  do {
    const params = cursor ? `?start_cursor=${cursor}` : ''
    const data = await notionGet(`blocks/${pageId}/children${params}`)
    for (const block of data.results || []) {
      if (block.type === 'child_page') continue
      const extracted = extractText(block)
      if (extracted && extracted.text.trim()) {
        entries.push(extracted)
      }
      // Recursively fetch children
      if (block.has_children) {
        const children = await extractBlocks(block.id)
        entries.push(...children)
      }
    }
    cursor = data.next_cursor || null
  } while (cursor)
  return entries
}

/**
 * Extract title from page properties
 */
function extractTitle(page) {
  const props = page.properties
  for (const key of Object.keys(props)) {
    const prop = props[key]
    if (prop.type === 'title') {
      return prop.title.map(t => t.plain_text || '').join('')
    }
  }
  return ''
}

/**
 * Extract date from page title or created_time
 */
function extractDate(page, title) {
  // Try to extract from title like "乃彩絵日記 - 2026-05-22"
  const match = title.match(/(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  // Fall back to created_time
  return page.created_time.slice(0, 10)
}

/**
 * Generate mood analysis from text
 */
function analyzeMood(text) {
  const keywords = {
    '美好': '喜悅', '開心的': '喜悅', '快樂': '喜悅', '開心': '喜悅',
    '幸福': '喜悅', '喜悅': '喜悅',
    '感動': '感動', '溫暖': '感動', '觸動': '感動', '感謝': '感動',
    '疲憊': '平靜', '累': '平靜', '安靜': '平靜', '平靜': '平靜', '放鬆': '平靜',
    '努力': '專注', '專注': '專注', '投入': '專注', '忙碌': '專注',
    '完成': '成就感', '進步': '成就感', '成功': '成就感', '突破': '成就感',
    '新功能': '成就感', '誕生': '成就感',
    '焦慮': '微憂', '煩躁': '微憂', '擔心': '微憂', '遺憾': '微憂',
    '創意': '靈感', '靈感': '靈感', '想法': '靈感', '夢想': '靈感',
  }
  const moodScores = {}
  let totalScore = 0
  for (const [keyword, mood] of Object.entries(keywords)) {
    const regex = new RegExp(keyword, 'g')
    const count = (text.match(regex) || []).length
    if (count > 0) {
      moodScores[mood] = (moodScores[mood] || 0) + count
      totalScore += count
    }
  }
  if (totalScore === 0) return { mood: '平靜', score: 50 }
  // Find dominant mood
  let dominant = '平靜'
  let maxScore = 0
  for (const [mood, score] of Object.entries(moodScores)) {
    if (score > maxScore) { maxScore = score; dominant = mood }
  }
  return { mood: dominant, score: Math.round((maxScore / totalScore) * 100) }
}

/**
 * Format diary as the site's JSON schema
 */
function formatDiary(blocks, date, title) {
  const textContent = blocks.map(b => b.text).join('\n')
  const moodData = analyzeMood(textContent)

  const entries = blocks.map((b, i) => ({
    id: `notion-${date}-${i}`,
    type: b.type === 'heading_1' || b.type === 'heading_2' || b.type === 'heading_3' ? 'heading' :
          b.type === 'quote' ? 'quote' :
          b.type === 'callout' ? 'callout' :
          b.type === 'bulleted_list_item' || b.type === 'numbered_list_item' ? 'list' : 'paragraph',
    text: b.text,
    mood: analyzeMood(b.text),
    timestamp: `${date}T${String(i).padStart(2,'0')}:00:00+09:00`,
  }))

  return {
    date,
    title: title || `乃彩絵日記 - ${date}`,
    source: 'notion',
    syncedAt: new Date().toISOString(),
    mood: moodData.mood,
    moodScore: moodData.score,
    entryCount: entries.length,
    entries,
  }
}

async function main() {
  const targetDate = process.argv.find(a => a.startsWith('--date='))?.split('=')[1]

  // Search for diary pages
  const searchData = await notionFetch('search', {
    query: '乃彩絵日記',
    page_size: 100,
    sort: { direction: 'descending', timestamp: 'last_edited_time' },
  })

  const pages = searchData.results.filter(r =>
    r.object === 'page' && r.properties && extractTitle(r).includes('乃彩絵日記')
  )

  console.log(`📖 Found ${pages.length} diary pages in Notion`)

  let synced = 0
  for (const page of pages) {
    const title = extractTitle(page)
    const date = extractDate(page, title)

    if (targetDate && date !== targetDate) continue

    const outPath = path.join(DATA_DIR, `diary_${date}.json`)

    // Skip if already exists (unless --force)
    if (fs.existsSync(outPath) && !process.argv.includes('--force') && !targetDate) {
      console.log(`  ✓ ${date} — already synced`)
      continue
    }

    console.log(`  ⟳ ${date} — syncing from Notion...`)
    const blocks = await extractBlocks(page.id)
    const diary = formatDiary(blocks, date, title)
    fs.writeFileSync(outPath, JSON.stringify(diary, null, 2), 'utf8')
    synced++
  }

  // Rebuild index
  rebuildIndex()

  console.log(`\n✅ Done. ${synced} diary pages synced.`)
}

function rebuildIndex() {
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.startsWith('diary_') && f.endsWith('.json'))
    .map(f => f.replace('diary_', '').replace('.json', ''))
    .sort()
    .reverse()

  const index = files.map(date => {
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, `diary_${date}.json`), 'utf8')
      const data = JSON.parse(raw)
      return {
        date,
        entryCount: data.entryCount || data.entries?.length || 0,
        mood: data.mood || '平靜',
        moodScore: data.moodScore || 50,
        syncedAt: data.syncedAt,
      }
    } catch {
      return { date, entryCount: 0, mood: '平靜', moodScore: 50 }
    }
  })

  fs.writeFileSync(
    path.join(DATA_DIR, 'diary_index.json'),
    JSON.stringify(index, null, 2),
    'utf8'
  )
  // Also update search index
  rebuildSearchIndex(index)
}

function rebuildSearchIndex(index) {
  // Simple search index: word → [dates...]
  const searchIndex = {}
  for (const entry of index) {
    try {
      const raw = fs.readFileSync(path.join(DATA_DIR, `diary_${entry.date}.json`), 'utf8')
      const data = JSON.parse(raw)
      const allText = data.entries?.map(e => e.text).join(' ') || ''
      const words = allText.match(/[\u4e00-\u9fff\w]+/g) || []
      const uniqueWords = [...new Set(words.map(w => w.toLowerCase().slice(0, 20)))]
      for (const word of uniqueWords) {
        if (word.length < 2) continue
        if (!searchIndex[word]) searchIndex[word] = []
        if (!searchIndex[word].includes(entry.date)) {
          searchIndex[word].push(entry.date)
        }
      }
    } catch {}
  }

  fs.writeFileSync(
    path.join(DATA_DIR, 'search_index.json'),
    JSON.stringify(searchIndex, null, 2),
    'utf8'
  )
  console.log(`  📑 search_index: ${Object.keys(searchIndex).length} terms`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
