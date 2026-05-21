#!/bin/bash
# 🌸 Nosae Diary Fetcher — pulls all diary entries from Notion
# Run: bash scripts/fetch-diaries.sh

set -e

PARENT_PAGE_ID="315bf67164098019b591f6380fef1896"
NOTION_KEY="${NOTION_API_KEY}"
OUTPUT_DIR="$(dirname "$0")/../data"
PUBLIC_DIR="$(dirname "$0")/../public/data"

mkdir -p "$OUTPUT_DIR" "$PUBLIC_DIR"

echo "🌸 Fetching diary child pages..."

# Step 1: Get all child pages from the parent
curl -s "https://api.notion.com/v1/blocks/${PARENT_PAGE_ID}/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_KEY" \
  -H "Notion-Version: 2025-09-03" > /tmp/nosae_children.json

# Step 2: Extract diary page IDs
python3 -c "
import json, re

with open('/tmp/nosae_children.json') as f:
    data = json.load(f)

diaries = []
for block in data.get('results', []):
    if block['type'] == 'child_page':
        title = block['child_page']['title']
        m = re.search(r'(\d{4}-\d{2}-\d{2})', title)
        if m:
            diaries.append({
                'id': block['id'].replace('-', ''),
                'title': title,
                'date': m.group(1)
            })

diaries.sort(key=lambda d: d['date'])
print(json.dumps(diaries, ensure_ascii=False, indent=2))
" > "$OUTPUT_DIR/diary_index.json"

cp "$OUTPUT_DIR/diary_index.json" "$PUBLIC_DIR/diary_index.json"

NUM_DIARIES=$(python3 -c "import json; print(len(json.load(open('$OUTPUT_DIR/diary_index.json'))))")
echo "   Found $NUM_DIARIES diary entries"

# Step 3: Fetch content for each diary page (only if not cached)
python3 -c "
import json, os, shutil, urllib.request, ssl

NOTION_KEY = os.environ['NOTION_API_KEY']
OUTPUT_DIR = '$OUTPUT_DIR'
PUBLIC_DIR = '$PUBLIC_DIR'
ctx = ssl.create_default_context()

with open(f'{OUTPUT_DIR}/diary_index.json') as f:
    diaries = json.load(f)

new_count = 0
cached_count = 0

for diary in diaries:
    page_id = diary['id']
    date = diary['date']
    outpath = f'{PUBLIC_DIR}/diary_{date}.json'
    db_path = f'{OUTPUT_DIR}/diary_{date}.json'
    
    # Skip if cached locally
    if os.path.exists(outpath):
        cached_count += 1
        continue
    
    url = f'https://api.notion.com/v1/blocks/{page_id}/children?page_size=50'
    req = urllib.request.Request(url, headers={
        'Authorization': f'Bearer {NOTION_KEY}',
        'Notion-Version': '2025-09-03'
    })
    
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f'   ⚠️  {date}: {e}')
        continue
    
    blocks = data.get('results', [])
    entries = []
    for block in blocks:
        t = block['type']
        content = ''
        if t in ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'callout', 'quote', 'bulleted_list_item', 'numbered_list_item', 'to_do', 'toggle']:
            texts = block[t].get('rich_text', [])
            content = ''.join([rt['plain_text'] for rt in texts])
        elif t == 'code':
            texts = block[t]['rich_text']
            content = ''.join([rt['plain_text'] for rt in texts])
        elif t == 'divider':
            content = ''
        if content or t == 'divider':
            entries.append({'type': t, 'text': content})
    
    diary_data = {'date': date, 'title': diary['title'], 'entries': entries}
    
    with open(outpath, 'w') as f:
        json.dump(diary_data, f, ensure_ascii=False, indent=2)
    # Also save to data/ for reference
    shutil.copy2(outpath, db_path)
    
    new_count += 1
    print(f'   ✅ {date} ({len(entries)} sections)')

print(f'   Done! {new_count} new, {cached_count} cached')
" 2>&1

echo ""
echo "🌸 Diary sync complete! Total: $NUM_DIARIES entries"
