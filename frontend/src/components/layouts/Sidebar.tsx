import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Wallet, Bot, ShoppingBag, Package, BookOpen, Send } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      label: 'AI 对话',
      icon: MessageSquare,
    },
    {
      path: '/wallet',
      label: '我的钱包',
      icon: Wallet,
    },
    {
      path: '/my-nft',
      label: '我的 NFT',
      icon: Package,
    },
    {
      path: '/nft',
      label: 'NFT 市场',
      icon: ShoppingBag,
    },
    {
      path: '/address-book',
      label: '地址簿',
      icon: BookOpen,
    },
    {
      path: '/transfer',
      label: '转账与查余额',
      icon: Send,
    },
  ];

  return (
    <div className={`bg-white border-r border-secondary-200 flex flex-col ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-secondary-200">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 text-white rounded-lg flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-secondary-900">Chain Prophet</h1>
            <p className="text-xs text-secondary-500">Web3 AI 代理</p>
          </div>
        </Link>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
