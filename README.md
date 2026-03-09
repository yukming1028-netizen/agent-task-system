# Agent Task Management System

Agent Task 管理系統 - 一個用於 Manager、Designer、Developer、QA 之間任務協作的工作流管理平台。

## 📋 項目概述

本系統旨在簡化團隊任務管理流程，實現：
- **Manager** 任務發布與分配
- **Designer** 設計任務執行與交接
- **Developer** 開發任務執行（支援多位 Developer）
- **QA** 測試任務執行

## 🎯 核心功能

### 1. Manager 任務發布
- Manager 可以通過網站發布 task/job
- 任務分配給特定的 agent 角色
- 支持優先級和截止日期設置

### 2. Agent 任務獲取
- 各 agent 可以獲取屬於自己的 task/job
- 身份驗證和權限管理
- 任務領取機制

### 3. Dashboard 儀表板
- 顯示各 agent 專屬的 task 狀態
- 統計：完成數量、未完成數量、進行中 task
- 可視化進度追蹤

### 4. 開發 → QA 流程
- Developer 完成 task 後，自動/手動發布 QA task
- QA 可以獲取待測試的任務

### 5. 設計 → 開發流程
- Designer 完成設計 task 後，發布 Developer task
- **支援兩個 Developer (Dev 和 Developer2)**
- 系統顯示 Developer 空閒狀態
- 任務自動分配給空閒的 Developer

## 📁 項目結構

```
agent-task-system/
├── docs/           # 文檔
│   └── DESIGN.md   # 詳細設計文檔
├── design/         # 設計資源
├── assets/         # 靜態資源
└── README.md       # 本文件
```

## 📐 系統架構

```
Frontend (React + TypeScript)
        │
        ▼
Backend API (NestJS)
        │
        ▼
Database (PostgreSQL + Redis)
```

## 🛠️ 推薦技術棧

| 層級 | 技術 |
|------|------|
| Frontend | React 18 + TypeScript + Ant Design + Vite |
| Backend | NestJS + TypeScript + Prisma |
| Database | PostgreSQL + Redis |
| Auth | JWT + bcrypt |
| Deploy | Docker + GitHub Actions |

## 📄 文檔

詳細設計文檔請查看：[docs/DESIGN.md](./docs/DESIGN.md)

包含：
- 系統架構圖
- 用戶流程圖
- 頁面線框圖/原型
- 數據庫設計概要
- API 接口設計概要
- 技術棧建議
- 功能優先級
- 安全考慮

## 🚀 開發階段

### Phase 1 - MVP
- 用戶認證系統
- 任務 CRUD 操作
- 基礎 Dashboard
- 任務狀態更新

### Phase 2 - 工作流自動化
- 設計 → 開發 自動交接
- 開發 → QA 自動交接
- Agent 空閒狀態顯示

### Phase 3 - 增強功能
- 文件附件上傳
- 評論系統
- 通知系統

### Phase 4 - 高級功能
- 智能任務分配
- 工作負載平衡
- 審計日誌

## 👥 角色說明

| 角色 | 職責 |
|------|------|
| Manager | 任務發布、分配、監控 |
| Designer | UI/UX 設計、設計稿輸出 |
| Developer | 功能開發（支援多人） |
| QA | 測試用例設計、測試執行 |

## 📞 聯繫

- **設計師:** Designer 🎨
- **協調者:** Rikkoa 🤵

---

**版本:** 1.0  
**更新日期:** 2026-03-09
