# Chain Prophet 前端设置指南

## 🚀 快速启动

### 方法一：一键启动（推荐）

```bash
# 在项目根目录运行
./start-fullstack.sh
```

这将同时启动后端和前端服务。

### 方法二：分别启动

#### 1. 启动后端

```bash
# 在项目根目录
bun run dev
```

#### 2. 启动前端

```bash
# 在新终端中
cd frontend
./start.sh
```

## 📋 访问地址

- **前端应用**: http://localhost:3001
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health

## 🔧 功能特性

### 基本对话
- 与 AI Agent 实时对话
- 支持多种消息格式
- 实时打字指示器

### EVM 功能
- 查询钱包余额
- 私钥推导地址
- 支持 Sepolia 测试网

### 使用示例

#### 查询钱包余额
```
查询我的钱包余额 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

#### 使用私钥查询
```
根据私钥查询余额 0x03d8cc33a97cf07b554289f89267d3b01369b867f861cedcb46f1f98c898d8c5
```

## 🛠️ 开发说明

### 项目结构
```
chain_prophet/
├── src/                    # 后端代码
│   ├── api-routes.ts      # API 路由
│   ├── plugin.ts          # 主插件
│   └── ...
├── frontend/              # 前端代码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── services/      # API 服务
│   │   └── types/         # TypeScript 类型
│   ├── package.json
│   └── ...
└── start-fullstack.sh     # 一键启动脚本
```

### 环境变量

后端环境变量（已配置）：
```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.chatanywhere.tech/v1
EVM_PRIVATE_KEY=0x03d8cc33a97cf07b554289f89267d3b01369b867f861cedcb46f1f98c898d8c5
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/443ab1c362d646dcaa353c5b653c8173
```

前端环境变量（自动创建）：
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Chain Prophet
VITE_APP_VERSION=1.0.0
```

## 🔍 故障排除

### 常见问题

1. **前端无法连接后端**
   - 检查后端是否在 3000 端口运行
   - 确认 `VITE_API_BASE_URL` 配置正确

2. **EVM 查询失败**
   - 检查网络连接
   - 确认地址格式正确（0x 开头的 40 位十六进制）

3. **Agent 无响应**
   - 检查 OpenAI API 密钥配置
   - 查看后端日志

### 日志查看

```bash
# 查看后端日志
bun run dev

# 查看前端日志
cd frontend && npm run dev
```

## 📚 技术栈

- **后端**: ElizaOS, TypeScript, Viem
- **前端**: React 18, TypeScript, Tailwind CSS, Vite
- **区块链**: Sepolia 测试网, Infura RPC

## 🎯 下一步

1. 添加更多 EVM 功能（交易查询、合约交互等）
2. 支持更多区块链网络
3. 添加用户认证
4. 实现消息持久化
5. 添加更多 AI Agent 类型

## 📞 支持

如有问题，请检查：
1. 环境变量配置
2. 网络连接
3. 服务状态
4. 控制台日志
