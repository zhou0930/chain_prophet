# Chain Prophet 前端说明文档

基于 ElizaOS 构建的现代化 AI Agent 对话平台，支持 EVM 区块链功能和 NFT 市场功能。

## 项目概述

本项目是一个基于 Web3.0 的 AI 代理前端应用，集成了 AI Agent 对话、EVM 区块链交互、NFT 市场等多种功能。前端采用 React + TypeScript + Tailwind CSS 构建，提供现代化的用户界面和流畅的用户体验。

## 主要功能

### AI Agent 对话

- 实时与 AI Agent 对话
- 支持多种消息格式（文本、操作、按钮等）
- 实时打字指示器
- 会话管理和状态跟踪
- 对话历史记录
- 会话心跳保持
- 支持多个 AI Agent 切换

### 钱包管理

- 查看钱包地址和余额
- 支持 Sepolia 测试网
- 实时余额显示
- 交易记录查询
- 私钥地址推导
- 钱包状态监控

### NFT 功能

- NFT 市场交易（上架、购买、取消）
- NFT 质押和奖励领取
- NFT 借贷市场
- NFT 持有情况查看
- NFT 元数据管理

### 转账功能

- 以太坊转账
- 地址簿管理
- 交易历史记录

### 地址簿

- 地址保存和管理
- 地址别名设置
- 快速地址查找

## 技术架构

### 前端技术栈

- **React 18**: 用户界面框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Vite**: 构建工具和开发服务器
- **TanStack Query**: 数据获取和状态管理
- **Axios**: HTTP 客户端
- **React Router**: 路由管理
- **Viem**: EVM 区块链交互库
- **Ethers**: 以太坊交互库（部分功能）
- **Socket.io Client**: WebSocket 实时通信
- **Recharts**: 数据可视化
- **Lucide React**: 图标库

### 项目结构

```
frontend/
├── src/
│   ├── components/          # React 组件
│   │   ├── chat/           # 对话相关组件
│   │   │   ├── AgentSelector.tsx      # Agent 选择器
│   │   │   ├── ChatHeader.tsx         # 聊天头部
│   │   │   ├── ChatMessage.tsx        # 消息显示
│   │   │   ├── ConversationHistory.tsx # 对话历史
│   │   │   ├── MessageInput.tsx        # 消息输入
│   │   │   └── TypingIndicator.tsx     # 打字指示器
│   │   ├── wallet/         # 钱包相关组件
│   │   │   ├── EVMBalanceCard.tsx     # 余额卡片
│   │   │   └── TransactionCard.tsx     # 交易卡片
│   │   ├── layouts/        # 布局组件
│   │   │   └── Sidebar.tsx            # 侧边栏
│   │   └── ErrorBoundary.tsx          # 错误边界
│   ├── pages/              # 页面组件
│   │   ├── ChatPage.tsx               # AI 对话页面
│   │   ├── WalletPage.tsx             # 钱包页面
│   │   ├── MyNFTPage.tsx              # 我的 NFT 页面
│   │   ├── NFTMarketplacePage.tsx      # NFT 市场页面
│   │   ├── AddressBookPage.tsx        # 地址簿页面
│   │   └── TransferPage.tsx           # 转账页面
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useChat.ts                 # 聊天功能管理
│   │   ├── useEVM.ts                  # EVM 功能管理
│   │   ├── useNFT.ts                  # NFT 功能管理
│   │   └── useWallet.ts               # 钱包功能管理
│   ├── services/           # API 服务
│   │   ├── api.ts                     # 主 API 服务
│   │   ├── nftService.ts              # NFT 服务
│   │   ├── addressBook.ts             # 地址簿服务
│   │   ├── rpcClient.ts               # RPC 客户端
│   │   ├── rpcCache.ts                # RPC 缓存
│   │   ├── socket.ts                  # Socket 服务
│   │   ├── storage.ts                 # 本地存储
│   │   └── walletStorage.ts           # 钱包存储
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts                   # 类型导出
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── public/                 # 静态资源
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
├── postcss.config.js       # PostCSS 配置
├── env.example             # 环境变量示例
├── start.sh                # 启动脚本
└── README.md               # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 23.3.0
- npm >= 7.0.0 或 yarn >= 1.22.0 或 pnpm >= 7.0.0

### 安装步骤

1. 安装依赖

```bash
cd frontend
npm install
```

2. 配置环境变量

复制环境变量示例文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:3000

# 可选：自定义配置
VITE_APP_NAME=基于 Web3.0 的 AI 代理
VITE_APP_VERSION=1.0.0

# Web3 钱包配置（必需，用于钱包和 NFT 功能）
VITE_WALLET_PRIVATE_KEY=your_private_key_here

# Sepolia 测试网 RPC URL
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_api_key

# Etherscan API Key（可选，用于提高交易记录查询的速率限制）
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key

# NFT 智能合约地址配置（可选，用于 NFT 市场功能）
VITE_NFT_MARKETPLACE_ADDRESS=0x0000000000000000000000000000000000000000
VITE_NFT_STAKING_ADDRESS=0x0000000000000000000000000000000000000000
VITE_NFT_LOAN_ADDRESS=0x0000000000000000000000000000000000000000
```

