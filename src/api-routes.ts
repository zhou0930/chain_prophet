import type { IAgentRuntime } from '@elizaos/core';
import { Router } from 'express';
import { createPublicClient, http, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

const router = Router();

// 创建公共客户端用于查询余额
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

// 获取 Agent 列表
router.get('/agents', async (req, res) => {
  try {
    const agents = [
      {
        id: 'chain-prophet',
        name: 'Chain Prophet',
        bio: '专业的区块链和 DeFi 助手，能够查询钱包余额、分析交易数据，并提供区块链相关的技术支持。',
        capabilities: ['EVM 余额查询', '私钥地址推导', '区块链数据分析', 'DeFi 协议支持'],
        status: 'active'
      }
    ];
    
    res.json(agents);
  } catch (error) {
    console.error('获取 Agent 列表失败:', error);
    res.status(500).json({ error: '获取 Agent 列表失败' });
  }
});

// 获取特定 Agent 信息
router.get('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'chain-prophet') {
      const agent = {
        id: 'chain-prophet',
        name: 'Chain Prophet',
        bio: '专业的区块链和 DeFi 助手，能够查询钱包余额、分析交易数据，并提供区块链相关的技术支持。',
        capabilities: ['EVM 余额查询', '私钥地址推导', '区块链数据分析', 'DeFi 协议支持'],
        status: 'active'
      };
      res.json(agent);
    } else {
      res.status(404).json({ error: 'Agent 未找到' });
    }
  } catch (error) {
    console.error('获取 Agent 信息失败:', error);
    res.status(500).json({ error: '获取 Agent 信息失败' });
  }
});

// EVM 余额查询
router.post('/evm/balance', async (req, res) => {
  try {
    const { address, privateKey } = req.body;
    
    if (!address && !privateKey) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供地址或私钥' 
      });
    }
    
    let targetAddress: string;
    
    if (privateKey) {
      // 从私钥推导地址
      try {
        const account = privateKeyToAccount(privateKey as `0x${string}`);
        targetAddress = account.address;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: '私钥格式错误'
        });
      }
    } else {
      targetAddress = address;
    }
    
    // 验证地址格式
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(targetAddress)) {
      return res.status(400).json({
        success: false,
        error: '地址格式错误'
      });
    }
    
    // 查询余额
    const balance = await publicClient.getBalance({
      address: targetAddress as `0x${string}`,
    });
    
    // 转换为 ETH 单位
    const balanceInEth = formatEther(balance);
    
    res.json({
      success: true,
      address: targetAddress,
      balance: balanceInEth,
      network: 'Sepolia',
      wasDerivedFromPrivateKey: !!privateKey
    });
    
  } catch (error) {
    console.error('查询余额失败:', error);
    res.status(500).json({
      success: false,
      error: '查询余额失败: ' + (error instanceof Error ? error.message : '未知错误')
    });
  }
});

// 获取支持的链
router.get('/evm/chains', async (req, res) => {
  try {
    const chains = [
      {
        id: 'sepolia',
        name: 'Sepolia Testnet',
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/443ab1c362d646dcaa353c5b653c8173',
        explorerUrl: 'https://sepolia.etherscan.io',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18
        }
      }
    ];
    
    res.json(chains);
  } catch (error) {
    console.error('获取支持的链失败:', error);
    res.status(500).json({ error: '获取支持的链失败' });
  }
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'chain-prophet-api'
  });
});

export default router;
