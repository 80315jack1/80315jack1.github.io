# Personal Brain

React + React Flow 使用者白板。線上入口：`https://80315jack1.github.io/personal-brain/`。

新增文字、事件、小結論、分析，自行拖曳與連線，修改、移除、復原；白板自動儲存在目前瀏覽器，支援 JSON 匯入／匯出。

此公開版本不包含原始日記、brain.sqlite、conversation/message ID、原文素材、模式候選或現有白板。私人原版仍在本機。GitHub Pages 不提供跨裝置同步，桌機匯出 JSON 後可到筆電匯入。

## 匯入私人資料包

按「匯入 Personal Brain 資料包」，選擇本機 `personal-brain-data.json`。資料包包含 schemaVersion:1、format:personal-brain-data、catalog、patterns。程式核對素材、模式與精確來源，保存到目前瀏覽器的 IndexedDB；重新開啟仍可使用，不傳送到伺服器或 GitHub。不會改動白板或自動建立思考路徑。

白板 JSON、日記 ID 清單與資料包分開匯入。匯入新包會替換素材／模式，白板仍保留。私人資料包請另外自行保管；程式庫只包含空白預設資料。

也可以直接匯入 `selected_diary_conversations.json` 或官方 `conversations-*.json`（單檔上限 50 MB，可選檔或拖入）。完整原始物件包含全部分支，存入瀏覽器 IndexedDB；按「原始對話」可搜尋標題、日期、ID 及有效分支原文。重複匯入按 conversation ID 更新，不重複新增；不改素材、模式或白板。

閱讀器沿 current_node 的 parent 回溯目前分支，保留順序，不以時間戳或任意 mapping 順序排序。缺少路徑／循環會拒絕該次匯入，不猜分支。系統、工具及不可見推理訊息不當作 user／assistant 對話顯示；原始資料仍保留。附件指標不是附件本體，此版不載入附件。匯入不會執行 AI 分析。

## 開發與更新

Node.js 22+；在本資料夾執行 `npm install`、`npm run dev`，或 `npm run build`。build 更新網站根目錄的 `personal-brain/`，提交程式與該靜態目錄即可由既有 GitHub Pages/Jekyll 發布。`_personal-brain-app` 原始碼目錄不會成為網站頁面。

公開版只讀寫瀏覽器儲存與本機 JSON，沒有分析 API、雲端資料庫、追蹤碼或自動上傳筆記。不要把私人 JSON 改寫到程式內並提交公開儲存庫。
