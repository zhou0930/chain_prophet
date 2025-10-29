import React from 'react';
import { EVMBalanceResult } from '../types';
import { Wallet, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface EVMBalanceCardProps {
  result: EVMBalanceResult;
  onClose: () => void;
}

const EVMBalanceCard: React.FC<EVMBalanceCardProps> = ({ result, onClose }) => {
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(6);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white border border-secondary-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Wallet size={20} className="text-primary-500" />
          <h3 className="text-sm font-medium text-secondary-900">EVM 余额查询</h3>
        </div>
        <button
          onClick={onClose}
          className="text-secondary-400 hover:text-secondary-600"
        >
          <XCircle size={16} />
        </button>
      </div>

      {result.success ? (
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
                  {result.address}
                </code>
                <button
                  onClick={() => copyToClipboard(result.address)}
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
                {formatBalance(result.balance)} ETH
              </div>
            </div>
            
            <div>
              <label className="text-xs text-secondary-600">网络</label>
              <div className="text-sm text-secondary-700">{result.network}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <XCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">查询失败</span>
          </div>
          
          {result.error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EVMBalanceCard;
