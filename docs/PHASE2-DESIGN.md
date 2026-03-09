# Phase 2 - 工作流自動化 詳細設計

**版本:** 1.0  
**日期:** 2026-03-09  
**設計師:** Designer 🎨

---

## 📋 Phase 2 範圍

1. **設計 → 開發 自動交接**
2. **開發 → QA 自動交接**
3. **Agent 空閒狀態顯示**
4. **任務領取機制**
5. **任務歷史記錄**

---

## 1️⃣ 設計 → 開發 自動交接

### 1.1 流程圖

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Designer     │────▶│ 系統自動     │────▶│ 檢查 Developer │
│ 標記設計完成  │     │ 觸發工作流   │     │ 空閒狀態     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
                    ▼                             ▼                             ▼
           ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
           │ Dev 空閒     │              │ Developer2   │              │ 兩者皆忙     │
           │ 自動分配     │              │ 空閒自動分配  │              │ 加入等待隊列  │
           └──────────────┘              └──────────────┘              └──────────────┘
                    │                             │                             │
                    └─────────────────────────────┴─────────────────────────────┘
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │ 創建開發任務  │
                                         │ 狀態：pending│
                                         └──────────────┘
```

### 1.2 API 接口

```typescript
// POST /api/workflow/design-to-dev
// Request
{
  "designTaskId": 101
}

// Response
{
  "success": true,
  "data": {
    "devTaskId": 102,
    "assignedTo": "dev",           // 或 "developer2" 或 null(等待隊列)
    "status": "pending",
    "createdAt": "2026-03-09T17:00:00Z"
  }
}
```

### 1.3 業務邏輯

```typescript
// WorkflowService.designToDev(designTaskId)

async designToDev(designTaskId: number): Promise<DevTask> {
  // 1. 驗證設計任務狀態
  const designTask = await this.taskService.findById(designTaskId);
  if (designTask.status !== 'completed') {
    throw new Error('設計任務未完成');
  }

  // 2. 檢查 Developer 空閒狀態
  const availableDev = await this.getAvailableDeveloper();
  
  // 3. 創建開發任務
  const devTask = await this.taskService.create({
    title: designTask.title + ' - 開發',
    description: designTask.description,
    taskType: 'development',
    parentTaskId: designTaskId,
    assignedTo: availableDev?.id,
    status: availableDev ? 'pending' : 'waiting',
  });

  // 4. 更新設計任務狀態
  await this.taskService.update(designTaskId, { status: 'handed_off' });

  // 5. 記錄歷史
  await this.historyService.record({
    taskId: devTask.id,
    action: 'workflow_handoff',
    from: 'design',
    to: 'development',
  });

  return devTask;
}

// 獲取空閒 Developer
async getAvailableDeveloper(): Promise<User | null> {
  const devs = await this.userService.findByRole('developer');
  
  // 過濾空閒的 Developer (current_tasks < max_tasks)
  const available = devs.filter(d => d.isAvailable && d.currentTasks < d.maxTasks);
  
  if (available.length === 0) return null;
  
  // 選擇任務數最少的 Developer (負載均衡)
  return available.sort((a, b) => a.currentTasks - b.currentTasks)[0];
}
```

### 1.4 數據庫字段

```sql
-- Tasks 表新增字段
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN workflow_stage VARCHAR(20) DEFAULT 'design'; 
-- design / development / qa

-- Agent 狀態追蹤
UPDATE users SET current_tasks = 0, max_tasks = 5 WHERE role = 'developer';
```

---

## 2️⃣ 開發 → QA 自動交接

### 2.1 流程圖

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Developer    │────▶│ 系統自動     │────▶│ 創建 QA 任務  │
│ 標記開發完成  │     │ 觸發工作流   │     │ 狀態：pending│
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │ QA 獲取任務  │
                                         │ (手動領取)    │
                                         └──────────────┘
```

### 2.2 API 接口

```typescript
// POST /api/workflow/dev-to-qa
// Request
{
  "devTaskId": 102
}

// Response
{
  "success": true,
  "data": {
    "qaTaskId": 103,
    "status": "pending",
    "createdAt": "2026-03-09T17:30:00Z"
  }
}
```

### 2.3 業務邏輯

