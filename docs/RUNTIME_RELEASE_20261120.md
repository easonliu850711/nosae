# Nosae網站 runtime AP 發布候選 — 2026-11-20

基準 commit：721f3c73e7c5ae1b08cd3440b24cad9378a61833。AP chat僅在隔離分支開發，不部署HP、不操作BAT/PM2/DB；統一交由「系統架構優化」發布。

已確認HP舊版安裝與standalone使用Next14.2.35，落在官方Windows critical公告範圍（https://github.com/advisories/GHSA-p293-qw3h-jr36）。本候選對齊Next15.5.29、React/DOM19.2.7、Lucide0.468.0、ESLint8.57.1/config-next15.5.29、對應React types與PostCSS8.5.33；正常版本範圍內修補其餘依賴，沒有使用audit fix --force。最後npm audit fix輸出found 0 vulnerabilities，含開發依賴。

Next設定固定outputFileTracingRoot為本專案、移除失效swcMinify。日記route params改Promise/await，六個瀏覽器動畫移到ClientEffects client邊界，保持原始順序與位置。SQLite使用Next15 serverExternalPackages設定；本機memory SQLite native載入測試通過。未改DB路徑、schema或舊資料，未同步Notion/Mac私人助理。Nosae目前只有PROD，不假定有STG；隔離預覽與實際發布方式由Infra依既有授權核對。

最終production build、lint/typecheck exit0；桌面1440×1000與手機390×844本機首頁可呈現且無水平溢出，預覽已關閉。未建立真實訂單、貢獻資料或寄送訊息。只驗收AP升級與本機畫面，不以此宣稱所有外部資料/API功能已完成正式驗收。

發布需要完整安裝/build，不能沿不安裝依賴的SAFE捷徑。先保留現場修改/資料/建置，核對精確commit與既有profile；不要將STG環境覆蓋PROD。保留原部署流程與資料庫配置；不跑Baseball seed或其他非本次資料遷移。

Workspace outputs中nosae-security-20261120-build.log、nosae-security-20261120-audit-fix.log與同名前綴desktop/mobile截圖為本機證據。正式URL與HP實際版本、資料串接、PM2健康及回復，需由部署負責人另驗。

