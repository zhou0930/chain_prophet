# Chain Prophet Frontend

基于 ElizaOS 的 AI Agent 对话前端应用，支持 EVM 插件功能。

## 功能特性

- 🤖 与 AI Agent 实时对话
- 💰 EVM 钱包余额查询
- 🔐 支持私钥推导地址查询
- 🌐 多区块链网络支持
- 📱 响应式设计
- ⚡ 实时消息传递
- 🎨 现代化 UI 界面

## 技术栈

- React 18
- TypeScript
- Tailwind CSS
- Vite
- TanStack Query
- Axios
- Viem (EVM 交互)

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `env.example` 到 `.env` 并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Chain Prophet
VITE_APP_VERSION=1.0.0
```

### 3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

应用将在 http://localhost:3001 启动

### 4. 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 使用说明

### 基本对话

1. 选择一个 AI Agent
2. 点击"开始对话"按钮
3. 在输入框中输入消息
4. Agent 会实时回复

### EVM 功能

#### 查询钱包余额

发送包含以太坊地址的消息：

```
查询我的钱包余额 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

#### 使用私钥查询

发送包含私钥的消息：

```
根据私钥查询余额 0x03d8cc33a97cf07b554289f89267d3b01369b867f861cedcb46f1f98c898d8c5
```

### 支持的查询格式

- `查询余额 [地址]`
- `check balance [地址]`
- `钱包余额 [地址]`
- `根据私钥查询余额 [私钥]`

## API 接口

前端通过以下 API 与后端通信：

### 会话管理

- `POST /api/messaging/sessions` - 创建会话
- `POST /api/messaging/sessions/:id/messages` - 发送消息
- `GET /api/messaging/sessions/:id/messages` - 获取消息历史
- `POST /api/messaging/sessions/:id/renew` - 续期会话
- `POST /api/messaging/sessions/:id/heartbeat` - 发送心跳

### Agent 管理

- `GET /api/agents` - 获取 Agent 列表
- `GET /api/agents/:id` - 获取特定 Agent 信息

### EVM 功能

- `POST /api/evm/balance` - 查询余额
- `GET /api/evm/chains` - 获取支持的链

## 项目结构

```
frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── ChatMessage.tsx
│   │   ├── MessageInput.tsx
│   │   ├── AgentSelector.tsx
│   │   ├── EVMBalanceCard.tsx
│   │   └── ...
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useChat.ts
│   │   └── useEVM.ts
│   ├── services/           # API 服务
│   │   └── api.ts
│   ├── types/              # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx             # 主应用组件
│   └── main.tsx            # 应用入口
├── public/                 # 静态资源
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 开发指南

### 添加新功能

1. 在 `src/types/` 中定义类型
2. 在 `src/services/api.ts` 中添加 API 调用
3. 在 `src/hooks/` 中创建自定义 Hook
4. 在 `src/components/` 中创建组件
5. 在 `App.tsx` 中集成功能

### 样式指南

使用 Tailwind CSS 类名：

```tsx
// 主要按钮
<button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">

// 次要按钮
<button className="px-4 py-2 bg-secondary-200 text-secondary-900 rounded-md hover:bg-secondary-300">

// 卡片容器
<div className="bg-white border border-secondary-200 rounded-lg p-4 shadow-sm">
```

## 故障排除

### 常见问题

1. **无法连接到后端**
   - 检查 `VITE_API_BASE_URL` 配置
   - 确认后端服务正在运行

2. **EVM 查询失败**
   - 检查地址格式是否正确
   - 确认网络连接正常

3. **Agent 无响应**
   - 检查会话状态
   - 尝试重新创建会话

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
