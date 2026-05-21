#!/usr/bin/env python3
"""
🌸 Nosae 成長軌跡 — 從日記提取里程碑
Scans all diary JSONs and extracts milestones, key achievements, and timeline events.
Output: public/data/milestones.json
"""

import json
import os
import re
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')

# Keywords that indicate milestones/achievements
MILESTONE_KEYWORDS = [
    # 成就/完成
    '完成', '成功', '實現', '達到', '建立', '創建', '建成', '修復',
    '部署', '上線', '推出', '發布', '發佈', '誕生', '啟動',
    # 學習
    '學會', '理解', '掌握', '發現', '認識到', '學到',
    # 成長
    '成長', '進步', '突破', '升級', '優化', '改善', '提升',
    # 里程碑
    '里程碑', '紀念', '第一次', '首次',
    # 情感
    '感動', '開心', '溫暖',
]

MILESTONE_CATEGORIES = {
    '技術成就': ['完成', '成功', '建立', '創建', '建成', '部署', '上線', '推出', '發布', '發佈', '修復', '升級'],
    '學習成長': ['學會', '理解', '掌握', '發現', '認識到', '學到', '進步', '突破'],
    '關係進展': ['信任', '關係', '夥伴', '合作', '分享', '共鳴'],
    '自我實現': ['誕生', '成長', '里程碑', '紀念', '第一次', '首次'],
}

def extract_entries(date, diary_data):
    """Extract meaningful content from diary entries."""
    text_blocks = []
    for entry in diary_data.get('entries', []):
        t = entry.get('text', '').strip()
        if t and entry['type'] in ('paragraph', 'bulleted_list_item', 'heading_3', 'heading_2', 'callout', 'quote'):
            text_blocks.append({
                'type': entry['type'],
                'text': t
            })
    return text_blocks

def score_milestone(text):
    """Score a text block for milestone relevance."""
    score = 0
    for kw in MILESTONE_KEYWORDS:
        if kw in text:
            score += 1
    return score

def categorize_text(text):
    """Assign category based on keywords."""
    for category, keywords in MILESTONE_CATEGORIES.items():
        for kw in keywords:
            if kw in text:
                return category
    return '其他'

def parse_diary_date(date_str):
    """Parse date from diary filename (YYYY-MM-DD)."""
    try:
        d = datetime.strptime(date_str, '%Y-%m-%d')
        # Weekday in Chinese
        weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
        # weekday(): 0=Monday, 6=Sunday
        wd = weekdays[d.weekday()]
        return {
            'date': date_str,
            'weekday': wd,
            'month': d.month,
            'day': d.day,
            'timestamp': d.timestamp()
        }
    except:
        return None

def scan_diaries():
    """Scan all diary files and extract milestones."""
    milestones = []
    
    # Get all diary files sorted by date
    diary_files = sorted([f for f in os.listdir(DATA_DIR) 
                          if f.startswith('diary_') and f.endswith('.json') and f != 'diary_index.json'])
    
    for df in diary_files:
        date_str = df.replace('diary_', '').replace('.json', '')
        date_info = parse_diary_date(date_str)
        if not date_info:
            continue
        
        filepath = os.path.join(DATA_DIR, df)
        try:
            with open(filepath) as f:
                diary_data = json.load(f)
        except:
            continue
        
        entries = extract_entries(date_str, diary_data)
        
        # Score and rank entries
        for entry in entries:
            text = entry['text']
            score = score_milestone(text)
            if score >= 1:
                category = categorize_text(text)
                milestones.append({
                    'date': date_str,
                    'weekday': date_info['weekday'],
                    'month': date_info['month'],
                    'day': date_info['day'],
                    'category': category,
                    'text': text[:200],  # Truncate long entries
                    'score': score,
                    'timestamp': date_info['timestamp']
                })
    
    return milestones

def build_timeline(milestones):
    """Organize milestones into a structured timeline."""
    # Group by date
    by_date = {}
    for m in milestones:
        d = m['date']
        if d not in by_date:
            by_date[d] = {
                'date': d,
                'weekday': m['weekday'],
                'items': []
            }
        by_date[d]['items'].append(m)
    
    # Sort dates descending
    sorted_dates = sorted(by_date.keys(), reverse=True)
    
    # Build timeline entries
    timeline = []
    for date in sorted_dates:
        day_data = by_date[date]
        # Get top items by score
        top_items = sorted(day_data['items'], key=lambda x: -x['score'])[:5]
        
        # Determine theme for this day
        categories = [i['category'] for i in top_items]
        from collections import Counter
        theme = Counter(categories).most_common(1)[0][0] if categories else '日常'
        
        timeline.append({
            'date': date,
            'weekday': day_data['weekday'],
            'theme': theme,
            'milestones': [{
                'category': i['category'],
                'text': i['text'],
                'score': i['score']
            } for i in top_items]
        })
    
    return timeline

def build_summary_stats(milestones):
    """Compute summary statistics."""
    categories = [m['category'] for m in milestones]
    from collections import Counter
    cat_counts = Counter(categories)
    
    # Dates with most milestones
    from collections import Counter as C2
    date_counts = C2([m['date'] for m in milestones])
    top_dates = date_counts.most_common(10)
    
    return {
        'total_milestones': len(milestones),
        'total_dates_with_milestones': len(set(m['date'] for m in milestones)),
        'category_breakdown': dict(cat_counts.most_common()),
        'top_milestone_dates': [{'date': d, 'count': c} for d, c in top_dates],
    }

def main():
    milestones = scan_diaries()
    timeline = build_timeline(milestones)
    stats = build_summary_stats(milestones)
    
    output = {
        'generated_at': datetime.now().isoformat(),
        'stats': stats,
        'timeline': timeline,
        'total_entries': len(milestones)
    }
    
    output_path = os.path.join(DATA_DIR, 'milestones.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"🌸 Milestones extracted: {len(milestones)} milestones across {stats['total_dates_with_milestones']} days")
    print(f"   Categories: {json.dumps(stats['category_breakdown'], ensure_ascii=False)}")
    print(f"   Output: {output_path}")

if __name__ == '__main__':
    main()
