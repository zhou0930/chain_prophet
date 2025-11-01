import React, { useEffect, useState, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useNFT } from '../hooks/useNFT';
import { Package, RefreshCw, AlertCircle, ExternalLink, Info, Plus, Lock } from 'lucide-react';
import { nftMintService, nftStakingService } from '../services/nftService';
import { getStoredTransactions } from '../services/walletStorage';
import { getNFTCache } from '../services/nftStorage';

const MyNFTPage: React.FC = () => {
  const { address, hasPrivateKey } = useWallet();
  const { nfts, isLoading, error, fetchMyNFTs } = useNFT();
  
  // 创建 NFT 相关状态
  const [showMintForm, setShowMintForm] = useState(false);
  const [mintAmount, setMintAmount] = useState('1');
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [checkingOwner, setCheckingOwner] = useState(false);
  const [stakedTokenIds, setStakedTokenIds] = useState<Set<string>>(new Set());
  
  // 存储上次检查时的交易记录数量，用于判断是否有新交易
  const lastTxCountRef = useRef<number>(0);
  const lastLatestTxHashRef = useRef<string>('');

  // 检查交易记录是否有变化
  const checkTransactionChanges = (address: string): boolean => {
    const transactions = getStoredTransactions(address);
    const currentTxCount = transactions.length;
    
    // 如果是第一次检查，初始化引用
    if (lastTxCountRef.current === 0 && currentTxCount > 0) {
      lastTxCountRef.current = currentTxCount;
      lastLatestTxHashRef.current = transactions[0]?.hash || '';
      return false; // 第一次加载不算变化
    }
    
    // 如果有新交易（数量增加），更新引用并返回 true
    if (currentTxCount > lastTxCountRef.current) {
      lastTxCountRef.current = currentTxCount;
      lastLatestTxHashRef.current = transactions[0]?.hash || '';
      return true;
    }
    
    // 如果交易数量相同，检查最新交易的哈希是否变化
    if (currentTxCount > 0 && lastTxCountRef.current > 0) {
      const latestTxHash = transactions[0]?.hash || '';
      if (latestTxHash && latestTxHash !== lastLatestTxHashRef.current) {
        // 最新交易哈希变了，说明有新交易（可能是替换了旧的）
        lastLatestTxHashRef.current = latestTxHash;
        return true;
      }
    }
    
    return false;
  };

  // 当地址变化时，检查交易记录变化并加载 NFT
  useEffect(() => {
    if (address) {
      checkIsOwner();
      
      // 检查交易记录是否有变化
      const hasNewTransactions = checkTransactionChanges(address);
      
      if (hasNewTransactions) {
        // 如果有新交易，重新获取 NFT（使用智能缓存）
        console.log('[NFT] 检测到新交易，重新获取 NFT');
        fetchMyNFTs(address, false);
      } else {
        // 如果没有新交易，尝试直接加载缓存
        console.log('[NFT] 没有新交易，尝试使用缓存数据');
        const cachedData = getNFTCache(address);
        if (cachedData && cachedData.nfts.length > 0) {
          // 直接设置缓存的 NFT 数据，避免不必要的 RPC 调用
          console.log('[NFT] 使用缓存的 NFT 数据，跳过 RPC 调用');
          // 注意：这里我们需要直接设置 nfts，但 useNFT hook 没有暴露 setNfts
          // 所以还是调用 fetchMyNFTs，但它会使用缓存（因为 forceRefresh=false）
          fetchMyNFTs(address, false);
        } else {
          // 没有缓存，需要获取
          console.log('[NFT] 没有缓存，重新获取 NFT');
          fetchMyNFTs(address, false);
        }
      }
      
      // 初始化交易记录数量引用
      const transactions = getStoredTransactions(address);
      lastTxCountRef.current = transactions.length;
      lastLatestTxHashRef.current = transactions[0]?.hash || '';
    }
  }, [address, fetchMyNFTs]);

  // 检查 NFT 质押状态
  useEffect(() => {
    if (nfts.length > 0 && address) {
      checkStakingStatus();
    }
  }, [nfts, address]);

  // 检查哪些 NFT 被质押了
  const checkStakingStatus = async () => {
    if (!address || nfts.length === 0) return;
    
    const stakedSet = new Set<string>();
    
    // 并行检查所有 NFT 的质押状态（批次处理）
    const batchSize = 10;
    for (let i = 0; i < nfts.length; i += batchSize) {
      const batch = nfts.slice(i, i + batchSize);
      const stakingChecks = await Promise.all(
        batch.map(async (nft) => {
          try {
            const stakingInfo = await nftStakingService.getStakingInfo(nft.tokenId);
            return stakingInfo && stakingInfo.status === 'active';
          } catch (error) {
            return false;
          }
        })
      );
      
      batch.forEach((nft, index) => {
        if (stakingChecks[index]) {
          stakedSet.add(nft.tokenId);
        }
      });
    }
    
    setStakedTokenIds(stakedSet);
  };

  // 检查是否是合约 owner
  const checkIsOwner = async () => {
    if (!address) return;
    
    setCheckingOwner(true);
    try {
      const owner = await nftMintService.checkIsOwner(address);
      setIsOwner(owner);
    } catch (error) {
      console.error('检查 owner 失败:', error);
      setIsOwner(false);
    } finally {
      setCheckingOwner(false);
    }
  };

  // 创建 NFT
  const handleMintNFT = async () => {
    if (!address) {
      setMintError('请先连接钱包');
      return;
    }

    const amount = parseInt(mintAmount);
    if (isNaN(amount) || amount < 1 || amount > 10) {
      setMintError('数量必须在 1-10 之间');
      return;
    }

    setMintLoading(true);
    setMintError(null);
    setMintSuccess(null);

    try {
      let hash: string;
      if (amount === 1) {
        hash = await nftMintService.mint(address);
        setMintSuccess(`NFT 铸造成功！交易哈希: ${hash}`);
      } else {
        hash = await nftMintService.batchMint(address, amount);
        setMintSuccess(`成功批量铸造 ${amount} 个 NFT！交易哈希: ${hash}`);
      }
      
      setMintAmount('1');
      setShowMintForm(false);
      
      // 等待交易确认后刷新列表
      setTimeout(() => {
        if (address) {
          fetchMyNFTs(address);
        }
      }, 3000);
    } catch (err: any) {
      setMintError(`铸造失败: ${err.message || '未知错误'}`);
    } finally {
      setMintLoading(false);
    }
  };

  // 刷新 NFT 列表（强制刷新，忽略缓存，并更新存储）
  const handleRefresh = () => {
    if (address) {
      // 强制刷新，忽略缓存
      fetchMyNFTs(address, true);
      // 更新交易记录数量引用
      const transactions = getStoredTransactions(address);
      lastTxCountRef.current = transactions.length;
      lastLatestTxHashRef.current = transactions[0]?.hash || '';
    }
  };

  // 查看在 Etherscan
  const viewOnEtherscan = (tokenId: string) => {
    const nftContractAddress = (import.meta as any).env?.VITE_NFT_CONTRACT_ADDRESS || '0x5c7c76fe8eA314fdb49b9388f3ac92F7a159f330';
    const url = `https://sepolia.etherscan.io/token/${nftContractAddress}?a=${tokenId}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-full overflow-y-auto bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">我的 NFT</h1>
              <p className="text-secondary-600">查看和管理您拥有的 NFT</p>
            </div>
            <div className="flex items-center space-x-3">
              {isOwner && (
                <button
                  onClick={() => setShowMintForm(!showMintForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <Plus size={18} />
                  <span>创建 NFT</span>
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={isLoading || !address}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-300 disabled:cursor-not-allowed text-secondary-700 rounded-lg transition-colors"
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                <span>刷新</span>
              </button>
            </div>
          </div>
        </div>

        {/* 创建 NFT 表单 */}
        {showMintForm && isOwner && (
          <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">创建 NFT</h2>
              <button
                onClick={() => {
                  setShowMintForm(false);
                  setMintError(null);
                  setMintSuccess(null);
                }}
                className="text-secondary-500 hover:text-secondary-700"
              >
                ×
              </button>
            </div>
            
            {mintError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {mintError}
              </div>
            )}
            
            {mintSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {mintSuccess}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  铸造数量 (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="输入要铸造的数量"
                />
                <p className="mt-1 text-xs text-secondary-500">
                  将铸造到您的钱包地址: {address}
                </p>
              </div>
              
              <button
                onClick={handleMintNFT}
                disabled={mintLoading}
                className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {mintLoading ? '铸造中...' : `铸造 ${mintAmount} 个 NFT`}
              </button>
            </div>
          </div>
        )}

        {/* Owner 检查提示 */}
        {checkingOwner ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="text-blue-600" size={20} />
              <p className="text-blue-800 text-sm">检查合约所有者权限...</p>
            </div>
          </div>
        ) : isOwner === false && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-yellow-800 font-medium mb-1">您不是合约所有者</p>
                <p className="text-yellow-700 text-sm">
                  只有合约部署者可以创建 NFT。如果您是部署者，请确保使用正确的钱包地址。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 私钥配置提示 */}
        {!hasPrivateKey && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-yellow-800 font-medium mb-1">未配置钱包私钥</p>
                <p className="text-yellow-700 text-sm">
                  请在环境变量中配置 <code className="bg-yellow-100 px-1 rounded">VITE_WALLET_PRIVATE_KEY</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}


        {/* NFT 列表 */}
        {!address ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-secondary-200">
            <Package size={48} className="mx-auto mb-4 text-secondary-300" />
            <p className="text-secondary-500">请先配置钱包地址</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-secondary-200">
            <RefreshCw size={32} className="mx-auto mb-4 text-secondary-300 animate-spin" />
            <p className="text-secondary-500">加载 NFT 中...</p>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-secondary-200">
            <Package size={48} className="mx-auto mb-4 text-secondary-300" />
            <p className="text-secondary-500">您还没有任何 NFT</p>
            <p className="text-sm text-secondary-400 mt-2">
              前往 NFT 市场购买或创建 NFT
            </p>
          </div>
        ) : (
          <>
            {/* 统计信息 */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-secondary-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500">拥有数量</p>
                  <p className="text-2xl font-bold text-secondary-900">{nfts.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-secondary-500">钱包地址</p>
                  <p className="text-sm font-mono text-secondary-900 break-all max-w-xs">
                    {address}
                  </p>
                </div>
              </div>
            </div>

            {/* NFT 网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <div
                  key={nft.id}
                  className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* NFT 图片 */}
                  <div className="relative aspect-square bg-secondary-100">
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-full object-cover bg-secondary-100"
                      onError={(e) => {
                        // 使用 SVG 占位图
                        const img = e.target as HTMLImageElement;
                        const svgData = `data:image/svg+xml;base64,${btoa(`
                          <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
                            <rect width="300" height="300" fill="#e5e7eb"/>
                            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">NFT #${nft.tokenId}</text>
                          </svg>
                        `)}`;
                        img.src = svgData;
                      }}
                    />
                    {/* 质押标记 */}
                    {stakedTokenIds.has(nft.tokenId) && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1.5 shadow-lg flex items-center space-x-1">
                        <Lock size={14} />
                        <span className="text-xs font-medium">已质押</span>
                      </div>
                    )}
                  </div>

                  {/* NFT 信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary-900 mb-1">{nft.name}</h3>
                    <p className="text-sm text-secondary-500 mb-3">
                      Token ID: {nft.tokenId}
                    </p>

                    {/* 操作按钮 */}
                    <div className="flex justify-center">
                      <button
                        onClick={() => viewOnEtherscan(nft.tokenId)}
                        className="w-full px-3 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                        title="在 Etherscan 查看"
                      >
                        <ExternalLink size={16} />
                        <span>在 Etherscan 查看</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyNFTPage;