3. 启动开发服务器

使用启动脚本（推荐）：

```bash
./start.sh
```

或直接使用 npm：

```bash
npm run dev
```

应用将在 http://localhost:3001 启动

### 访问地址

- **前端应用**: http://localhost:3001
- **后端 API**: http://localhost:3000

## 功能使用说明

### AI 对话功能

1. 进入应用后，默认显示 AI 对话页面
2. 选择或切换 AI Agent
3. 点击"开始对话"按钮创建新会话
4. 在输入框中输入消息并发送
5. Agent 会实时回复消息
6. 可以查看对话历史记录
7. 可以结束当前会话

### 钱包功能

1. 点击侧边栏的"钱包"菜单进入钱包页面
2. 查看钱包地址（从配置的私钥推导）
3. 查看钱包余额（Sepolia 测试网 ETH）
4. 查看最近的交易记录
5. 所有操作需要先在 `.env` 文件中配置 `VITE_WALLET_PRIVATE_KEY`

### NFT 市场功能

1. 点击侧边栏的"NFT 市场"菜单
2. 市场交易标签：
   - 上架 NFT：输入 Token ID 和价格，点击"上架"
   - 购买 NFT：输入 Token ID 和价格，点击"购买"
   - 取消上架：取消已上架的 NFT
3. 质押标签：
   - 质押 NFT：输入 Token ID，点击"质押"
   - 解除质押：解除已质押的 NFT
   - 领取奖励：领取质押产生的奖励
4. 借贷标签：
   - 创建借贷：输入 Token ID、借贷金额和期限，点击"创建借贷"
   - 出借资金：为 NFT 借贷市场提供流动性
   - 还款：归还借贷并赎回抵押的 NFT

注意：使用 NFT 功能需要先部署相应的智能合约，并在 `.env` 文件中配置合约地址。

### 我的 NFT 页面

1. 点击侧边栏的"我的 NFT"菜单
2. 查看您持有的所有 NFT
3. 查看每个 NFT 的详细信息
4. 对 NFT 进行管理操作

### 地址簿功能

1. 点击侧边栏的"地址簿"菜单
2. 添加新地址：输入地址和名称（可选）
3. 编辑地址：修改地址或名称
4. 删除地址：移除不需要的地址
5. 地址簿数据保存在本地存储中

### 转账功能

1. 点击侧边栏的"转账"菜单
2. 输入接收地址（可以从地址簿选择）
3. 输入转账金额（ETH）
4. 确认并发送交易
5. 查看交易状态和历史记录

## API 接口

### 会话管理

- `POST /api/messaging/sessions` - 创建新会话
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

## 组件说明

### 核心组件

#### ChatMessage

消息显示组件，支持多种消息格式：
- 文本消息
- 操作消息（执行中、完成、失败）
- 按钮消息
- 元数据展示

#### MessageInput

消息输入组件，提供：
- 文本输入框
- 发送按钮
- 输入验证
- 快捷键支持（Enter 发送）

#### AgentSelector

Agent 选择组件，提供：
- Agent 列表展示
- Agent 切换功能
- Agent 状态显示

#### EVMBalanceCard

EVM 余额显示卡片，显示：
- 钱包地址
- 当前余额
- 网络信息
- 刷新功能

#### ChatHeader

聊天头部组件，提供：
- 会话信息显示
- 操作按钮（结束会话、刷新等）
- 状态指示器

### 自定义 Hooks

