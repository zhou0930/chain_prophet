# Chain Prophet - AI Agent 对话前端

基于 ElizaOS 构建的现代化 AI Agent 对话平台，支持 EVM 插件功能。

## 🎯 项目概述

本项目为您创建了一个全新的前端应用，用于与 AI Agent 进行对话并支持 EVM 区块链功能。前端采用 React + TypeScript + Tailwind CSS 构建，提供现代化的用户界面和流畅的用户体验。

## ✨ 主要功能

### 🤖 AI Agent 对话
- 实时与 AI Agent 对话
- 支持多种消息格式
- 实时打字指示器
- 会话管理和状态跟踪

### 💰 EVM 区块链功能
- 查询钱包 ETH 余额
- 支持私钥推导地址
- 支持 Sepolia 测试网
- 实时余额显示

### 🎨 现代化 UI
- 响应式设计，支持移动端
- 深色/浅色主题
- 流畅的动画效果
- 直观的用户界面

## 🚀 快速开始

### 一键启动（推荐）

```bash
# 在项目根目录运行
./start-fullstack.sh
```

这将同时启动后端和前端服务。

### 分别启动

#### 1. 启动后端
```bash
bun run dev
```

#### 2. 启动前端
```bash
cd frontend
./start.sh
```

## 📍 访问地址

- **前端应用**: http://localhost:3001
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health

## 🛠️ 技术架构

### 后端技术栈
- **ElizaOS**: AI Agent 框架
- **TypeScript**: 类型安全
- **Viem**: EVM 区块链交互
- **Express**: API 服务器

### 前端技术栈
- **React 18**: 用户界面框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Vite**: 构建工具
- **TanStack Query**: 数据获取
- **Axios**: HTTP 客户端

## 📁 项目结构

```
chain_prophet/
├── src/                          # 后端代码
│   ├── api-routes.ts            # API 路由定义
│   ├── plugin.ts                # 主插件文件
│   ├── evm-balance-plugin.ts    # EVM 余额插件
│   └── index.ts                 # 入口文件
├── frontend/                     # 前端代码
│   ├── src/
│   │   ├── components/          # React 组件
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── AgentSelector.tsx
│   │   │   ├── EVMBalanceCard.tsx
│   │   │   └── ChatHeader.tsx
│   │   ├── hooks/               # 自定义 Hooks
│   │   │   ├── useChat.ts
│   │   │   └── useEVM.ts
│   │   ├── services/            # API 服务
│   │   │   └── api.ts
│   │   ├── types/               # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── App.tsx              # 主应用组件
│   │   └── main.tsx             # 应用入口
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── start-fullstack.sh           # 一键启动脚本
└── FRONTEND_SETUP.md            # 详细设置指南
```

## 🔧 环境配置

### 后端环境变量（已配置）
```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.chatanywhere.tech/v1
EVM_PRIVATE_KEY=0x03d8cc33a97cf07b554289f89267d3b01369b867f861cedcb46f1f98c898d8c5
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/443ab1c362d646dcaa353c5b653c8173
```

### 前端环境变量（自动创建）
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Chain Prophet
VITE_APP_VERSION=1.0.0
```

## 💡 使用示例

### 基本对话
1. 选择 AI Agent
2. 点击"开始对话"
3. 输入消息进行对话

### EVM 功能使用

#### 查询钱包余额
```
查询我的钱包余额 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

#### 使用私钥查询
```
根据私钥查询余额 0x03d8cc33a97cf07b554289f89267d3b01369b867f861cedcb46f1f98c898d8c5
```

## 🔌 API 接口

### 会话管理
- `POST /api/messaging/sessions` - 创建会话
- `POST /api/messaging/sessions/:id/messages` - 发送消息
- `GET /api/messaging/sessions/:id/messages` - 获取消息历史

### Agent 管理
- `GET /api/agents` - 获取 Agent 列表
- `GET /api/agents/:id` - 获取特定 Agent 信息

### EVM 功能
- `POST /api/evm/balance` - 查询余额
- `GET /api/evm/chains` - 获取支持的链

## 🎨 UI 组件

### 核心组件
- **ChatMessage**: 消息显示组件
- **MessageInput**: 消息输入组件
- **AgentSelector**: Agent 选择组件
- **EVMBalanceCard**: EVM 余额显示卡片
- **ChatHeader**: 聊天头部组件

### 自定义 Hooks
- **useChat**: 聊天功能管理
- **useEVM**: EVM 功能管理

## 🔍 故障排除

### 常见问题

1. **前端无法连接后端**
   - 检查后端是否在 3000 端口运行
   - 确认 `VITE_API_BASE_URL` 配置正确

2. **EVM 查询失败**
   - 检查网络连接
   - 确认地址格式正确

3. **Agent 无响应**
   - 检查 OpenAI API 密钥配置
   - 查看后端日志

### 调试方法

```bash
# 查看后端日志
bun run dev

# 查看前端日志
cd frontend && npm run dev

# 检查 API 健康状态
curl http://localhost:3000/api/health
```

## 🚀 部署说明

### 开发环境
```bash
./start-fullstack.sh
```

### 生产环境
```bash
# 构建前端
cd frontend && npm run build

# 启动后端
bun run start
```

## 📈 功能扩展

### 已实现功能
- ✅ AI Agent 对话
- ✅ EVM 余额查询
- ✅ 私钥地址推导
- ✅ 实时消息传递
- ✅ 响应式 UI

### 可扩展功能
- 🔄 更多 EVM 功能（交易查询、合约交互）
- 🔄 支持更多区块链网络
- 🔄 用户认证系统
- 🔄 消息持久化
- 🔄 更多 AI Agent 类型

## 📚 相关文档

- [ElizaOS 官方文档](https://docs.elizaos.ai/)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Viem 文档](https://viem.sh/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📄 许可证

MIT License

---

**注意**: 这是一个基于 ElizaOS 的演示项目，展示了如何构建一个支持 EVM 功能的 AI Agent 对话平台。请确保在生产环境中进行适当的安全配置和测试。