```typescript
// WorkflowService.devToQa(devTaskId)

async devToQa(devTaskId: number): Promise<QaTask> {
  // 1. 驗證開發任務狀態
  const devTask = await this.taskService.findById(devTaskId);
  if (devTask.status !== 'completed') {
    throw new Error('開發任務未完成');
  }

  // 2. 創建 QA 任務
  const qaTask = await this.taskService.create({
    title: devTask.title + ' - QA 測試',
    description: devTask.description,
    taskType: 'qa',
    parentTaskId: devTaskId,
    assignedTo: null,  // QA 手動領取
    status: 'pending',
  });

  // 3. 更新開發任務狀態
  await this.taskService.update(devTaskId, { status: 'handed_off' });

  // 4. 記錄歷史
  await this.historyService.record({
    taskId: qaTask.id,
    action: 'workflow_handoff',
    from: 'development',
    to: 'qa',
  });

  return qaTask;
}
```

---

## 3️⃣ Agent 空閒狀態顯示

### 3.1 狀態定義

| 狀態 | 代碼 | 顯示 | 條件 |
|------|------|------|------|
| 空閒 | `available` | 🟢 | `isAvailable=true` 且 `currentTasks < maxTasks` |
| 忙碌 | `busy` | 🟡 | `isAvailable=true` 且 `currentTasks >= maxTasks` |
| 離線 | `offline` | 🔴 | `isAvailable=false` |

### 3.2 API 接口

```typescript
// GET /api/dashboard/agents
// Response
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": 1,
        "name": "Designer",
        "role": "designer",
        "status": "available",
        "currentTasks": 1,
        "maxTasks": 5,
        "lastActive": "2026-03-09T17:00:00Z"
      },
      {
        "id": 2,
        "name": "Dev",
        "role": "developer",
        "status": "busy",
        "currentTasks": 5,
        "maxTasks": 5,
        "lastActive": "2026-03-09T16:55:00Z"
      },
      {
        "id": 3,
        "name": "Developer2",
        "role": "developer",
        "status": "available",
        "currentTasks": 2,
        "maxTasks": 5,
        "lastActive": "2026-03-09T17:01:00Z"
      },
      {
        "id": 4,
        "name": "QA",
        "role": "qa",
        "status": "available",
        "currentTasks": 0,
        "maxTasks": 5,
        "lastActive": "2026-03-09T16:50:00Z"
      }
    ]
  }
}
```

### 3.3 前端組件

```tsx
// AgentStatusCard.tsx

interface AgentStatus {
  id: number;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'offline';
  currentTasks: number;
  maxTasks: number;
}

const AgentStatusCard: React.FC<{ agent: AgentStatus }> = ({ agent }) => {
  const statusIcon = {
    available: '🟢',
    busy: '🟡',
    offline: '🔴',
  }[agent.status];

  return (
    <div className="agent-card">
      <div className="agent-header">
        <span className="status-icon">{statusIcon}</span>
        <span className="agent-name">{agent.name}</span>
        <span className="agent-role">{agent.role}</span>
      </div>
      <div className="agent-tasks">
        任務：{agent.currentTasks} / {agent.maxTasks}
      </div>
      <div className="agent-progress">
        <progress value={agent.currentTasks} max={agent.maxTasks} />
      </div>
    </div>
  );
};
```

### 3.4 狀態更新邏輯

```typescript
// 當任務分配時自動更新
async assignTask(taskId: number, userId: number): Promise<void> {
  await this.taskService.update(taskId, { assignedTo: userId });
  await this.userService.incrementTaskCount(userId);
}

// 當任務完成時自動更新
async completeTask(taskId: number): Promise<void> {
  const task = await this.taskService.findById(taskId);
  await this.taskService.update(taskId, { status: 'completed' });
  await this.userService.decrementTaskCount(task.assignedTo);
}
```

---

## 4️⃣ 任務領取機制

### 4.1 流程圖

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Agent 登錄   │────▶│ 查看可用任務  │────▶│ 點擊領取任務  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │ 檢查資格     │
                                         │ (角色匹配)   │
                                         └──────────────┘
                                                  │
                              ┌───────────────────┴───────────────────┐
                              │                                       │
                              ▼                                       ▼
                     ┌──────────────┐                        ┌──────────────┐
                     │ 資格符合     │                        │ 資格不符     │
                     │ 領取成功     │                        │ 顯示錯誤     │
                     └──────────────┘                        └──────────────┘
                              │
                              ▼
                     ┌──────────────┐
                     │ 更新任務狀態  │
                     │ in_progress  │
                     └──────────────┘
