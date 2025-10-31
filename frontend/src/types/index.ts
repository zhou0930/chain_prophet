export interface Message {
  id: string;
  content: string;
  role: 'user' | 'agent';
  timestamp: number;
  actions?: string[];
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
