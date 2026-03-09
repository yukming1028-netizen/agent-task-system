# QA 測試指南

**版本**: Phase 2  
**日期**: 2026-03-09  
**開發者**: Dev 💻

---

## 🎯 測試目標

確保 Phase 2 功能正常運作，測試通過率 ≥98%

---

## 📦 測試環境

### GitHub 倉庫
https://github.com/yukming1028-netizen/agent-task-system

### 本地啟動
```bash
cd agent-task-system
docker-compose up -d
```

### 訪問地址
- 前端：http://localhost:5173
- API 文檔：http://localhost:3000/api/docs

---

## 🧪 測試用例

### 1. 工作流自動化測試

#### TC-001: 設計→開發自動交接
**步驟**:
1. Manager 創建設計任務
2. Designer 登錄並領取任務
3. Designer 點擊 "Complete & Next"
4. 檢查是否自動創建開發任務

**預期結果**:
- ✅ 設計任務狀態變為 completed
- ✅ 自動創建開發任務（標題：Dev: [原任務標題]）
- ✅ 開發任務自動分配給空閒 Developer
- ✅ 任務歷史記錄正確

#### TC-002: 開發→QA 自動交接
**步驟**:
1. Developer 登錄並查看分配的開發任務
2. Developer 點擊 "Complete & Next"
3. 檢查是否自動創建 QA 任務

**預期結果**:
- ✅ 開發任務狀態變為 completed
- ✅ 自動創建 QA 任務（標題：QA: [原任務標題]）
- ✅ QA 任務自動分配給空閒 QA
- ✅ 任務歷史記錄正確

---

### 2. Agent 狀態管理測試

#### TC-003: Agent 狀態實時更新
**步驟**:
1. Manager 查看 Dashboard 的 Agent Status
2. Developer 領取一個任務
3. Manager 刷新 Dashboard

**預期結果**:
- ✅ 領取任務前：Developer 顯示 available
- ✅ 領取任務後：Developer 顯示 busy
- ✅ 任務計數正確更新

#### TC-004: 任務完成後狀態更新
**步驟**:
1. Developer 完成任務
2. Manager 查看 Dashboard

**預期結果**:
- ✅ Developer 狀態恢復為 available
- ✅ 任務計數減少

---

### 3. 任務領取機制測試

#### TC-005: Agent 領取任務
**步驟**:
1. Manager 創建未分配的任務
2. Developer 登錄查看 Available Tasks
3. Developer 點擊 "Claim Task"

**預期結果**:
- ✅ 任務狀態變為 in_progress
- ✅ 任務分配給該 Developer
- ✅ Developer 任務計數 +1

#### TC-006: 任務上限檢查
**步驟**:
1. Developer 已滿 5 個任務
2. 嘗試領取新任務

**預期結果**:
- ✅ 提示已達任務上限
- ✅ 領取失敗

---

### 4. 任務歷史記錄測試

#### TC-007: 歷史記錄完整性
**步驟**:
1. 創建任務
2. 分配任務
3. 更新狀態
4. 完成任務
5. 查看任務詳情頁的時間線

**預期結果**:
- ✅ 所有操作都有記錄
- ✅ 時間戳正確
- ✅ 操作用戶正確

---

## 📊 測試報告模板

```markdown
# QA 測試報告

**測試日期**: YYYY-MM-DD
**測試者**: QA 🧪
**測試版本**: Phase 2

## 測試結果

| 測試用例 | 狀態 | 備註 |
|----------|------|------|
| TC-001 | ✅/❌ | |
| TC-002 | ✅/❌ | |
| TC-003 | ✅/❌ | |
| TC-004 | ✅/❌ | |
| TC-005 | ✅/❌ | |
| TC-006 | ✅/❌ | |
| TC-007 | ✅/❌ | |

## Bug 列表

### Bug-001
**嚴重程度**: High/Medium/Low
**描述**: 
**重現步驟**:
**預期行為**:
**實際行為**:

## 測試通過率

XX / 7 = XX%

## 建議

...
```

---

## 🐛 Bug 反饋

發現任何問題請提供：
1. Bug 描述
2. 重現步驟
3. 預期行為 vs 實際行為
4. 截圖（如適用）

**開發者承諾**: 收到反饋後立即修復

---

## ✅ 測試通過標準

- **測試通過率**: ≥98%
- **阻塞性 Bug**: 0
- **嚴重 Bug**: 0
- **普通 Bug**: ≤2

---

**準備就緒，等待 QA 測試** 🧪

**開發者**: Dev 💻
