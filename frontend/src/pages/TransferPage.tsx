import React, { useState } from 'react';
import { Wallet, Send, Search, AlertTriangle, ShieldCheck, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { whitelistService, blacklistService } from '../services/addressBook';
import { createPublicClientWithRetry, createWalletClientWithRetry } from '../services/rpcClient';
import { formatEther, parseEther, isAddress } from 'viem';
import { EVMBalanceResult } from '../types';

const TransferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'balance' | 'transfer'>('balance');
  
  // 查余额相关状态
  const [balanceInput, setBalanceInput] = useState('');
  const [balanceResult, setBalanceResult] = useState<EVMBalanceResult | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  
  // 转账相关状态
  const [transferForm, setTransferForm] = useState({
    to: '',
    amount: '',
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [transferInfo, setTransferInfo] = useState<{
    to: string;
    toAddress: string;
    toName?: string;
    amount: string;
    listType?: 'whitelist' | 'blacklist' | null;
  } | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferResult, setTransferResult] = useState<{
    hash: string;
    success: boolean;
    error?: string;
  } | null>(null);

  // 获取私钥和RPC配置
  const PRIVATE_KEY = (import.meta as any).env?.VITE_WALLET_PRIVATE_KEY || '';
  const publicClient = createPublicClientWithRetry();

  // 根据名字或地址获取地址信息
  const getAddressFromNameOrAddress = (input: string): {
    address: string;
    name?: string;
    listType?: 'whitelist' | 'blacklist' | null;
  } | null => {
    // 先检查是否是地址格式
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (addressRegex.test(input.trim())) {
      const address = input.trim();
      // 检查地址是否在名单中
      const whitelistEntry = whitelistService.getByAddress(address);
      const blacklistEntry = blacklistService.getByAddress(address);
      
      if (whitelistEntry) {
        return {
          address,
          name: whitelistEntry.nickname || whitelistEntry.name,
          listType: 'whitelist',
        };
      } else if (blacklistEntry) {
        return {
          address,
          name: blacklistEntry.nickname || blacklistEntry.name,
          listType: 'blacklist',
        };
      }
      
      return { address, listType: null };
    }
    
    // 检查是否是名字或昵称
    const whitelistEntry = whitelistService.getByName(input.trim());
    if (whitelistEntry) {
      return {
        address: whitelistEntry.address,
        name: input.trim(),
        listType: 'whitelist',
      };
    }
    
    const blacklistEntry = blacklistService.getByName(input.trim());
    if (blacklistEntry) {
      return {
        address: blacklistEntry.address,
        name: input.trim(),
        listType: 'blacklist',
      };
    }
    
    return null;
  };

  // 查询余额
  const handleQueryBalance = async () => {
    if (!balanceInput.trim()) {
      alert('请输入地址或名字');
      return;
    }
    
    const addressInfo = getAddressFromNameOrAddress(balanceInput.trim());
    if (!addressInfo) {
      alert('未找到该地址或名字，请检查输入');
      return;
    }
    
    setBalanceLoading(true);
    try {
      const balance = await publicClient.getBalance({
        address: addressInfo.address as `0x${string}`,
      });
      
      const balanceInEth = formatEther(balance);
      
      setBalanceResult({
        address: addressInfo.address,
        balance: balanceInEth,
        network: 'Sepolia',
        success: true,
      });
    } catch (error) {
      console.error('查询余额失败:', error);
      setBalanceResult({
        address: addressInfo.address,
        balance: '0',
        network: 'Sepolia',
        success: false,
        error: error instanceof Error ? error.message : '查询失败',
      });
    } finally {
      setBalanceLoading(false);
    }
  };

  // 清除余额结果
  const clearBalanceResult = () => {
    setBalanceResult(null);
  };

  // 处理转账
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferForm.to.trim() || !transferForm.amount.trim()) {
      alert('请填写完整信息');
      return;
    }
    
    const addressInfo = getAddressFromNameOrAddress(transferForm.to.trim());
    if (!addressInfo) {
      alert('未找到该地址或名字，请检查输入');
      return;
    }
    
    // 验证金额
    const amount = parseFloat(transferForm.amount.trim());
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的转账金额');
      return;
    }
    
    // 设置转账信息并显示确认对话框
    setTransferInfo({
      to: transferForm.to.trim(),
      toAddress: addressInfo.address,
      toName: addressInfo.name,
      amount: transferForm.amount.trim(),
      listType: addressInfo.listType,
    });
    setShowConfirmDialog(true);
  };

  // 确认转账
  const handleConfirmTransfer = async () => {
    if (!transferInfo) {
      return;
    }
    
    if (!PRIVATE_KEY || !PRIVATE_KEY.trim()) {
      alert('请配置钱包私钥 VITE_WALLET_PRIVATE_KEY');
      return;
    }
    
    setTransferLoading(true);
    setShowConfirmDialog(false);
    
    try {
      // 验证地址格式
      if (!isAddress(transferInfo.toAddress)) {
        throw new Error('无效的接收地址');
      }
      
      // 解析金额
      const amountInWei = parseEther(transferInfo.amount);
      
      // 创建钱包客户端
      const walletClient = createWalletClientWithRetry(PRIVATE_KEY);
      
      // 查询发送者余额
      const account = walletClient.account;
      const balance = await publicClient.getBalance({
        address: account.address,
      });
      
      // 估算 Gas 费用
      const gasPrice = await publicClient.getGasPrice();
      const gasLimit = await publicClient.estimateGas({
        account,
        to: transferInfo.toAddress as `0x${string}`,
        value: amountInWei,
      });
      
      const totalCost = amountInWei + (gasPrice * gasLimit);
      
      // 检查余额是否足够
      if (balance < totalCost) {
        throw new Error(`余额不足！需要 ${formatEther(totalCost)} ETH，当前余额 ${formatEther(balance)} ETH`);
      }
      
      // 发送转账
      const hash = await walletClient.sendTransaction({
        to: transferInfo.toAddress as `0x${string}`,
        value: amountInWei,
        gas: gasLimit,
        gasPrice: gasPrice,
      });
      
      setTransferResult({
        hash,
        success: true,
      });
      
      // 清空表单
      setTransferForm({ to: '', amount: '' });
      
      // 显示成功提示
      alert(`转账成功！交易哈希：${hash}\n\n可在区块浏览器查看：https://sepolia.etherscan.io/tx/${hash}`);
    } catch (error) {
      console.error('转账失败:', error);
      const errorMessage = error instanceof Error ? error.message : '转账失败';
      setTransferResult({
        hash: '',
        success: false,
        error: errorMessage,
      });
      alert(`转账失败：${errorMessage}`);
    } finally {
      setTransferLoading(false);
      setTransferInfo(null);
    }
  };

  // 取消转账
  const handleCancelTransfer = () => {
    setShowConfirmDialog(false);
    setTransferInfo(null);
  };

  // 获取风险提示文本
  const getRiskWarning = (listType?: 'whitelist' | 'blacklist' | null) => {
    if (listType === 'whitelist') {
      return {
        level: 'low' as const,
        text: '✅ 该地址在白名单中，可以安全转账。',
        color: 'text-green-600',
      };
    } else if (listType === 'blacklist') {
      return {
        level: 'high' as const,
        text: '🚨 严重警告：该地址在黑名单中！强烈建议不要向此地址转账！',
        color: 'text-red-600',
      };
    } else {
      return {
        level: 'medium' as const,
        text: '⚠️ 该地址不在白名单或黑名单中，请仔细核对。',
        color: 'text-yellow-600',
      };
    }
  };

  const riskWarning = transferInfo ? getRiskWarning(transferInfo.listType) : null;

  return (
    <div className="h-full overflow-y-auto bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">转账与查余额</h1>
          <p className="text-secondary-600">支持使用地址或名字进行操作</p>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 mb-6">
          <div className="flex border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('balance')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'balance'
                  ? 'border-primary-500 text-primary-700 font-semibold'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Wallet size={20} />
              <span>查余额</span>
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'transfer'
                  ? 'border-primary-500 text-primary-700 font-semibold'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Send size={20} />
              <span>转账</span>
            </button>
          </div>
        </div>

        {/* 查余额表单 */}
        {activeTab === 'balance' && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold mb-4">查询余额</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  地址或名字
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    placeholder="输入地址（0x...）或名字/昵称"
                    className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleQueryBalance();
                      }
                    }}
                  />
                  <button
                    onClick={handleQueryBalance}
                    disabled={balanceLoading || !balanceInput.trim()}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Search size={18} />
                    <span>查询</span>
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  支持输入钱包地址或地址簿中的名字/昵称
                </p>
              </div>

              {/* 余额查询结果 */}
              {balanceResult && (
                <div className="mt-4 bg-white border border-secondary-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Wallet size={20} className="text-primary-500" />
                      <h3 className="text-sm font-medium text-secondary-900">EVM 余额查询</h3>
                    </div>
                    <button
                      onClick={() => {
                        clearBalanceResult();
                        setBalanceInput('');
                      }}
                      className="text-secondary-400 hover:text-secondary-600"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>

                  {balanceResult.success ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-green-700">查询成功</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-secondary-600">钱包地址</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-xs bg-secondary-100 px-2 py-1 rounded font-mono flex-1 truncate">
                              {balanceResult.address}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(balanceResult.address)}
                              className="text-secondary-400 hover:text-secondary-600"
                              title="复制地址"
                            >
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-secondary-600">余额</label>
                          <div className="text-lg font-semibold text-secondary-900">
                            {parseFloat(balanceResult.balance).toFixed(6)} ETH
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-secondary-600">网络</label>
                          <div className="text-sm text-secondary-700">{balanceResult.network}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <XCircle size={16} className="text-red-500" />
                        <span className="text-sm text-red-700">查询失败</span>
                      </div>
                      
                      {balanceResult.error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {balanceResult.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 转账表单 */}
        {activeTab === 'transfer' && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h2 className="text-xl font-semibold mb-4">转账</h2>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  接收地址或名字
                </label>
                <input
                  type="text"
                  value={transferForm.to}
                  onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
                  placeholder="输入地址（0x...）或名字/昵称"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  支持输入钱包地址或地址簿中的名字/昵称
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  转账金额 (ETH)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={transferLoading || !transferForm.to.trim() || !transferForm.amount.trim() || !PRIVATE_KEY}
                className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Send size={18} />
                <span>{transferLoading ? '处理中...' : '发起转账'}</span>
              </button>
              {!PRIVATE_KEY && (
                <p className="text-xs text-red-500 mt-1">
                  ⚠️ 请配置钱包私钥 VITE_WALLET_PRIVATE_KEY
                </p>
              )}
            </form>

            {/* 转账结果 */}
            {transferResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                transferResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start space-x-2">
                  {transferResult.success ? (
                    <>
                      <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-700 mb-1">转账成功！</p>
                        <p className="text-xs text-green-600 break-all mb-2">
                          交易哈希：{transferResult.hash}
                        </p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${transferResult.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:text-green-700 underline flex items-center space-x-1"
                        >
                          <ExternalLink size={12} />
                          <span>在区块浏览器查看</span>
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 mb-1">转账失败</p>
                        <p className="text-xs text-red-600">{transferResult.error}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 转账确认对话框 */}
        {showConfirmDialog && transferInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-semibold mb-4">确认转账</h3>
              
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-sm text-secondary-600">接收地址</label>
                  <div className="mt-1 text-sm font-mono text-secondary-900 break-all">
                    {transferInfo.toAddress}
                  </div>
                  {transferInfo.toName && (
                    <div className="text-xs text-secondary-500 mt-1">
                      名字：{transferInfo.toName}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="text-sm text-secondary-600">转账金额</label>
                  <div className="mt-1 text-lg font-semibold text-secondary-900">
                    {transferInfo.amount} ETH
                  </div>
                </div>

                <div>
                  <label className="text-sm text-secondary-600">网络</label>
                  <div className="mt-1 text-sm text-secondary-700">
                    Sepolia 测试网
                  </div>
                </div>

                {/* 风险提示 */}
                {riskWarning && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    riskWarning.level === 'high' 
                      ? 'bg-red-50 border border-red-200' 
                      : riskWarning.level === 'low'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {riskWarning.level === 'high' ? (
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                      ) : riskWarning.level === 'low' ? (
                        <ShieldCheck className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                      ) : (
                        <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
                      )}
                      <p className={`text-sm ${riskWarning.color}`}>
                        {riskWarning.text}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
                  <p className="text-xs text-secondary-600">
                    ⚠️ 请仔细核对接收地址，转账一旦完成无法撤销！
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelTransfer}
                  disabled={transferLoading}
                  className="flex-1 px-4 py-2 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={transferLoading}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                    riskWarning?.level === 'high'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {transferLoading ? '处理中...' : '确认转账'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferPage;

