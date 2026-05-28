# Nosae Diary API 修正與驗證

## 修正內容

- `src/app/api/sync/diary/route.ts`
  - 支援 `body.token`
  - 支援 `Authorization: Bearer <token>`
  - 支援 `OPTIONS` preflight
  - 回應會帶 `tokenConfigured`，方便判斷 PM2 是否有注入 `SYNC_TOKEN`
- `src/lib/db.ts`
  - 自動建立 DB 目錄
- `scripts/push-diary.js`
  - 顯示 HTTP status
  - 403 時會明確提示可能是 Cloudflare / Nginx / Access / WAF 擋在外層

## 部署後本機測試

PowerShell：

```powershell
$env:SYNC_TOKEN="nosae-apikey-202605"

$body = @{
  token = "nosae-apikey-202605"
  date = "2026-05-29"
  title = "乃彩絵日記 - 2026-05-29"
  entries = @(
    @{ type = "paragraph"; text = "API sync test" }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://127.0.0.1:3003/api/sync/diary" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

CMD：

```cmd
curl.exe -i -X POST http://127.0.0.1:3003/api/sync/diary -H "Content-Type: application/json" -d "{\"token\":\"nosae-apikey-202605\",\"date\":\"2026-05-29\",\"title\":\"乃彩絵日記 - 2026-05-29\",\"entries\":[{\"type\":\"paragraph\",\"text\":\"API sync test\"}]}"
```

## 判斷

- 本機 `127.0.0.1:3003` 成功，但公開網域 `https://nosae.studio-imori.com/api/sync/diary` 是 403：
  - 問題在 Cloudflare / Nginx / Access / WAF，不在 Next.js API。
- 本機也是 401：
  - PM2 沒吃到 `SYNC_TOKEN`，重新部署時要用 `--update-env` 並注入 `SYNC_TOKEN`。
- 本機是 500 且 detail 提到 SQLite / DB：
  - 檢查 `NOSAE_DB_PATH` 與 `data` 目錄權限。
