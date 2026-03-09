# Agent Task Management System

一個用於管理 agent 任務的網站系統，包含 Manager 任務發布、Agent 任務獲取和 Dashboard 功能。

## 📋 項目結構

```
agent-task-system/
├── backend/                 # NestJS 後端 API
│   ├── src/
│   │   ├── auth/           # 認證模塊
│   │   ├── tasks/          # 任務模塊
│   │   ├── users/          # 用戶模塊
│   │   ├── dashboard/      # Dashboard 模塊
│   │   ├── workflow/       # 工作流模塊
│   │   └── common/         # 公共模塊
│   ├── prisma/             # 數據庫 Schema
│   └── package.json
├── frontend/               # React 前端
│   ├── src/
│   │   ├── pages/         # 頁面組件
│   │   ├── components/    # 通用組件
│   │   ├── services/      # API 服務
│   │   ├── store/         # 狀態管理
│   │   └── types/         # TypeScript 類型
│   └── package.json
├── docker-compose.yml      # Docker 配置
└── README.md
```

## 🛠️ 技術棧

### 後端
- **框架**: NestJS + TypeScript
- **數據庫**: PostgreSQL
- **ORM**: Prisma
- **認證**: JWT + bcrypt
- **文檔**: Swagger

### 前端
- **框架**: React 18 + TypeScript
- **UI 庫**: Ant Design
- **狀態管理**: Zustand
- **路由**: React Router v6
- **HTTP**: Axios
- **構建**: Vite

## 🚀 快速開始

### 方式一：Docker Compose（推薦）

```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

訪問：
- 前端：http://localhost:5173
- 後端 API: http://localhost:3000
- API 文檔：http://localhost:3000/api/docs

### 方式二：本地開發

#### 1. 啟動數據庫

```bash
docker-compose up -d postgres redis
```

#### 2. 設置後端

```bash
cd backend

# 安裝依賴
npm install

# 複製環境配置
cp .env.example .env

# 運行數據庫遷移
npx prisma migrate dev

# 啟動開發服務器
npm run start:dev
```

#### 3. 設置前端

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

## 📝 Phase 1 MVP 功能

- [x] 用戶認證系統（登錄/註冊）
- [x] 任務 CRUD 操作
- [x] 基礎 Dashboard
- [x] 任務狀態更新
- [x] 簡單任務分配
- [x] 任務領取機制

## 📝 Phase 2 功能

- [x] 設計 → 開發 自動交接
- [x] 開發 → QA 自動交接
- [x] Agent 空閒狀態顯示
- [x] 任務領取機制優化
- [x] 任務歷史記錄完善

## 🔌 API 接口

### 認證
- `POST /api/auth/login` - 用戶登錄
- `POST /api/auth/register` - 用戶註冊
- `GET /api/auth/me` - 獲取當前用戶信息

### 任務
- `GET /api/tasks` - 獲取任務列表
- `GET /api/tasks/:id` - 獲取任務詳情
- `POST /api/tasks` - 創建新任務
- `PATCH /api/tasks/:id` - 更新任務
- `DELETE /api/tasks/:id` - 刪除任務
- `POST /api/tasks/:id/claim` - 領取任務
- `POST /api/tasks/:id/submit` - 提交任務審核
- `POST /api/tasks/:id/status` - 更新任務狀態

### Dashboard
- `GET /api/dashboard/summary` - 獲取儀表板摘要
- `GET /api/dashboard/tasks` - 獲取儀表板任務列表
- `GET /api/dashboard/stats` - 獲取統計數據
- `GET /api/dashboard/agents` - 獲取 Agent 狀態

### 工作流
- `POST /api/workflow/design-to-dev/:id` - 設計完成，創建開發任務
- `POST /api/workflow/dev-to-qa/:id` - 開發完成，創建 QA 任務
- `GET /api/workflow/pending-assignments` - 獲取待分配任務

## 👥 默認測試賬戶

系統啟動後，可以通過註冊功能創建測試賬戶：

- Manager: manager / password123
- Designer: designer / password123
- Developer: developer / password123
- QA: qa / password123

## 📊 數據庫 Schema

主要數據表：
- `users` - 用戶表
- `tasks` - 任務表
- `task_history` - 任務歷史表
- `attachments` - 附件表
- `comments` - 評論表
- `agent_status` - Agent 狀態表

詳細請查看 `backend/prisma/schema.prisma`

## 🔄 工作流

1. **Manager** 創建任務並分配給 **Designer**
2. **Designer** 完成設計後，系統自動創建 **Developer** 任務
3. **Developer** 完成開發後，系統自動創建 **QA** 任務
4. **QA** 完成測試後，任務標記為完成

## 📝 開發進度

### Phase 1 - MVP ✅
- [x] 項目結構搭建
- [x] 後端 API 基礎框架
- [x] 前端頁面基礎框架
- [x] 認證系統
- [x] 任務 CRUD
- [x] Dashboard

### Phase 2 - 工作流自動化
- [ ] 設計 → 開發 自動交接
- [ ] 開發 → QA 自動交接
- [ ] Agent 空閒狀態顯示優化
- [ ] 任務歷史記錄完善

### Phase 3 - 增強功能
- [ ] 文件附件上傳
- [ ] 評論系統
- [ ] 通知系統
- [ ] 高級統計圖表

---

**開發者**: Dev 💻  
**協調者**: Rikkoa 🤵  
**設計師**: Designer 🎨  
**QA**: QA 🧪
