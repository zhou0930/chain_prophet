import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ShoppingBag, Upload, Coins, Lock, AlertCircle, Loader, CheckCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { nftMarketplaceService, nftStakingService, nftLoanService } from '../services/nftService';

type TabType = 'marketplace' | 'staking' | 'loans';

const NFTMarketplacePage: React.FC = () => {
  const { address, balance, hasPrivateKey } = useWallet();
  
  const [activeTab, setActiveTab] = useState<TabType>('marketplace');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 表单状态
  const [listTokenId, setListTokenId] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [buyTokenId, setBuyTokenId] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [stakeTokenId, setStakeTokenId] = useState('');
  const [unstakeTokenId, setUnstakeTokenId] = useState('');
  const [loanTokenId, setLoanTokenId] = useState('');
  const [showMyLoans, setShowMyLoans] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('30');
  const [approvingLoanTokenId, setApprovingLoanTokenId] = useState<string | null>(null);
  const [approveLoanLoading, setApproveLoanLoading] = useState(false);
  
  // 授权市场合约状态
  const [approveMarketplaceLoading, setApproveMarketplaceLoading] = useState(false);

  // 授权市场合约
  const handleApproveMarketplace = async (tokenId: string) => {
    setApproveMarketplaceLoading(true);
    clearMessages();

    try {
      const hash = await nftMarketplaceService.approveMarketplace(tokenId);
      setSuccess(`授权成功！交易哈希: ${hash}。现在可以上架 NFT 了。`);
    } catch (err: any) {
      setError(`授权失败: ${err.message || '未知错误'}`);
    } finally {
      setApproveMarketplaceLoading(false);
    }
  };
  
  // 我的借贷列表
  const [myLoans, setMyLoans] = useState<Array<any>>([]);
  const [loadingMyLoans, setLoadingMyLoans] = useState(false);
  const [repayingLoanId, setRepayingLoanId] = useState<string | null>(null);
  const [repayLoading, setRepayLoading] = useState(false);
  const [fulfillingLoanId, setFulfillingLoanId] = useState<string | null>(null);
  const [fulfillLoading, setFulfillLoading] = useState(false);

  // 清除消息
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // 上架 NFT
  const handleListNFT = async () => {
    if (!listTokenId || !listPrice) {
      setError('请填写完整信息');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const hash = await nftMarketplaceService.listNFT(listTokenId, listPrice);
      setSuccess(`NFT 上架成功！交易哈希: ${hash}`);
      setListTokenId('');
      setListPrice('');
    } catch (err: any) {
      // 检查是否是授权错误，提供友好提示
      if (err.message?.includes('授权') || err.message?.includes('approval') || err.message?.includes('0x177e802f')) {
        setError(`上架失败: ${err.message}。请先点击下方"授权市场合约"按钮进行授权。`);
        // 不设置 approvingMarketplaceTokenId，让授权按钮保持可用
      } else {
        setError(`上架失败: ${err.message || '未知错误'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 购买 NFT
  const handleBuyNFT = async () => {
    if (!buyTokenId || !buyPrice) {
      setError('请填写完整信息');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      // 如果没有输入价格，会自动从合约获取实际价格
      const hash = await nftMarketplaceService.buyNFT(buyTokenId, buyPrice || undefined);
      setSuccess(`购买成功！交易哈希: ${hash}`);
      setBuyTokenId('');
      setBuyPrice('');
    } catch (err: any) {
      const errorMessage = err.message || '未知错误';
      
      // 如果错误信息中包含价格提示，显示友好提示
      if (errorMessage.includes('价格') || errorMessage.includes('金额')) {
        setError(`购买失败: ${errorMessage}`);
      } else {
        setError(`购买失败: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 授权质押合约的状态
  const [approvingStakingTokenId, setApprovingStakingTokenId] = useState<string | null>(null);
  const [approveStakingLoading, setApproveStakingLoading] = useState(false);

  // 授权质押合约
  const handleApproveStaking = async (tokenId: string) => {
    setApprovingStakingTokenId(tokenId);
    setApproveStakingLoading(true);
    clearMessages();

    try {
      const hash = await nftStakingService.approveStaking(tokenId);
      setSuccess(`授权成功！交易哈希: ${hash}。现在可以质押 NFT 了。`);
      // 等待交易确认
      setTimeout(() => {
        setApprovingStakingTokenId(null);
      }, 3000);
    } catch (err: any) {
      setError(`授权失败: ${err.message || '未知错误'}`);
    } finally {
      setApproveStakingLoading(false);
    }
  };

  // 质押 NFT
  const handleStakeNFT = async () => {
    if (!stakeTokenId) {
      setError('请填写 Token ID');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const hash = await nftStakingService.stakeNFT(stakeTokenId);
      setSuccess(`质押成功！交易哈希: ${hash}`);
      setStakeTokenId('');
    } catch (err: any) {
      // 检查是否是授权错误，提供友好提示
      if (err.message?.includes('授权') || err.message?.includes('approval')) {
        setError(`质押失败: ${err.message}。请先点击下方"授权质押合约"按钮进行授权。`);
      } else {
        setError(`质押失败: ${err.message || '未知错误'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 解除质押
  const handleUnstakeNFT = async () => {
    if (!unstakeTokenId) {
      setError('请填写 Token ID');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const hash = await nftStakingService.unstakeNFT(unstakeTokenId);
      setSuccess(`解除质押成功！交易哈希: ${hash}`);
      setUnstakeTokenId('');
    } catch (err: any) {
      setError(`解除质押失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 授权借贷合约
  const handleApproveLoan = async (tokenId: string) => {
    setApprovingLoanTokenId(tokenId);
    setApproveLoanLoading(true);
    clearMessages();

    try {
      const hash = await nftLoanService.approveLoan(tokenId);
      setSuccess(`授权成功！交易哈希: ${hash}。现在可以创建借贷了。`);
      // 等待交易确认
      setTimeout(() => {
        setApprovingLoanTokenId(null);
      }, 3000);
    } catch (err: any) {
      setError(`授权失败: ${err.message || '未知错误'}`);
      setApprovingLoanTokenId(null);
    } finally {
      setApproveLoanLoading(false);
    }
  };

  // 创建借贷
  const handleCreateLoan = async () => {
    if (!loanTokenId || !loanAmount || !loanDuration) {
      setError('请填写完整信息');
      return;
    }

    const durationDays = parseInt(loanDuration);
    if (isNaN(durationDays) || durationDays < 7 || durationDays > 365) {
      setError('借贷期限必须在 7-365 天之间');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const hash = await nftLoanService.createLoan(loanTokenId, loanAmount, durationDays);
      setSuccess(`创建借贷成功！交易哈希: ${hash}`);
      setLoanTokenId('');
      setLoanAmount('');
      setLoanDuration('30');
      setApprovingLoanTokenId(null);
    } catch (err: any) {
      const errorMessage = err.message || '未知错误';
      setError(`创建借贷失败: ${errorMessage}`);
      
      // 如果是授权错误，显示授权按钮提示
      if (errorMessage.includes('授权')) {
        setApprovingLoanTokenId(loanTokenId);
      }
    } finally {
      setLoading(false);
    }
  };

  // 加载我的借贷列表
  const loadMyLoans = useCallback(async () => {
    if (!address) return;
    
    setLoadingMyLoans(true);
    try {
      const loans = await nftLoanService.getMyLoans(address);
      setMyLoans(loans);
    } catch (error) {
      console.error('加载我的借贷失败:', error);
    } finally {
      setLoadingMyLoans(false);
    }
  }, [address]);

  // 当地址变化或切换到借贷标签页时，加载我的借贷
  useEffect(() => {
    if (address && activeTab === 'loans') {
      loadMyLoans();
    }
  }, [address, activeTab, loadMyLoans]);

  // 出资完成借贷
  const handleFulfillLoan = async (loanId: string) => {
    setFulfillingLoanId(loanId);
    setFulfillLoading(true);
    clearMessages();

    try {
      const hash = await nftLoanService.fulfillLoan(loanId);
      setSuccess(`出资成功！交易哈希: ${hash}。借贷已激活，资金已支付给您。`);
      // 刷新借贷列表
      setTimeout(() => {
        loadMyLoans();
      }, 2000);
    } catch (err: any) {
      setError(`出资失败: ${err.message || '未知错误'}`);
    } finally {
      setFulfillLoading(false);
      setFulfillingLoanId(null);
    }
  };

  // 还款
  const handleRepayLoan = async (loanId: string) => {
    setRepayingLoanId(loanId);
    setRepayLoading(true);
    clearMessages();

    try {
      const hash = await nftLoanService.repayLoan(loanId);
      setSuccess(`还款成功！交易哈希: ${hash}。您的 NFT 已归还。`);
      // 刷新借贷列表
      setTimeout(() => {
        loadMyLoans();
      }, 2000);
    } catch (err: any) {
      setError(`还款失败: ${err.message || '未知错误'}`);
    } finally {
      setRepayLoading(false);
      setRepayingLoanId(null);
    }
  };

  // 关闭成功/错误提示
  const handleCloseAlert = () => {
    clearMessages();
  };

  return (
    <div className="h-full overflow-y-auto bg-secondary-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">NFT 市场</h1>
          <p className="text-secondary-600">上架、交易、借贷和质押您的 NFT</p>
        </div>

        {/* 私钥配置提示 */}
        {!hasPrivateKey && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-yellow-800 font-medium mb-1">未配置钱包私钥</p>
                <p className="text-yellow-700 text-sm mb-2">
                  请在环境变量中配置 <code className="bg-yellow-100 px-1 rounded">VITE_WALLET_PRIVATE_KEY</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 成功/错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
            <button
              onClick={handleCloseAlert}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={20} />
              <span className="text-green-700">{success}</span>
            </div>
            <button
              onClick={handleCloseAlert}
              className="text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        )}

        {/* 标签页切换 */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-6">
          <div className="flex items-center space-x-2 border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'marketplace'
                  ? 'border-primary-500 text-primary-700 font-semibold'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <ShoppingBag size={18} />
              <span>市场交易</span>
            </button>
            <button
              onClick={() => setActiveTab('staking')}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'staking'
                  ? 'border-primary-500 text-primary-700 font-semibold'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Lock size={18} />
              <span>质押</span>
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'loans'
                  ? 'border-primary-500 text-primary-700 font-semibold'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <Coins size={18} />
              <span>借贷</span>
            </button>
          </div>

          {/* 市场交易标签页 */}
          {activeTab === 'marketplace' && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 上架 NFT */}
                <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                    <Upload className="mr-2" size={24} />
                    上架 NFT
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Token ID
                      </label>
                      <input
                        type="text"
                        value={listTokenId}
                        onChange={(e) => setListTokenId(e.target.value)}
                        placeholder="输入 NFT Token ID"
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        价格 (ETH)
                      </label>
                      <input
                        type="text"
                        value={listPrice}
                        onChange={(e) => setListPrice(e.target.value)}
                        placeholder="0.1"
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={handleListNFT}
                      disabled={loading || !address || !hasPrivateKey}
                      className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin mr-2" size={16} />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2" size={16} />
                          上架
                        </>
                      )}
                    </button>
                    {listTokenId && (
                      <button
                        onClick={() => handleApproveMarketplace(listTokenId)}
                        disabled={approveMarketplaceLoading || loading || !address || !hasPrivateKey}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        {approveMarketplaceLoading ? (
                          <>
                            <Loader className="animate-spin mr-2" size={16} />
                            授权中...
                          </>
                        ) : (
                          '授权市场合约'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 购买 NFT */}
                <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                    <ShoppingBag className="mr-2" size={24} />
                    购买 NFT
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Token ID
                      </label>
                      <input
                        type="text"
                        value={buyTokenId}
                        onChange={(e) => setBuyTokenId(e.target.value)}
                        placeholder="输入 NFT Token ID"
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        价格 (ETH)
                      </label>
                      <input
                        type="text"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        placeholder="0.1"
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={handleBuyNFT}
                      disabled={loading || !address || !hasPrivateKey}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin mr-2" size={16} />
                          处理中...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="mr-2" size={16} />
                          购买
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 质押标签页 */}
          {activeTab === 'staking' && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 质押 NFT */}
                <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                    <Lock className="mr-2" size={24} />
                    质押 NFT
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Token ID
                      </label>
                      <input
                        type="text"
                        value={stakeTokenId}
                        onChange={(e) => setStakeTokenId(e.target.value)}
                        placeholder="输入 NFT Token ID"
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={handleStakeNFT}
                      disabled={loading || !address || !hasPrivateKey}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin mr-2" size={16} />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2" size={16} />
                          质押
                        </>
                      )}
                    </button>
                    {stakeTokenId && (
                      <button
                        onClick={() => handleApproveStaking(stakeTokenId)}
                        disabled={approveStakingLoading || approvingStakingTokenId === stakeTokenId || !address || !hasPrivateKey}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        {approveStakingLoading && approvingStakingTokenId === stakeTokenId ? (
                          <>
                            <Loader className="animate-spin mr-2" size={16} />
                            授权中...
                          </>
                        ) : (
                          '授权质押合约'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 解除质押 */}
                <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                    <Lock className="mr-2" size={24} />
                    解除质押
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Token ID
                      </label>
                      <input
                        type="text"
                        value={unstakeTokenId}
                        onChange={(e) => setUnstakeTokenId(e.target.value)}
                        placeholder="输入要解除质押的 NFT Token ID"
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      onClick={handleUnstakeNFT}
                      disabled={loading || !address || !hasPrivateKey}
                      className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin mr-2" size={16} />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2" size={16} />
                          解除质押
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 借贷标签页 */}
          {activeTab === 'loans' && (
            <div className="mt-6 space-y-6">
              {/* 我的借贷列表 - 可折叠 */}
              <div className="bg-white rounded-lg border border-secondary-200">
                <div
                  onClick={() => {
                    setShowMyLoans(!showMyLoans);
                    if (!showMyLoans && myLoans.length === 0) {
                      loadMyLoans();
                    }
                  }}
                  className="w-full flex items-center justify-between p-6 hover:bg-secondary-50 transition-colors cursor-pointer"
                >
                  <h2 className="text-xl font-semibold text-secondary-900 flex items-center">
                    <Coins className="mr-2" size={24} />
                    我的借贷
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadMyLoans();
                      }}
                      disabled={loadingMyLoans}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-50 text-secondary-700 rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw size={16} className={loadingMyLoans ? 'animate-spin' : ''} />
                      <span>刷新</span>
                    </button>
                    {showMyLoans ? (
                      <ChevronUp size={20} className="text-secondary-500" />
                    ) : (
                      <ChevronDown size={20} className="text-secondary-500" />
                    )}
                  </div>
                </div>
                
                {showMyLoans && (
                  <div className="px-6 pb-6">
                    {loadingMyLoans ? (
                      <div className="text-center py-8">
                        <Loader className="animate-spin mx-auto mb-2 text-secondary-400" size={24} />
                        <p className="text-secondary-500 text-sm">加载中...</p>
                      </div>
                    ) : myLoans.length === 0 ? (
                      <div className="text-center py-8 text-secondary-500">
                        <Coins className="mx-auto mb-2 text-secondary-300" size={32} />
                        <p>您还没有创建任何借贷</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myLoans.map((loan) => (
                          <div key={loan.id} className="border border-secondary-200 rounded-lg p-4 bg-secondary-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-semibold text-secondary-900">借贷 #{loan.loanId}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    loan.status === 'repaid' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {loan.status === 'repaid' ? '已还款' : '进行中'}
                                  </span>
                                </div>
                                <div className="space-y-1 text-sm text-secondary-600">
                                  <p>Token ID: {loan.tokenId || 'N/A'}</p>
                                  <p>借贷金额: {loan.loanAmount} ETH</p>
                                  <p>还款金额: {loan.repaymentAmount || '计算中...'} ETH</p>
                                  <p>到期时间: {loan.dueDate ? new Date(Number(loan.dueDate) * 1000).toLocaleString('zh-CN') : 'N/A'}</p>
                                  {loan.lender && loan.lender !== '0x0000000000000000000000000000000000000000' && (
                                    <p className="text-xs text-secondary-500">贷款人: {loan.lender.slice(0, 6)}...{loan.lender.slice(-4)}</p>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4 flex flex-col space-y-2">
                                {loan.status === 'active' && (!loan.lender || loan.lender === '0x0000000000000000000000000000000000000000') && (
                                  <button
                                    onClick={() => handleFulfillLoan(loan.loanId)}
                                    disabled={fulfillLoading && fulfillingLoanId === loan.loanId}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                                    title="您可以自己出资完成这个借贷"
                                  >
                                    {fulfillLoading && fulfillingLoanId === loan.loanId ? (
                                      <>
                                        <Loader className="animate-spin mr-2" size={16} />
                                        出资中...
                                      </>
                                    ) : (
                                      <>
                                        <Coins className="mr-2" size={16} />
                                        出资完成借贷
                                      </>
                                    )}
                                  </button>
                                )}
                                {loan.status === 'active' && loan.lender && loan.lender !== '0x0000000000000000000000000000000000000000' && (
                                  <button
                                    onClick={() => handleRepayLoan(loan.loanId)}
                                    disabled={repayLoading && repayingLoanId === loan.loanId}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center"
                                  >
                                    {repayLoading && repayingLoanId === loan.loanId ? (
                                      <>
                                        <Loader className="animate-spin mr-2" size={16} />
                                        还款中...
                                      </>
                                    ) : (
                                      <>
                                        <Coins className="mr-2" size={16} />
                                        还款赎回
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            {loan.status === 'active' && (!loan.lender || loan.lender === '0x0000000000000000000000000000000000000000') && (
                              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                等待贷款人出资中...（您可以自己出资完成这个借贷）
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 创建借贷 */}
              <div className="bg-secondary-50 rounded-lg p-6 border border-secondary-200">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center">
                  <Coins className="mr-2" size={24} />
                  创建借贷
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Token ID
                    </label>
                    <input
                      type="text"
                      value={loanTokenId}
                      onChange={(e) => setLoanTokenId(e.target.value)}
                      placeholder="输入 NFT Token ID 作为抵押品"
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      借贷金额 (ETH)
                    </label>
                    <input
                      type="text"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="1.0"
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      借贷期限 (天)
                    </label>
                    <input
                      type="number"
                      min="7"
                      max="365"
                      value={loanDuration}
                      onChange={(e) => setLoanDuration(e.target.value)}
                      placeholder="30"
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      借贷期限：7-365 天（最小 7 天，最大 365 天）
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={handleCreateLoan}
                      disabled={loading || !address || !hasPrivateKey || approveLoanLoading}
                      className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin mr-2" size={16} />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2" size={16} />
                          创建借贷
                        </>
                      )}
                    </button>
                    {(approvingLoanTokenId === loanTokenId || error?.includes('授权')) && (
                      <button
                        onClick={() => handleApproveLoan(loanTokenId)}
                        disabled={approveLoanLoading || !loanTokenId}
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        {approveLoanLoading ? (
                          <>
                            <Loader className="animate-spin mr-2" size={16} />
                            授权中...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2" size={16} />
                            授权借贷合约
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 钱包信息提示 */}
        {address && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">钱包地址</p>
                <p className="text-sm font-mono text-secondary-900 break-all">
                  {address}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-secondary-600">余额</p>
                <p className="text-lg font-bold text-secondary-900">
                  {parseFloat(balance).toFixed(6)} ETH
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplacePage;

