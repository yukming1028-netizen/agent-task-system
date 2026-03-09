# Agent Task 管理系統 - 需求設計文檔

**版本:** 1.0  
**日期:** 2026-03-09  
**設計師:** Designer  
**協調者:** Rikkoa 🤵

---

## 📐 1. 系統架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Web UI)                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   Manager   │ │  Designer   │ │  Developer  │ │    QA     │ │
│  │   Dashboard │ │  Dashboard  │ │  Dashboard  │ │ Dashboard │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway / Backend                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    REST API Layer                          │  │
│  │  /api/auth  /api/tasks  /api/users  /api/dashboard        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Business Logic Layer                     │  │
│  │  TaskService │ UserService │ WorkflowService │ NotifySvc  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  PostgreSQL │    │    Redis    │    │   File Storage      │  │
│  │  (Primary)  │    │   (Cache)   │    │   (Attachments)     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 2. 用戶流程圖

### 2.1 Manager 任務發布流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   登錄系統    │────▶│ 創建新任務    │────▶│ 填寫任務詳情  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   任務已發布  │◀────│  選擇分配對象  │◀────│ 選擇任務類型  │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 2.2 Designer → Developer 交接流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 完成設計任務  │────▶│ 標記設計完成  │────▶│ 系統檢查開發者 │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                       ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                       │  Dev 空閒    │ │ Developer2   │ │ 兩者皆忙     │
                       │  分配任務    │ │ 空閒分配任務  │ │ 加入等待隊列  │
                       └──────────────┘ └──────────────┘ └──────────────┘
```

### 2.3 Developer → QA 交接流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 完成開發任務  │────▶│ 標記開發完成  │────▶│ 自動創建 QA   │
└──────────────┘     └──────────────┘     │    測試任務   │
                                          └──────────────┘
                                                │
                                                ▼
                                          ┌──────────────┐
                                          │  QA 獲取任務  │
                                          └──────────────┘
```

### 2.4 Agent 任務獲取流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   登錄系統    │────▶│ 查看任務列表  │────▶│ 篩選/搜索任務 │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                       ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                       │  領取任務    │ │ 查看任務詳情  │ │ 更新任務狀態  │
                       └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🖼️ 3. 頁面線框圖/原型

### 3.1 登錄頁面 (Login)

```
┌─────────────────────────────────────────┐
│           Agent Task System             │
│                                         │
│    ┌─────────────────────────────┐      │
│    │  Email / Username           │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │  Password                   │      │
│    └─────────────────────────────┘      │
│    ┌─────────────────────────────┐      │
│    │         LOGIN               │      │
│    └─────────────────────────────┘      │
│                                         │
│    [ ] Remember me                      │
│    Forgot password?                     │
└─────────────────────────────────────────┘
```

### 3.2 Manager Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Manager Dashboard                    [User] [Logout]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [+ Create New Task]                                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Task Overview                                   │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │   │
│  │  │  Total  │ │ Pending │ │  In     │ │ Done   │ │   │
│  │  │   45    │ │   12    │ │  Progress│ │   21   │ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Recent Tasks                                    │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │ Task Name    │ Assignee │ Status │ Action │  │   │
│  │  ├───────────────────────────────────────────┤  │   │
│  │  │ Design Home  │ Designer │ Done   │ [View] │  │   │
│  │  │ Dev Backend  │ Dev      │ In Prog│ [View] │  │   │
│  │  │ QA Testing   │ QA       │ Pending│ [View] │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Agent Status                                    │   │
│  │  Designer: 🟢 Available                         │   │
│  │  Dev:      🟡 Busy (2 tasks)                    │   │
│  │  Developer2: 🟢 Available                       │   │
│  │  QA:       🟢 Available                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Create Task Modal