```

### 4.2 API 接口

```typescript
// POST /api/tasks/:id/claim
// Request
{
  "taskId": 103
}

// Response - 成功
{
  "success": true,
  "data": {
    "taskId": 103,
    "assignedTo": 4,
    "status": "in_progress",
    "claimedAt": "2026-03-09T17:30:00Z"
  }
}

// Response - 失敗 (已被領取)
{
  "success": false,
  "error": {
    "code": "TASK_ALREADY_CLAIMED",
    "message": "任務已被其他 Agent 領取"
  }
}

// Response - 失敗 (角色不符)
{
  "success": false,
  "error": {
    "code": "ROLE_MISMATCH",
    "message": "您的角色不符合此任務要求"
  }
}
```

### 4.3 業務邏輯

```typescript
// TaskService.claim(taskId, userId)

async claim(taskId: number, userId: number): Promise<Task> {
  const task = await this.taskService.findById(taskId);
  const user = await this.userService.findById(userId);

  // 1. 檢查任務狀態
  if (task.status !== 'pending') {
    throw new Error('任務不可領取');
  }

  // 2. 檢查是否已被領取
  if (task.assignedTo !== null) {
    throw new ConflictException('TASK_ALREADY_CLAIMED');
  }

  // 3. 檢查角色匹配
  const roleTaskTypeMap = {
    designer: 'design',
    developer: 'development',
    qa: 'qa',
  };
  if (roleTaskTypeMap[user.role] !== task.taskType) {
    throw new ForbiddenException('ROLE_MISMATCH');
  }

  // 4. 檢查用戶負載
  if (user.currentTasks >= user.maxTasks) {
    throw new Error('已達最大任務數');
  }

  // 5. 領取任務
  await this.taskService.update(taskId, {
    assignedTo: userId,
    status: 'in_progress',
  });

  await this.userService.incrementTaskCount(userId);

  // 6. 記錄歷史
  await this.historyService.record({
    taskId,
    userId,
    action: 'claimed',
  });

  return this.taskService.findById(taskId);
}
```

### 4.4 前端實現

```tsx
// AvailableTasksList.tsx