#### useChat

聊天功能管理 Hook，提供：
- 消息管理
- 会话管理
- Agent 列表获取
- 消息发送和接收
- 心跳保持

#### useEVM

EVM 功能管理 Hook，提供：
- 余额查询
- 地址验证
- 网络信息获取

#### useNFT

NFT 功能管理 Hook，提供：
- NFT 列表获取
- NFT 市场操作（上架、购买）
- NFT 质押操作
- NFT 借贷操作

#### useWallet

钱包功能管理 Hook，提供：
- 钱包地址获取
- 余额查询
- 交易记录查询
- 钱包状态管理

## 开发指南

### 添加新功能

1. 在 `src/types/` 中定义相关类型
2. 在 `src/services/` 中添加 API 调用服务
3. 在 `src/hooks/` 中创建自定义 Hook（如需要）
4. 在 `src/components/` 中创建组件
5. 在 `src/pages/` 中创建页面（如需要）
6. 在 `App.tsx` 中添加路由（如需要）

### 样式开发

使用 Tailwind CSS 进行样式开发：

```tsx
// 主要按钮
<button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">

// 次要按钮
<button className="px-4 py-2 bg-secondary-200 text-secondary-900 rounded-md hover:bg-secondary-300">

// 卡片容器
<div className="bg-white border border-secondary-200 rounded-lg p-4 shadow-sm">
```

### 状态管理

- 使用 TanStack Query 进行服务器状态管理
- 使用 React Hooks 进行本地状态管理
- 使用 localStorage 进行持久化存储

### 错误处理

- 使用 ErrorBoundary 组件捕获 React 错误
- API 调用使用 try-catch 处理错误
- 显示友好的错误提示信息

## 构建和部署

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

### 部署说明

1. 构建生产版本
2. 将 `dist/` 目录部署到静态文件服务器
3. 配置环境变量（生产环境）
4. 确保后端 API 可访问

## 故障排除

### 常见问题

1. **无法连接到后端**
   - 检查后端服务是否在 3000 端口运行
   - 确认 `VITE_API_BASE_URL` 配置正确
   - 检查网络连接和防火墙设置

2. **EVM 查询失败**
   - 检查地址格式是否正确（0x 开头的 42 位十六进制字符串）
   - 确认网络连接正常
   - 检查 RPC 节点是否可用

3. **Agent 无响应**
   - 检查后端日志
   - 确认 OpenAI API 密钥配置正确
   - 检查会话状态是否正常

4. **钱包功能不可用**
   - 确认已在 `.env` 文件中配置 `VITE_WALLET_PRIVATE_KEY`
   - 检查私钥格式是否正确
   - 重启开发服务器使配置生效

5. **NFT 市场功能不可用**
   - 确认已部署相应的智能合约
   - 检查合约地址配置是否正确
   - 确认钱包中有足够的 ETH 支付 Gas 费用
   - 参考 `NFT_MARKETPLACE_SETUP.md` 进行详细配置

6. **交易失败**
   - 检查钱包余额是否足够支付 Gas 费用
   - 确认网络连接正常
   - 检查交易参数是否正确
   - 查看浏览器控制台错误信息

### 调试方法

```bash
# 查看后端日志
bun run dev

# 查看前端日志
cd frontend && npm run dev

# 检查环境变量
cat frontend/.env
```

## 安全注意事项

1. **私钥安全**
   - 永远不要将私钥提交到 Git 仓库
   - 永远不要在公共场合分享私钥
   - 建议使用测试网私钥进行开发
   - 主网私钥应保存在安全的地方

2. **环境变量**
   - `.env` 文件已添加到 `.gitignore`
   - 生产环境使用环境变量管理工具
   - 不要在代码中硬编码敏感信息

3. **API 密钥**
   - Etherscan API Key 等密钥应妥善保管
   - 不要在前端代码中暴露 API 密钥
   - 使用后端代理访问敏感 API

## 技术文档

- [ElizaOS 官方文档](https://docs.elizaos.ai/)
- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Viem 文档](https://viem.sh/)
- [TanStack Query 文档](https://tanstack.com/query/latest)

**注意**: 这是一个基于 ElizaOS 的演示项目，展示了如何构建一个支持 EVM 功能和 NFT 市场的 AI Agent 对话平台。请确保在生产环境中进行适当的安全配置和测试。