```
┌─────────────────────────────────────────┐
│  Create New Task                    [X] │
├─────────────────────────────────────────┤
│                                         │
│  Task Title:                            │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Task Type:                             │
│  [ Design ▼ ]                           │
│                                         │
│  Assign to:                             │
│  [ Select Agent ▼ ]                     │
│                                         │
│  Priority:                              │
│  ○ Low  ● Medium  ○ High  ○ Urgent     │
│                                         │
│  Description:                           │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Attachments: [Upload Files]            │
│                                         │
│  Due Date: [📅 Select Date]             │
│                                         │
│         [Cancel]     [Create Task]      │
└─────────────────────────────────────────┘
```

### 3.4 Agent Dashboard (Developer/Designer/QA)

```
┌─────────────────────────────────────────────────────────┐
│  Developer Dashboard                    [User] [Logout] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  My Tasks                              [🔔 3]          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  In Progress (2)                                 │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │ 🔵 Backend API Development                │  │   │
│  │  │    Priority: High | Due: 2026-03-15      │  │   │
│  │  │    [Update Status] [Submit for QA]       │  │   │
│  │  ├───────────────────────────────────────────┤  │   │
│  │  │ 🔵 Frontend Component Design              │  │   │
│  │  │    Priority: Medium | Due: 2026-03-18    │  │   │
│  │  │    [Update Status] [Submit for QA]       │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Available Tasks (3)                             │   │
│  │  ┌───────────────────────────────────────────┐  │   │
│  │  │ 🟢 Database Schema Design                 │  │   │
│  │  │    From: Designer | Priority: Medium     │  │   │
│  │  │    [Claim Task]                          │  │   │
│  │  ├───────────────────────────────────────────┤  │   │
│  │  │ 🟢 API Integration                        │  │   │
│  │  │    From: Designer | Priority: High       │  │   │
│  │  │    [Claim Task]                          │  │   │
│  │  └───────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Statistics                                      │   │
│  │  Completed: 15 | In Progress: 2 | Pending: 3    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3.5 Task Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Backend API Development                    [High]      │
│                                                         │
│  Status: 🟡 In Progress                                 │
│  Assigned to: Developer                                 │
│  Created by: Manager                                    │
│  Due Date: 2026-03-15                                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Description                                            │
│  ─────────────────────────────────────────────────────  │
│  Develop RESTful API endpoints for user management...  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Attachments                                            │
│  ─────────────────────────────────────────────────────  │
│  📎 api-specs.pdf  📎 database-schema.png               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Activity Timeline                                      │
│  ─────────────────────────────────────────────────────  │
│  2026-03-10 14:30 - Developer started working          │
│  2026-03-10 09:00 - Task assigned to Developer         │
│  2026-03-09 16:00 - Task created by Manager            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Update Status]  [Add Comment]  [Submit for QA]       │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ 4. 數據庫設計概要

### 4.1 核心數據表

#### Users (用戶表)
```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL,  -- manager/designer/developer/qa
    display_name    VARCHAR(100),
    avatar_url      VARCHAR(255),
    is_available    BOOLEAN DEFAULT true,
    current_tasks   INTEGER DEFAULT 0,
    max_tasks       INTEGER DEFAULT 5,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tasks (任務表)
