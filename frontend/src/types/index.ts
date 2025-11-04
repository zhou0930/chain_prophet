export interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: number;
  actions?: string[];
  buttons?: Array<Array<{ text: string; callback_data?: string; url?: string }>>;
  metadata?: Record<string, any>;
  // Action 相关字段
  isAction?: boolean;
  actionName?: string;
  actionStatus?: 'executing' | 'completed' | 'failed';
  actionThought?: string;
  actionResult?: any;
  rawMessage?: any;
}

export interface Session {
  id: string;
  agentId: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  status: 'active' | 'inactive';
}

export interface Agent {
  id: string;
  name: string;
  bio: string;
  capabilities: string[];
  status: 'active' | 'inactive';
}

export interface EVMBalanceResult {
  address: string;
  balance: string;
  network: string;
  success: boolean;
  error?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentSession: Session | null;
  availableAgents: Agent[];
}

// NFT 相关类型定义
export interface NFT {
  id: string; // NFT 的唯一标识符
  tokenId: string; // 链上 token ID
  contractAddress: string; // NFT 合约地址
  name: string; // NFT 名称
  description: string; // NFT 描述
  image: string; // NFT 图片 URL
  owner: string; // 当前拥有者地址
  listed: boolean; // 是否已上架
  listedPrice?: string; // 上架价格（ETH）
  listedDate?: number; // 上架时间戳
  metadata?: Record<string, any>; // 其他元数据
}

export interface NFTListing {
  id: string; // 上架记录 ID
  nft: NFT; // NFT 信息
  seller: string; // 卖方地址
  price: string; // 价格（ETH）
  startTime: number; // 开始时间戳
  endTime?: number; // 结束时间戳（可选）
  status: 'active' | 'sold' | 'cancelled'; // 状态
  transactionHash?: string; // 交易哈希
}

export interface NFTTrade {
  id: string; // 交易 ID
  listingId: string; // 上架记录 ID
  buyer: string; // 买方地址
  seller: string; // 卖方地址
  nft: NFT; // NFT 信息
  price: string; // 成交价格（ETH）
  timestamp: number; // 交易时间戳
  transactionHash: string; // 交易哈希
}

export interface NFTStaking {
  id: string; // 质押 ID
  nft: NFT; // NFT 信息
  staker: string; // 质押者地址
  startTime: number; // 质押开始时间
  endTime?: number; // 质押结束时间（可选）
  stakedAmount?: string; // 质押金额（如果有）
  rewardRate?: string; // 奖励率
  claimedRewards?: string; // 已领取奖励
  status: 'active' | 'completed' | 'cancelled'; // 状态
  transactionHash?: string; // 交易哈希
}

export interface NFTLoan {
  id: string; // 借贷 ID
  nft: NFT; // 作为抵押品的 NFT
  borrower: string; // 借款人地址
  lender?: string; // 出借人地址（可选）
  loanAmount: string; // 借贷金额（ETH）
  interestRate: string; // 利率
  duration: number; // 借贷期限（天）
  startTime: number; // 开始时间
  dueDate: number; // 到期日
  repaymentAmount?: string; // 还款金额
  status: 'pending' | 'active' | 'repaid' | 'defaulted'; // 状态
  transactionHash?: string; // 交易哈希
}

export interface AddressEntry {
  id: number;
  address: string;
  name?: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}
