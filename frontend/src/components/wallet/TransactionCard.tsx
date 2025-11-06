import React, { useState } from 'react';
import { Transaction } from '../../hooks/useWallet';
import { ChevronDown, ChevronRight, ExternalLink, ArrowDown, ArrowUp } from 'lucide-react';

interface TransactionCardProps {
  transaction: Transaction;
  onViewEtherscan: (hash: string) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onViewEtherscan }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'self':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'success':
        return '成功';
      case 'failed':
        return '失败';
      case 'pending':
        return '待确认';
      case 'self':
        return '内部转账';
      default:
        return '未知';
    }
  };

  return (
    <div className="border border-secondary-200 rounded-lg overflow-hidden bg-white">
      {/* 可点击的标题栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary-50 transition-colors text-left"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* 展开/收起图标 */}
          {isExpanded ? (
            <ChevronDown size={16} className="text-secondary-500 flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="text-secondary-500 flex-shrink-0" />
          )}

          {/* 交易方向图标 */}
          {transaction.status === 'self' ? (
            <ArrowDown size={16} className="text-blue-500 flex-shrink-0" />
          ) : transaction.isIncoming ? (
            <ArrowDown size={16} className="text-green-500 flex-shrink-0" />
          ) : (
            <ArrowUp size={16} className="text-red-500 flex-shrink-0" />
          )}

          {/* 时间 */}
          <span className="text-sm text-secondary-600 flex-shrink-0">
            {formatTime(transaction.timestamp)}
          </span>

          {/* 状态标签 */}
          <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getStatusColor()}`}>
            {getStatusText()}
          </span>

          {/* 金额 */}
          <span
            className={`text-sm font-semibold ml-auto flex-shrink-0 ${
              transaction.status === 'self' 
                ? 'text-blue-600' 
                : transaction.isIncoming 
                  ? 'text-green-600' 
                  : 'text-red-600'
            }`}
          >
            {transaction.status === 'self' 
              ? '=' 
              : transaction.isIncoming 
                ? '+' 
                : '-'}{parseFloat(transaction.value).toFixed(6)} ETH
          </span>
        </div>
      </button>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <div className="px-4 py-3 bg-secondary-50 border-t border-secondary-200 space-y-3">
          {/* 交易哈希 */}
          <div>
            <div className="text-xs font-semibold text-secondary-600 mb-1">交易哈希</div>
            <div className="text-sm font-mono text-secondary-800 bg-white p-2 rounded border border-secondary-200 break-all">
              {transaction.hash}
            </div>
          </div>

          {/* 地址信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transaction.status === 'self' ? (
              <div>
                <div className="text-xs font-semibold text-secondary-600 mb-1">内部转账</div>
                <div className="text-sm font-mono text-secondary-800 bg-white p-2 rounded border border-secondary-200 break-all">
                  {transaction.from} → {transaction.to || transaction.from}
                </div>
              </div>
            ) : transaction.isIncoming ? (
              <div>
                <div className="text-xs font-semibold text-secondary-600 mb-1">发送方</div>
                <div className="text-sm font-mono text-secondary-800 bg-white p-2 rounded border border-secondary-200 break-all">
                  {transaction.from}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold text-secondary-600 mb-1">发送到</div>
                <div className="text-sm font-mono text-secondary-800 bg-white p-2 rounded border border-secondary-200 break-all">
                  {transaction.to || '合约创建'}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-semibold text-secondary-600 mb-1">区块号</div>
              <div className="text-sm text-secondary-800 bg-white p-2 rounded border border-secondary-200">
                #{transaction.blockNumber.toString()}
              </div>
            </div>
          </div>

          {/* Gas 信息 */}
          {(transaction.gasUsed || transaction.gasPrice) && (
            <div>
              <div className="text-xs font-semibold text-secondary-600 mb-1">Gas 信息</div>
              <div className="text-xs text-secondary-800 bg-white p-2 rounded border border-secondary-200 space-y-1">
                {transaction.gasUsed && (
                  <div>Gas Used: {transaction.gasUsed.toString()}</div>
                )}
                {transaction.gasPrice && (
                  <div>Gas Price: {transaction.gasPrice.toString()} wei</div>
                )}
              </div>
            </div>
          )}

          {/* 查看详情按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewEtherscan(transaction.hash);
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm"
          >
            <ExternalLink size={16} />
            <span>在 Etherscan 上查看详情</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;

