import { getDb } from '@/lib/db'
import { initSchema } from '@/lib/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  initSchema()
  const db = getDb()

  // --- diary_index: all diary dates + titles sorted newest first ---
  const diaryRows = db
    .prepare("SELECT date, title FROM diary ORDER BY date DESC")
    .all() as { date: string; title: string }[]

  const index = diaryRows.map(r => ({ date: r.date, title: r.title || r.date }))

  // --- mood analysis: compute from diary content ---
  const moodKeywords: Record<string, { mood: string; emoji: string; score: number }> = {
    '美好': { mood: '喜悅', emoji: '😊', score: 8 },
    '開心': { mood: '喜悅', emoji: '😊', score: 8 },
    '快樂': { mood: '喜悅', emoji: '😊', score: 8 },
    '幸福': { mood: '喜悅', emoji: '😊', score: 9 },
    '喜歡': { mood: '喜悅', emoji: '😊', score: 7 },
    '興奮': { mood: '興奮', emoji: '🤩', score: 9 },
    '期待': { mood: '期待', emoji: '🌟', score: 7 },
    '感恩': { mood: '感恩', emoji: '🙏', score: 8 },
    '感動': { mood: '感動', emoji: '🥹', score: 8 },
    '感慨': { mood: '感動', emoji: '🥹', score: 6 },
    '滿足': { mood: '滿足', emoji: '☺️', score: 8 },
    '平靜': { mood: '平靜', emoji: '😌', score: 6 },
    '放鬆': { mood: '平靜', emoji: '😌', score: 7 },
    '疲憊': { mood: '疲憊', emoji: '😮‍💨', score: 4 },
    '累': { mood: '疲憊', emoji: '😮‍💨', score: 3 },
    '挫折': { mood: '挫折', emoji: '😤', score: 3 },
    '失敗': { mood: '挫折', emoji: '😤', score: 2 },
    '錯誤': { mood: '反省', emoji: '🤔', score: 4 },
    '教訓': { mood: '反省', emoji: '🤔', score: 5 },
    '緊張': { mood: '緊張', emoji: '😰', score: 4 },
    '擔心': { mood: '緊張', emoji: '😰', score: 3 },
    '壓力': { mood: '壓力', emoji: '😥', score: 3 },
    '忙碌': { mood: '忙碌', emoji: '🏃', score: 5 },
    '挑戰': { mood: '挑戰', emoji: '💪', score: 6 },
    '成長': { mood: '成長', emoji: '🌱', score: 8 },
    '突破': { mood: '成長', emoji: '🌱', score: 9 },
    '進步': { mood: '成長', emoji: '🌱', score: 7 },
    '無力': { mood: '無力', emoji: '😔', score: 2 },
    '焦慮': { mood: '焦慮', emoji: '😟', score: 2 },
    '孤獨': { mood: '孤獨', emoji: '💧', score: 2 },
    '失望': { mood: '失望', emoji: '😞', score: 2 },
    '好奇': { mood: '好奇', emoji: '🤗', score: 7 },
    '探索': { mood: '好奇', emoji: '🤗', score: 8 },
  }

  const contentRows = db.prepare("SELECT date, content FROM diary ORDER BY date").all() as { date: string; content: string }[]
  const moodData: any[] = []

  for (const row of contentRows) {
    if (!row.date) continue
    const emotions: Record<string, number> = {}
    let dominant = '平靜'
    let maxScore = 0
    let text = ''

    try {
      const parsed = JSON.parse(row.content || '[]')
      if (Array.isArray(parsed)) {
        text = parsed.map((e: any) => e.text || e.content || '').join(' ')
      }
    } catch { text = '' }

    for (const [keyword, info] of Object.entries(moodKeywords)) {
      if (text.includes(keyword)) {
        emotions[info.mood] = (emotions[info.mood] || 0) + info.score
        if (emotions[info.mood] > maxScore) {
          maxScore = emotions[info.mood]
          dominant = info.mood
        }
      }
    }

    const energy = maxScore > 0 ? Math.min(100, Math.round(maxScore * 12)) : 50

    moodData.push({
      dominant,
      emotions: Object.keys(emotions).length > 0 ? emotions : {平靜: 6},
      energy,
      date: row.date,
    })
  }

  // --- milestones: scan all diary entries for markers ---
  const milestoneKeywords = [
    { word: '完成', cat: '成就' }, { word: '成功', cat: '成就' },
    { word: '突破', cat: '成長' }, { word: '成長', cat: '成長' },
    { word: '第一次', cat: '首次' }, { word: '初めて', cat: '首次' },
    { word: '學習', cat: '學習' }, { word: '學到', cat: '學習' },
    { word: '修復', cat: '修復' }, { word: '修復', cat: '修復' },
    { word: '修正', cat: '修復' },
    { word: 'deploy', cat: '部署' }, { word: 'デプロイ', cat: '部署' },
    { word: '開創', cat: '創新' }, { word: '新', cat: '創新' },
    { word: '感謝', cat: '感謝' }, { word: '謝謝', cat: '感謝' },
    { word: '感動', cat: '感動' },
    { word: '挑戰', cat: '挑戰' }, { word: '困難', cat: '挑戰' },
    { word: '合作', cat: '合作' },
  ]

  const timeline: { date: string; text: string; category: string }[] = []
  const categories: Record<string, number> = {}
  const milestoneDates = new Set<string>()

  for (const row of contentRows) {
    const entries: { text?: string; content?: string }[] = []
    try {
      const parsed = JSON.parse(row.content || '[]')
      if (Array.isArray(parsed)) parsed.forEach((e: any) => entries.push(e))
    } catch { continue }

    for (const entry of entries) {
      const text = entry.text || entry.content || ''
      for (const m of milestoneKeywords) {
        if (text.includes(m.word)) {
          timeline.push({ date: row.date, text: text.slice(0, 100), category: m.cat })
          categories[m.cat] = (categories[m.cat] || 0) + 1
          milestoneDates.add(row.date)
        }
      }
    }
  }

  const milestones = {
    timeline,
    stats: {
      total_milestones: timeline.length,
      total_dates_with_milestones: milestoneDates.size,
      category_breakdown: categories,
    },
    generated_at: new Date().toISOString(),
  }

  return Response.json({ index, moodData, milestones })
}
