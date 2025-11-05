# Chain Prophet

基于 ElizaOS 构建的现代化 AI Agent 对话平台，支持 EVM 区块链功能和 NFT 市场功能。

## 项目概述

Chain Prophet 是一个集成了 AI Agent 对话、EVM 区块链交互、NFT 市场等多种功能的 Web3.0 应用。项目采用前后端分离架构，后端基于 ElizaOS 框架，前端采用 React + TypeScript 构建。

### 主要特性

- AI Agent 实时对话，支持多种消息格式和会话管理
- EVM 区块链交互，包括余额查询、转账等功能
- NFT 市场功能，支持上架、购买、质押、借贷等操作
- 钱包管理，支持私钥管理和地址簿
- 响应式 UI，现代化用户界面
- 实时消息传递，基于 WebSocket 通信

## 环境要求

### 必需环境

- **操作系统**：Linux 或 macOS（Windows 用户需要使用 WSL）
- Node.js >= 23.3.0
- Bun >= 1.0.0
- npm >= 7.0.0（或 yarn >= 1.22.0 或 pnpm >= 7.0.0）

> **注意**：本项目需要在 Linux 或 macOS 环境下运行。Windows 用户请安装并使用 [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/zh-cn/windows/wsl/install)。

### 安装 Bun

如果未安装 Bun，请访问 [Bun 官网](https://bun.sh/) 安装：

```bash
# 使用 curl 安装
curl -fsSL https://bun.sh/install | bash

# 或使用 npm 安装
npm install -g bun
```

### 验证安装

```bash
# 检查 Node.js 版本
node --version

# 检查 Bun 版本
bun --version

# 检查 npm 版本
npm --version
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd chain_prophet
```

### 2. 安装依赖

```bash
# 安装后端依赖
bun install

# 安装前端依赖
cd frontend
npm install
cd ..
```

### 3. 配置环境变量

#### 后端环境变量

在项目根目录创建 `.env` 文件：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# AI 提供商配置（至少配置一个）
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# EVM 插件配置
EVM_PRIVATE_KEY=your_private_key_here

# RPC 节点配置（可选，建议配置以提高性能）
ETHEREUM_PROVIDER_SEPOLIA=https://sepolia.infura.io/v3/your_api_key

# 数据库配置
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/eliza

# 服务器配置
SERVER_PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

#### 前端环境变量

在前端目录创建 `.env` 文件：

```bash
cd frontend
cp env.example .env
```

编辑 `.env` 文件：

```env
# API 配置
VITE_API_BASE_URL=http://localhost:3000

# 应用配置
VITE_APP_NAME=基于 Web3.0 的 AI 代理
VITE_APP_VERSION=1.0.0

# Web3 钱包配置
VITE_WALLET_PRIVATE_KEY=your_private_key_here
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_api_key

# NFT 合约地址（可选，部署合约后配置,下面地址是测试用合约）
VITE_NFT_CONTRACT_ADDRESS=0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330
VITE_NFT_MARKETPLACE_ADDRESS=0x96D1227aCD29057607601Afdf16BF853D5B58203
VITE_NFT_STAKING_ADDRESS=0x0Ef064805ecad331F2d1ED363E6C7cD7E06831e9
VITE_NFT_LOAN_ADDRESS=0xbeB3110F3563BD63dDb05F0813213d2dAC3e0BE1

# Etherscan API Key（可选）
VITE_ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 运行项目

### 方式一：同时运行前后端（推荐）

使用一键启动脚本：

```bash
./start-fullstack.sh
```

此脚本会：
1. 检查环境变量配置
2. 启动后端服务（端口 3000）
3. 等待后端启动后启动前端服务（端口 3001）
4. 显示访问地址

访问地址：
- 后端: http://localhost:3000
- 前端应用: http://localhost:3001

### 方式二：分别运行前后端

#### 运行后端

在项目根目录执行：

使用开发模式：

```bash
bun run dev
```

或使用生产模式：

```bash
bun run build
bun run start
```

后端服务将在 http://localhost:3000 启动

#### 运行前端

方式 A：使用启动脚本

```bash
cd frontend
./start.sh
```

方式 B：直接使用 npm 命令

```bash
cd frontend
npm run dev
```

前端服务将在 http://localhost:3001 启动

### 方式三：使用命令分别运行

#### 后端命令

```bash
# 开发模式
bun run dev

# 生产模式
bun run start

# 构建项目
bun run build

# 类型检查
bun run type-check

# 运行测试
bun run test

# 代码格式化
bun run format
```

#### 前端命令

```bash
cd frontend

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 构建项目

### 后端构建

后端使用 Bun 进行构建：

```bash
bun run build
```

构建产物将输出到 `dist/` 目录。

构建过程包括：
1. 清理之前的构建产物
2. 使用 Bun 打包 TypeScript 代码
3. 生成 TypeScript 类型声明文件

### 前端构建

```bash
cd frontend
npm run build
```

构建产物将输出到 `frontend/dist/` 目录。

## 关闭项目

### 终端关闭（推荐）

```bash
#使用 Ctrl + C
```

### 使用关闭脚本

```bash
./stop-fullstack.sh          
#如果有进程残留，可以用强力模式
./stop-fullstack.sh -f       # 使用强力模式，强制关闭相关进程
./stop-fullstack.sh --force  # 使用强力模式
```

## 项目结构

```
chain_prophet/
├── src/                          # 后端源代码
│   ├── index.ts                 # 项目入口文件
│   ├── character.ts             # AI Agent 角色定义
│   ├── plugin.ts                # 主插件
│   ├── evm-balance-plugin.ts    # EVM 余额查询插件
│   ├── evm-transfer-plugin.ts   # EVM 转账插件
│   ├── nft-plugin.ts            # NFT 功能插件
│   ├── nft-service.ts           # NFT 服务
│   ├── api-routes.ts            # API 路由定义
│   └── __tests__/               # 测试文件
├── frontend/                     # 前端源代码
│   ├── src/
│   │   ├── components/          # React 组件
│   │   │   ├── chat/            # 对话相关组件
│   │   │   ├── wallet/          # 钱包相关组件
│   │   │   └── layouts/         # 布局组件
│   │   ├── pages/               # 页面组件
│   │   │   ├── ChatPage.tsx     # AI 对话页面
│   │   │   ├── WalletPage.tsx   # 钱包页面
│   │   │   ├── MyNFTPage.tsx    # 我的 NFT 页面
│   │   │   ├── NFTMarketplacePage.tsx  # NFT 市场页面
│   │   │   ├── AddressBookPage.tsx     # 地址簿页面
│   │   │   └── TransferPage.tsx        # 转账页面
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── services/            # API 服务
│   │   ├── types/               # TypeScript 类型
│   │   ├── App.tsx              # 主应用组件
│   │   └── main.tsx             # 应用入口
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── contracts/                     # 智能合约代码
├── knowledge/                     # 知识库文档
├── build.ts                      # 构建脚本
├── package.json                  # 后端项目配置
├── bun.lock                      # Bun 锁文件
├── tsconfig.json                 # TypeScript 配置
├── start-fullstack.sh            # 全栈启动脚本
├── env.example                   # 环境变量示例
└── README.md                     # 项目说明文档
```

## 功能说明

### 后端功能

- **AI Agent 对话服务**：基于 ElizaOS 框架的 AI Agent 对话系统
- **EVM 余额查询**：查询以太坊地址余额
- **EVM 转账功能**：执行以太坊转账交易
- **NFT 市场服务**：NFT 上架、购买、质押、借贷等功能
- **API 服务**：提供 RESTful API 接口
- **WebSocket 服务**：实时消息传递

### 前端功能

- **AI 对话界面**：与 AI Agent 实时对话
- **钱包管理**：查看余额、地址、交易记录
- **NFT 市场**：上架、购买、质押、借贷 NFT
- **地址簿**：保存和管理常用地址
- **转账功能**：发送以太坊转账

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

### NFT 功能

- `POST /api/nft/listing` - 上架 NFT
- `POST /api/nft/purchase` - 购买 NFT
- `POST /api/nft/stake` - 质押 NFT
- `POST /api/nft/loan` - 创建借贷

## 开发指南

### 后端开发

1. 修改代码后，开发模式会自动热重载
2. 使用 `bun run type-check` 检查类型错误
3. 使用 `bun run format` 格式化代码
4. 使用 `bun run test` 运行测试

### 前端开发

1. 修改代码后，开发模式会自动热重载
2. 使用 `npm run lint` 检查代码规范
3. 组件开发遵循 React Hooks 最佳实践
4. 使用 TanStack Query 管理服务器状态

## 测试

### 后端测试

```bash
# 运行所有测试
bun run test

# 运行组件测试
bun run test:component

# 运行 E2E 测试
bun run test:e2e

# 运行测试并生成覆盖率报告
bun run test:coverage
```

### 前端测试

前端测试配置待完善。

## 故障排除

### 常见问题

1. **Bun 未找到**
   - 确保已安装 Bun：`bun --version`
   - 如果未安装，参考环境要求部分安装

2. **Node.js 版本过低**
   - 确保 Node.js 版本 >= 23.3.0
   - 使用 `nvm` 或 `n` 管理 Node.js 版本

3. **后端无法启动**
   - 检查 `.env` 文件是否配置正确
   - 确认数据库连接正常
   - 查看后端日志错误信息

4. **前端无法连接后端**
   - 确认后端服务在 3000 端口运行
   - 检查 `VITE_API_BASE_URL` 配置
   - 查看浏览器控制台错误信息

5. **构建失败**
   - 确保所有依赖已安装
   - 检查 TypeScript 类型错误
   - 清理构建缓存后重试

### 调试方法

```bash
# 查看后端日志
bun run dev

# 查看前端日志
cd frontend && npm run dev

# 检查环境变量
cat .env
cat frontend/.env
```

## 部署说明

### 生产环境部署

1. 构建后端：
```bash
bun run build
```

2. 构建前端：
```bash
cd frontend
npm run build
```

3. 配置生产环境变量

4. 启动后端服务：
```bash
bun run start
```

5. 部署前端静态文件（将 `frontend/dist/` 部署到静态文件服务器）

### Docker 部署

项目包含 `Dockerfile` 和 `docker-compose.yaml`，可以使用 Docker 部署：

```bash
docker-compose up -d
```

## 安全注意事项

1. **私钥安全**
   - 永远不要将私钥提交到 Git 仓库
   - `.env` 文件已添加到 `.gitignore`
   - 生产环境使用密钥管理服务

2. **API 密钥**
   - 妥善保管 OpenAI、Anthropic 等 API 密钥
   - 不要在代码中硬编码密钥
   - 使用环境变量管理所有密钥

3. **网络安全**
   - 生产环境使用 HTTPS
   - 配置 CORS 策略
   - 使用防火墙限制访问

## 相关文档

- [前端说明文档](./README_FRONTEND.md) - 详细的前端功能说明
- [智能合约部署指南](./FOUNDRY_DEPLOYMENT_GUIDE.md) - NFT 合约部署说明

## 技术栈

### 后端技术栈

- **ElizaOS**: AI Agent 框架
- **TypeScript**: 类型安全
- **Bun**: 运行时和构建工具
- **Viem**: EVM 区块链交互
- **Express**: API 服务器

### 前端技术栈

- **React 18**: 用户界面框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Vite**: 构建工具
- **TanStack Query**: 数据获取
- **Axios**: HTTP 客户端
- **Viem**: EVM 区块链交互

---

**注意**: 这是一个基于 ElizaOS 的演示项目，展示了如何构建一个支持 EVM 功能和 NFT 市场的 AI Agent 对话平台。请确保在生产环境中进行适当的安全配置和测试。
