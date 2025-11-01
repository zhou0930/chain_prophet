import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useWallet, Transaction } from '../hooks/useWallet';
import { Wallet, RefreshCw, Copy, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, TrendingUp, Calendar, List } from 'lucide-react';
import TransactionCard from '../components/wallet/TransactionCard';
import { getStoredTransactions, getCalculatedBalanceHistory } from '../services/walletStorage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TabType = 'transactions' | 'trend';
type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

const WalletPage: React.FC = () => {
  const {
    address,
    myWalletAddress,
    balance,
    transactions,
    isLoading,
    error,
    hasPrivateKey,
    refresh,
    setAddress,
    fetchTransactions,
  } = useWallet();

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const itemsPerPage = 5;

  // 判断当前地址是否与我的钱包地址相同
  const isCurrentAddressMyWallet = address && myWalletAddress && address.toLowerCase() === myWalletAddress.toLowerCase();

  // 分页计算
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return transactions.slice(start, end);
  }, [transactions, currentPage, itemsPerPage]);

  // 当地址存在时，自动加载交易记录
  useEffect(() => {
    if (address) {
      fetchTransactions(address);
    }
  }, [address, fetchTransactions]);

  // 当地址变化时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [address]);

  // 复制地址
  const handleCopyAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedAddress(addr);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 使用自定义地址查询
  const handleUseCustomAddress = () => {
    if (customAddress && /^0x[a-fA-F0-9]{40}$/.test(customAddress)) {
      setAddress(customAddress);
      refresh();
      setCustomAddress('');
    }
  };

  // 在 Etherscan 上查看
  const viewOnEtherscan = (hash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
  };

  // 获取时间范围的开始和结束时间
  const getTimeRangeBounds = useCallback(() => {
    const now = Date.now();
    let startTime = 0;
    let endTime = now;

    switch (timeRange) {
      case 'day':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'year':
        startTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
      case 'all':
      default:
        startTime = 0;
        break;
    }

    return { startTime, endTime };
  }, [timeRange]);

  // 获取本地时区的日期字符串（YYYY-MM-DD格式）
  const getLocalDateString = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // 资产走势数据 - 按天聚合
  const chartData = useMemo(() => {
    if (!address || !balance || activeTab !== 'trend') {
      return [];
    }

    const storedTransactions = getStoredTransactions(address);
    // 如果没有交易记录，但需要显示今天的数据，仍然返回数据
    if (storedTransactions.length === 0) {
      const { startTime, endTime } = getTimeRangeBounds();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayKey = getLocalDateString(today);
      const todayStart = today.getTime();
      
      // 如果今天在时间范围内，返回今天的当前余额
      if (todayStart >= startTime && todayStart <= endTime) {
        return [{
          dayKey: todayKey,
          time: today.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          }),
          timestamp: Date.now(),
          balance: parseFloat(balance),
          transactions: [],
        }];
      }
      return [];
    }

    // 获取历史余额（优先使用存储的，避免每次重新计算）
    const history = getCalculatedBalanceHistory(
      address,
      balance,
      storedTransactions
    );

    const { startTime, endTime } = getTimeRangeBounds();
    const filteredHistory = history.filter(point => point.timestamp >= startTime && point.timestamp <= endTime);

    // 按天聚合数据
    const dailyData = new Map<string, { timestamp: number; balance: number; transactions: Transaction[] }>();
    
    // 初始化每天的数据（包括今天）
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = getLocalDateString(today);
    
    // 确保结束日期至少是今天（如果时间范围不包括今天，也要包含今天）
    const finalEndDate = endDate > today ? endDate : today;
    
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= finalEndDate) {
      const dayKey = getLocalDateString(currentDate);
      const isToday = dayKey === todayKey;
      
      // 如果是今天，使用当前时间作为时间戳；否则使用当天结束时间
      const timestamp = isToday ? Date.now() : new Date(currentDate.getTime() + 86400000 - 1).getTime();
      
      // 如果是今天，使用当前余额；否则初始化为0
      const initialBalance = isToday ? parseFloat(balance) : 0;
      
      dailyData.set(dayKey, {
        timestamp,
        balance: initialBalance,
        transactions: [],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 找出每天的最后一条记录（最接近23:59的）
    // 优化：先按时间排序，然后遍历一次即可
    if (filteredHistory.length > 0) {
      filteredHistory.sort((a, b) => a.timestamp - b.timestamp);
      
      filteredHistory.forEach(point => {
        const pointDate = new Date(point.timestamp);
        const dayKey = getLocalDateString(pointDate);
        
        if (dailyData.has(dayKey)) {
          const dayData = dailyData.get(dayKey)!;
          const pointBalance = parseFloat(point.balance);
          // 更新为该天最接近23:59的记录（取时间最大的）
          // 如果余额为0，也更新（可能确实是0，或者是历史计算的问题）
          // 但如果是今天，不要覆盖已经设置的当前余额
          const isToday = dayKey === todayKey;
          if (point.timestamp > dayData.timestamp || (dayData.balance === 0 && pointBalance > 0 && !isToday)) {
            // 如果不是今天，或者今天的余额还是初始值，才更新
            if (!isToday || dayData.balance === parseFloat(balance)) {
              dayData.timestamp = point.timestamp;
              dayData.balance = pointBalance;
            }
          }
        }
      });
    }

    // 找出每天对应的交易记录（优化：只在需要的日期范围内查找）
    storedTransactions.forEach(tx => {
      const txTime = tx.timestamp * 1000;
      if (txTime >= startTime && txTime <= endTime) {
        const txDate = new Date(txTime);
        const dayKey = getLocalDateString(txDate);
        
        if (dailyData.has(dayKey)) {
          dailyData.get(dayKey)!.transactions.push(tx);
        }
      }
    });

    // 填充没有余额的日期：使用前一天的余额或当前余额
    const sortedDailyEntries = Array.from(dailyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedDailyEntries.forEach(([dayKey, dayData]) => {
      const isToday = dayKey === todayKey;
      
      // 如果是今天，确保使用当前余额和当前时间戳
      if (isToday) {
        dayData.balance = parseFloat(balance);
        dayData.timestamp = Date.now();
        return;
      }
      
      // 对于其他日期，如果没有余额，使用前一天的余额
      if (dayData.balance === 0) {
        const currentIndex = sortedDailyEntries.findIndex(([key]) => key === dayKey);
        
        if (currentIndex > 0) {
          // 使用前一天的余额
          const prevBalance = sortedDailyEntries[currentIndex - 1][1].balance;
          if (prevBalance > 0) {
            dayData.balance = prevBalance;
          }
        }
      }
    });

    // 转换为数组并排序（优化：合并去重和过滤逻辑）
    const result: Array<{
      dayKey: string;
      time: string;
      timestamp: number;
      balance: number;
      transactions: Transaction[];
    }> = [];
    const seenDays = new Set<string>();
    
    // 按时间正序处理
    Array.from(dailyData.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .forEach(([dayKey, data]) => {
        // 去重检查
        if (seenDays.has(dayKey)) {
          return;
        }
        
        // 过滤：只保留有余额或有交易的日期
        // 如果是今天，无论是否有交易都显示
        const isToday = dayKey === todayKey;
        
        // 对于今天，总是显示（使用当前余额）
        // 对于其他日期，至少要有余额或有交易
        if (isToday || data.balance > 0 || data.transactions.length > 0) {
          seenDays.add(dayKey);
          
          // 确保今天的余额使用当前余额
          const finalBalance = isToday ? parseFloat(balance) : data.balance;
          const finalTimestamp = isToday ? Date.now() : data.timestamp;
          
          // 调试日志
          if (isToday) {
            console.log('[资产走势] 添加今天的数据:', {
              dayKey,
              balance: finalBalance,
              timestamp: finalTimestamp,
              currentBalance: balance
            });
          }
          
          // 解析日期字符串为本地日期对象用于显示
          const [year, month, day] = dayKey.split('-').map(Number);
          const displayDate = new Date(year, month - 1, day);
          
          result.push({
            dayKey,
            time: displayDate.toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            }),
            timestamp: finalTimestamp,
            balance: finalBalance,
            transactions: data.transactions.sort((a, b) => b.timestamp - a.timestamp), // 按时间倒序
          });
        }
      });

    // 调试日志：检查是否包含今天
    const hasToday = result.some(item => item.dayKey === todayKey);
    if (!hasToday && dailyData.has(todayKey)) {
      console.warn('[资产走势] 今天的数据没有被添加到结果中，强制添加');
      const todayData = dailyData.get(todayKey)!;
      // 解析今天日期字符串为本地日期对象用于显示
      const [year, month, day] = todayKey.split('-').map(Number);
      const displayDate = new Date(year, month - 1, day);
      
      result.push({
        dayKey: todayKey,
        time: displayDate.toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
        }),
        timestamp: Date.now(),
        balance: parseFloat(balance),
        transactions: todayData.transactions,
      });
      // 重新排序
      result.sort((a, b) => a.timestamp - b.timestamp);
    }

    console.log('[资产走势] 最终结果:', {
      total: result.length,
      hasToday: result.some(item => item.dayKey === todayKey),
      todayKey,
      lastItem: result[result.length - 1]
    });

    return result;
  }, [address, balance, timeRange, activeTab, getTimeRangeBounds, getLocalDateString]);

  // 统计数据
  const trendStats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        min: 0,
        max: 0,
        change: 0,
        changePercent: 0,
      };
    }

    const balances = chartData.map(d => d.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const firstBalance = chartData[0].balance;
    const lastBalance = chartData[chartData.length - 1].balance;
    const change = lastBalance - firstBalance;
    const changePercent = firstBalance > 0 ? (change / firstBalance) * 100 : 0;

    return {
      min,
      max,
      change,
      changePercent,
    };
  }, [chartData]);

  const formatBalance = (value: number) => {
    return `${value.toFixed(6)} ETH`;
  };

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'day', label: '最近一天' },
    { value: 'week', label: '最近一周' },
    { value: 'month', label: '最近一月' },
    { value: 'year', label: '最近一年' },
    { value: 'all', label: '全部' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-secondary-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">我的钱包</h1>
          <p className="text-secondary-600">查看钱包余额、交易记录等信息</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

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
                <p className="text-yellow-600 text-xs">
                  配置文件位置: <code className="bg-yellow-100 px-1 rounded">frontend/.env</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 钱包信息卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 钱包地址卡片 */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Wallet className="text-primary-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-secondary-900">钱包地址</h2>
            </div>
            
            {myWalletAddress ? (
              <div className="space-y-4">
                {/* 我的钱包地址 */}
                <div>
                  <p className="text-xs text-secondary-500 mb-2">我的钱包地址</p>
                  <div className="bg-secondary-50 rounded-lg p-3 mb-2">
                    <p className="text-sm font-mono text-secondary-700 break-all">
                      {myWalletAddress}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyAddress(myWalletAddress)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors text-sm text-secondary-700"
                  >
                    {copiedAddress === myWalletAddress ? (
                      <>
                        <CheckCircle size={16} />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>复制地址</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 当前钱包地址（仅在不同于我的钱包地址时显示） */}
                {!isCurrentAddressMyWallet && address && (
                  <div>
                    <p className="text-xs text-secondary-500 mb-2">当前钱包地址</p>
                    <div className="bg-blue-50 rounded-lg p-3 mb-2">
                      <p className="text-sm font-mono text-secondary-700 break-all">
                        {address}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyAddress(address)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-sm text-secondary-700"
                    >
                      {copiedAddress === address ? (
                        <>
                          <CheckCircle size={16} />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>复制地址</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-secondary-500 text-sm">
                未配置钱包地址
              </div>
            )}
          </div>

          {/* 余额卡片 */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="text-green-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-secondary-900">余额</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-3xl font-bold text-secondary-900">
                {isLoading ? '加载中...' : `${parseFloat(balance).toFixed(6)} ETH`}
              </p>
              <p className="text-sm text-secondary-500 mt-1">Sepolia 测试网</p>
            </div>
            
            <button
              onClick={refresh}
              disabled={isLoading || !address}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>刷新余额</span>
            </button>
          </div>

          {/* 查询其他地址 */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="text-blue-600" size={20} />
              </div>
              <h2 className="text-lg font-semibold text-secondary-900">查询地址</h2>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleUseCustomAddress}
                disabled={!customAddress || isLoading}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                查询
              </button>
            </div>
          </div>
        </div>

        {/* 交易记录和资产走势标签页 */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          {/* 标签页切换 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 border-b border-secondary-200">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === 'transactions'
                    ? 'border-primary-500 text-primary-700 font-semibold'
                    : 'border-transparent text-secondary-600 hover:text-secondary-900'
                }`}
              >
                <List size={18} />
                <span>最近交易</span>
                {transactions.length > 0 && (
                  <span className="ml-1 text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-full">
                    {transactions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('trend')}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === 'trend'
                    ? 'border-primary-500 text-primary-700 font-semibold'
                    : 'border-transparent text-secondary-600 hover:text-secondary-900'
                }`}
              >
                <TrendingUp size={18} />
                <span>资产走势</span>
              </button>
            </div>
            <button
              onClick={refresh}
              disabled={isLoading || !address}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>刷新</span>
            </button>
          </div>

          {/* 交易记录内容 */}
          {activeTab === 'transactions' && (
            <>
              {!address ? (
                <div className="text-center py-12 text-secondary-500">
                  <Wallet size={48} className="mx-auto mb-4 text-secondary-300" />
                  <p>请先配置钱包地址</p>
                </div>
              ) : isLoading && transactions.length === 0 ? (
                <div className="text-center py-12 text-secondary-500">
                  <RefreshCw size={32} className="mx-auto mb-4 text-secondary-300 animate-spin" />
                  <p>加载交易记录中...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-secondary-500">
                  <p>暂无交易记录</p>
                  <p className="text-sm mt-2 text-secondary-400">
                    该地址还没有任何交易
                  </p>
                </div>
              ) : (
                <>
                  {/* 交易列表 */}
                  <div className="space-y-3 mb-4">
                    {paginatedTransactions.map((tx) => (
                      <TransactionCard
                        key={tx.hash}
                        transaction={tx}
                        onViewEtherscan={viewOnEtherscan}
                      />
                    ))}
                  </div>

                  {/* 分页控件 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                        <span>上一页</span>
                      </button>

                      <span className="text-sm text-secondary-600">
                        第 {currentPage} / {totalPages} 页
                      </span>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>下一页</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* 资产走势内容 */}
          {activeTab === 'trend' && (
            <>
              {!address ? (
                <div className="text-center py-12 text-secondary-500">
                  <TrendingUp size={48} className="mx-auto mb-4 text-secondary-300" />
                  <p>请先配置钱包地址</p>
                </div>
              ) : chartData.length === 0 ? (
                <div className="text-center py-12 text-secondary-500">
                  <TrendingUp size={48} className="mx-auto mb-4 text-secondary-300" />
                  <p>暂无交易数据</p>
                  <p className="text-sm mt-2 text-secondary-400">
                    需要先有交易记录才能显示资产走势
                  </p>
                </div>
              ) : (
                <>
                  {/* 统计卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                      <div className="text-sm text-secondary-500 mb-1">当前余额</div>
                      <div className="text-2xl font-bold text-secondary-900">
                        {parseFloat(balance).toFixed(6)} ETH
                      </div>
                    </div>
                    <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                      <div className="text-sm text-secondary-500 mb-1">最低余额</div>
                      <div className="text-2xl font-bold text-secondary-900">
                        {trendStats.min.toFixed(6)} ETH
                      </div>
                    </div>
                    <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                      <div className="text-sm text-secondary-500 mb-1">最高余额</div>
                      <div className="text-2xl font-bold text-secondary-900">
                        {trendStats.max.toFixed(6)} ETH
                      </div>
                    </div>
                    <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                      <div className="text-sm text-secondary-500 mb-1">期间变化</div>
                      <div className={`text-2xl font-bold ${trendStats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trendStats.change >= 0 ? '+' : ''}{trendStats.change.toFixed(6)} ETH
                      </div>
                      <div className={`text-xs mt-1 ${trendStats.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({trendStats.changePercent >= 0 ? '+' : ''}{trendStats.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  {/* 时间范围选择 */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Calendar size={20} className="text-secondary-500" />
                      <span className="text-sm font-semibold text-secondary-700">时间范围</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {timeRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTimeRange(option.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            timeRange === option.value
                              ? 'bg-primary-500 text-white'
                              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 图表 */}
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-secondary-900">余额变化趋势</h3>
                      <p className="text-sm text-secondary-500 mt-1">
                        显示 {timeRangeOptions.find(o => o.value === timeRange)?.label} 的资产变化
                      </p>
                    </div>

                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart 
                        data={chartData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="time"
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          tickFormatter={formatBalance}
                          domain={(() => {
                            if (chartData.length === 0) {
                              return [0, 1];
                            }
                            const balances = chartData.map(d => d.balance);
                            const min = Math.min(...balances);
                            const max = Math.max(...balances);
                            const range = max - min;
                            // 向下留5%的空间，但不少于0；向上留5%的空间
                            return [
                              Math.max(0, min - range * 0.05),
                              max + range * 0.05
                            ];
                          })()}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number) => formatBalance(value)}
                          labelFormatter={(label) => `日期: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ 
                            r: 4,
                            style: { cursor: 'pointer' }
                          }}
                          activeDot={{ 
                            r: 6,
                            style: { cursor: 'pointer' }
                          }}
                          name="余额 (ETH)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default WalletPage;