const AvailableTasksList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  const handleClaim = async (taskId: number) => {
    try {
      const response = await api.post(`/api/tasks/${taskId}/claim`);
      if (response.success) {
        message.success('任務領取成功');
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (error) {
      if (error.code === 'TASK_ALREADY_CLAIMED') {
        message.error('任務已被其他 Agent 領取');
      } else if (error.code === 'ROLE_MISMATCH') {
        message.error('您的角色不符合此任務要求');
      } else {
        message.error('領取失敗，請稍後再試');
      }
    }
  };

  return (
    <div className="available-tasks">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task}>
          <button onClick={() => handleClaim(task.id)}>
            🟢 領取任務
          </button>
        </TaskCard>
      ))}
    </div>
  );
};
```

---

## 5️⃣ 任務歷史記錄

### 5.1 數據表設計

```sql
CREATE TABLE task_history (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER NOT NULL REFERENCES tasks(id),
    user_id         INTEGER REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,
    old_value       VARCHAR(255),
    new_value       VARCHAR(255),
    comment         TEXT,
    metadata        JSONB,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_task_history_user_id ON task_history(user_id);
CREATE INDEX idx_task_history_created_at ON task_history(created_at);
```

### 5.2 動作類型

| 動作 | 說明 | 記錄內容 |
|------|------|----------|
| `created` | 任務創建 | 創建人、初始狀態 |
| `assigned` | 任務分配 | 分配給誰 |
| `claimed` | 任務領取 | 領取人 |
| `status_changed` | 狀態變更 | 舊狀態 → 新狀態 |
| `workflow_handoff` | 工作流交接 | 從 X 階段到 Y 階段 |
| `commented` | 添加評論 | 評論內容 |
| `completed` | 任務完成 | 完成時間 |
| `cancelled` | 任務取消 | 取消原因 |

### 5.3 API 接口

```typescript
// GET /api/tasks/:id/history
// Response
{
  "success": true,
  "data": {
    "history": [
      {
        "id": 1,
        "taskId": 101,
        "userId": 1,
        "userName": "Manager",
        "action": "created",
        "oldValue": null,
        "newValue": "pending",
        "comment": null,
        "createdAt": "2026-03-09T16:00:00Z"
      },
      {
        "id": 2,
        "taskId": 101,
        "userId": 2,
        "userName": "Designer",
        "action": "claimed",
        "oldValue": null,
        "newValue": null,
        "comment": null,
        "createdAt": "2026-03-09T16:05:00Z"
      },
      {
        "id": 3,
        "taskId": 101,
        "userId": 2,
        "userName": "Designer",
        "action": "status_changed",
        "oldValue": "pending",
        "newValue": "in_progress",
        "comment": "開始設計",
        "createdAt": "2026-03-09T16:06:00Z"
      },
      {
        "id": 4,
        "taskId": 101,
        "userId": 2,
        "userName": "Designer",
        "action": "completed",
        "oldValue": "in_progress",
        "newValue": "completed",
        "comment": "設計完成，準備交接",
        "createdAt": "2026-03-09T17:00:00Z"
      },
      {
        "id": 5,
        "taskId": 101,
        "userId": null,
        "userName": "System",
        "action": "workflow_handoff",
        "oldValue": "design",
        "newValue": "development",
        "comment": "自動交接至開發階段",
        "createdAt": "2026-03-09T17:00:01Z"
      }
    ]
  }
}
```

### 5.4 前端時間線組件

```tsx
// TaskTimeline.tsx

interface HistoryItem {
  id: number;
  userName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  createdAt: string;
}

const actionLabels = {
  created: '創建',
  assigned: '分配',
  claimed: '領取',
  status_changed: '狀態變更',
  workflow_handoff: '工作流交接',
  commented: '評論',
  completed: '完成',
  cancelled: '取消',
};

const TaskTimeline: React.FC<{ history: HistoryItem[] }> = ({ history }) => {
  return (
    <div className="task-timeline">
      {history.map((item, index) => (
        <div key={item.id} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="user-name">{item.userName}</span>
              <span className="action-label">{actionLabels[item.action]}</span>
              <span className="timestamp">
                {formatTime(item.createdAt)}
              </span>
            </div>
            {item.comment && (
              <div className="timeline-comment">{item.comment}</div>
            )}
            {item.oldValue && item.newValue && (
              <div className="timeline-change">
                {item.oldValue} → {item.newValue}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 5.5 歷史記錄服務

```typescript
// HistoryService

async record(data: {
  taskId: number;
  userId?: number;
  action: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  metadata?: object;
}): Promise<void> {
  await this.db.taskHistory.create({
    data: {
      taskId: data.taskId,
      userId: data.userId,
      action: data.action,
      oldValue: data.oldValue,
      newValue: data.newValue,
      comment: data.comment,
      metadata: data.metadata,
    },
  });
}

// 自動記錄裝飾器
function RecordHistory(action: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      await this.historyService.record({
        taskId: args[0],
        userId: this.currentUser?.id,
        action,
      });
      return result;
    };
  };
}
```

---

## 📊 Phase 2 數據庫變更總結

```sql
-- 1. Tasks 表新增字段
ALTER TABLE tasks 
  ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id),
  ADD COLUMN workflow_stage VARCHAR(20) DEFAULT 'design';

-- 2. 創建任務歷史表
CREATE TABLE task_history (
    id              SERIAL PRIMARY KEY,
    task_id         INTEGER NOT NULL REFERENCES tasks(id),
    user_id         INTEGER REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,
    old_value       VARCHAR(255),
    new_value       VARCHAR(255),
    comment         TEXT,
    metadata        JSONB,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 創建索引
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_task_history_user_id ON task_history(user_id);
CREATE INDEX idx_tasks_workflow_stage ON tasks(workflow_stage);
CREATE INDEX idx_tasks_parent_task ON tasks(parent_task_id);
```

---

## 🔧 Phase 2 開發建議

### 優先級

1. **任務歷史記錄** - 基礎設施，其他功能依賴
2. **Agent 空閒狀態顯示** - Dashboard 核心功能
3. **任務領取機制** - Agent 核心功能
4. **開發 → QA 自動交接** - 工作流
5. **設計 → 開發 自動交接** - 工作流 (含負載均衡)

### 測試要點

- [ ] 工作流交接時任務狀態正確更新
- [ ] Agent 空閒狀態實時更新
- [ ] 任務領取時角色驗證正確
- [ ] 歷史記錄完整準確
- [ ] 多 Developer 負載均衡正確

---

**設計版本:** 1.0  
**設計時間:** 2026-03-09  
**設計師:** Designer 🎨