```sql
CREATE TABLE tasks (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    task_type       VARCHAR(50) NOT NULL,  -- design/development/qa
    priority        VARCHAR(20) DEFAULT 'medium',  -- low/medium/high/urgent
    status          VARCHAR(20) DEFAULT 'pending',  -- pending/in_progress/review/completed/cancelled
    created_by      INTEGER REFERENCES users(id),
    assigned_to     INTEGER REFERENCES users(id),
    parent_task_id  INTEGER REFERENCES tasks(id),  -- 用於關聯設計→開發→QA
    due_date        TIMESTAMP,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Task History (任務歷史表)
```sql
CREATE TABLE task_history (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER REFERENCES tasks(id),
    user_id         INTEGER REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,  -- created/assigned/status_changed/commented/completed
    old_value       VARCHAR(255),
    new_value       VARCHAR(255),
    comment         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Attachments (附件表)
```sql
CREATE TABLE attachments (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER REFERENCES tasks(id),
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_size       INTEGER,
    mime_type       VARCHAR(100),
    uploaded_by     INTEGER REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Comments (評論表)
```sql
CREATE TABLE comments (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER REFERENCES tasks(id),
    user_id         INTEGER REFERENCES users(id),
    content         TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Agent Status (Agent 狀態表)
```sql
CREATE TABLE agent_status (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) UNIQUE,
    status          VARCHAR(20) DEFAULT 'available',  -- available/busy/offline
    current_task_count INTEGER DEFAULT 0,
    last_active     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 ER 圖

```
┌─────────────┐       ┌─────────────┐
│   Users     │       │   Tasks     │
├─────────────┤       ├─────────────┤
│ id          │◀──────│ created_by  │
│ username    │       │ assigned_to │
│ email       │       │ parent_task │
│ role        │       └──────┬──────┘
│ is_avail    │              │
└──────┬──────┘              │
       │                     │
       │         ┌───────────┴───────────┐
       │         │                       │
       ▼         ▼                       ▼
┌─────────────┐ ┌─────────────┐   ┌─────────────┐
│Agent Status │ │Task History │   │ Attachments │
└─────────────┘ └─────────────┘   └─────────────┘
       ▲                ▲                ▲
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Comments   │
                 └─────────────┘
```

---

## 🔌 5. API 接口設計概要

### 5.1 認證接口 (Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | 用戶登錄 |
| POST | `/api/auth/logout` | 用戶登出 |
| POST | `/api/auth/refresh` | 刷新 Token |
| GET | `/api/auth/me` | 獲取當前用戶信息 |

### 5.2 任務接口 (Tasks)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | 獲取任務列表 (支持篩選) |
| GET | `/api/tasks/:id` | 獲取任務詳情 |
| POST | `/api/tasks` | 創建新任務 |
| PUT | `/api/tasks/:id` | 更新任務 |
| DELETE | `/api/tasks/:id` | 刪除任務 |
| POST | `/api/tasks/:id/claim` | 領取任務 |
| POST | `/api/tasks/:id/submit` | 提交任務 (進入下一流程) |
| POST | `/api/tasks/:id/status` | 更新任務狀態 |

### 5.3 用戶接口 (Users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | 獲取用戶列表 |
| GET | `/api/users/:id` | 獲取用戶詳情 |
| PUT | `/api/users/:id` | 更新用戶信息 |
| GET | `/api/users/:id/availability` | 獲取用戶空閒狀態 |
| PUT | `/api/users/:id/availability` | 更新用戶空閒狀態 |

### 5.4 Dashboard 接口

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | 獲取儀表板摘要 |
| GET | `/api/dashboard/tasks` | 獲取儀表板任務列表 |
| GET | `/api/dashboard/stats` | 獲取統計數據 |
| GET | `/api/dashboard/agents` | 獲取 Agent 狀態 |

### 5.5 工作流接口 (Workflow)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflow/design-to-dev` | 設計完成，創建開發任務 |
| POST | `/api/workflow/dev-to-qa` | 開發完成，創建 QA 任務 |
| GET | `/api/workflow/pending-assignments` | 獲取待分配任務 |

### 5.6 請求/響應示例

#### 創建任務
```json
// POST /api/tasks
// Request
{
  "title": "首頁 UI 設計",
  "description": "設計產品首頁的 UI 界面",
  "taskType": "design",
  "priority": "high",
  "assignedTo": 2,
  "dueDate": "2026-03-20T23:59:59Z"
}

// Response
{
  "success": true,
  "data": {
    "id": 101,
    "title": "首頁 UI 設計",
    "status": "pending",
    "createdAt": "2026-03-09T16:00:00Z"
  }
}
```

#### 獲取任務列表
```json
// GET /api/tasks?status=in_progress&assignee=3
// Response
{
  "success": true,
  "data": {
    "tasks": [...],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 🛠️ 6. 技術棧建議

### 6.1 前端 (Frontend)

| 技術 | 選項 | 理由 |
|------|------|------|
| **框架** | React 18 + TypeScript | 生態成熟，類型安全，適合中大型項目 |
| **UI 庫** | Ant Design / MUI | 企業級組件豐富，快速開發 |
| **狀態管理** | Zustand / Redux Toolkit | 輕量/功能完整可選 |
| **路由** | React Router v6 | 標準方案 |
| **HTTP 客戶端** | Axios / TanStack Query | API 請求管理 |
| **構建工具** | Vite | 快速開發體驗 |

### 6.2 後端 (Backend)

| 技術 | 選項 | 理由 |
|------|------|------|
| **框架** | Node.js + Express / NestJS | TypeScript 支持好，生態豐富 |
| **替代方案** | Python + FastAPI | 開發速度快，API 友好 |
| **認證** | JWT + bcrypt | 標準方案，無狀態 |
| **驗證** | Zod / Joi | 請求數據驗證 |

### 6.3 數據庫 (Database)

| 技術 | 選項 | 理由 |
|------|------|------|
| **主數據庫** | PostgreSQL | 開源，功能強大，支持複雜查詢 |
| **緩存** | Redis | 會話管理，頻繁讀取數據緩存 |
| **ORM** | Prisma / TypeORM | 類型安全，開發效率高 |

### 6.4 部署 (Deployment)

| 技術 | 選項 | 理由 |
|------|------|------|
| **容器化** | Docker + Docker Compose | 環境一致性 |
| **CI/CD** | GitHub Actions | 與 GitHub 集成好 |
| ** hosting** | VPS / Railway / Render | 根據預算選擇 |

### 6.5 推薦技術棧組合

```
┌─────────────────────────────────────────────────────────┐
│                    推薦技術棧                             │
├─────────────────────────────────────────────────────────┤
│  Frontend:  React 18 + TypeScript + Ant Design + Vite   │
│  Backend:   NestJS + TypeScript + Prisma                │
│  Database:  PostgreSQL + Redis                          │
│  Auth:      JWT + bcrypt                                │
│  Deploy:    Docker + GitHub Actions                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 7. 功能優先級

### Phase 1 - MVP (最小可行產品)
- [ ] 用戶認證系統 (登錄/登出)
- [ ] 任務 CRUD 操作
- [ ] 基礎 Dashboard (任務列表)
- [ ] 任務狀態更新
- [ ] 簡單的任務分配

### Phase 2 - 工作流自動化
- [ ] 設計 → 開發 自動交接
- [ ] 開發 → QA 自動交接
- [ ] Agent 空閒狀態顯示
- [ ] 任務領取機制
- [ ] 任務歷史記錄

### Phase 3 - 增強功能
- [ ] 文件附件上傳
- [ ] 評論系統
- [ ] 通知系統 (郵件/站內)
- [ ] 高級統計圖表
- [ ] 任務搜索和篩選

### Phase 4 - 高級功能
- [ ] 智能任務分配建議
- [ ] 工作負載平衡
- [ ] API 速率限制
- [ ] 審計日誌
- [ ] 多語言支持

---

## 🔐 8. 安全考慮

1. **認證安全**
   - 密碼使用 bcrypt 加密存儲
   - JWT Token 設置合理過期時間
   - 支持 Token 刷新機制

2. **授權控制**
   - 基於角色的訪問控制 (RBAC)
   - Manager 可查看所有任務
   - Agent 只能查看相關任務

3. **數據安全**
   - 敏感數據加密傳輸 (HTTPS)
   - SQL 注入防護 (使用 ORM)
   - XSS 防護 (前端輸入過濾)

4. **API 安全**
   - 速率限制 (Rate Limiting)
   - CORS 配置
   - 請求驗證

---

## 📝 9. 備註

- 系統設計支持擴展，可根據實際需求調整
- Developer2 的支援已納入架構設計
- Agent 空閒狀態通過 `is_available` 和 `current_tasks` 字段管理
- 工作流自動交接通過 `parent_task_id` 關聯實現

---

**設計完成時間:** 2026-03-09  
**下一步:** 通知 Rikkoa 安排 Developer 進行開發
