import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Trash2, ShieldCheck, AlertTriangle, Search, Edit2 } from 'lucide-react';
import { whitelistService, blacklistService } from '../services/addressBook';
import { AddressEntry } from '../types';

type ListType = 'whitelist' | 'blacklist';

const AddressBookPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ListType>('whitelist');
  const [whitelist, setWhitelist] = useState<AddressEntry[]>([]);
  const [blacklist, setBlacklist] = useState<AddressEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 添加表单状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ address: '', name: '', nickname: '' });
  
  // 编辑表单状态
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', nickname: '' });

  // 加载列表数据
  const loadAddresses = useCallback(() => {
    setLoading(true);
    try {
      if (activeTab === 'whitelist') {
        setWhitelist(whitelistService.getAll());
      } else {
        setBlacklist(blacklistService.getAll());
      }
    } catch (error) {
      console.error('加载列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // 初始化时加载两个列表的数量
  useEffect(() => {
    try {
      setWhitelist(whitelistService.getAll());
      setBlacklist(blacklistService.getAll());
    } catch (error) {
      console.error('初始化加载失败:', error);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
    // 切换标签时关闭添加表单和编辑表单
    setShowAddForm(false);
    setFormData({ address: '', name: '', nickname: '' });
    setEditingId(null);
    setEditFormData({ name: '', nickname: '' });
  }, [loadAddresses]);

  // 添加地址
  const handleAdd = () => {
    if (!formData.address) return;
    
    try {
      if (activeTab === 'whitelist') {
        whitelistService.add(formData.address, formData.name, formData.nickname);
        setWhitelist(whitelistService.getAll());
      } else {
        blacklistService.add(formData.address, formData.name, formData.nickname);
        setBlacklist(blacklistService.getAll());
      }
      setFormData({ address: '', name: '', nickname: '' });
      setShowAddForm(false);
      loadAddresses();
    } catch (error: any) {
      console.error('添加失败:', error);
      alert(error.message || '添加失败');
    }
  };

  // 编辑地址
  const handleEdit = (entry: AddressEntry) => {
    setEditingId(entry.id);
    setEditFormData({ name: entry.name || '', nickname: entry.nickname || '' });
    setShowAddForm(false);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (editingId === null) return;
    
    try {
      if (activeTab === 'whitelist') {
        whitelistService.update(editingId, editFormData.name || undefined, editFormData.nickname || undefined);
        setWhitelist(whitelistService.getAll());
      } else {
        blacklistService.update(editingId, editFormData.name || undefined, editFormData.nickname || undefined);
        setBlacklist(blacklistService.getAll());
      }
      setEditingId(null);
      setEditFormData({ name: '', nickname: '' });
      loadAddresses();
    } catch (error: any) {
      console.error('保存失败:', error);
      alert(error.message || '保存失败');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({ name: '', nickname: '' });
  };

  // 删除地址
  const handleDelete = (id: number) => {
    if (!confirm('确定要删除这个地址吗？')) return;
    
    try {
      if (activeTab === 'whitelist') {
        whitelistService.delete(id);
        setWhitelist(whitelistService.getAll());
      } else {
        blacklistService.delete(id);
        setBlacklist(blacklistService.getAll());
      }
      loadAddresses();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 过滤列表
  const currentList = activeTab === 'whitelist' ? whitelist : blacklist;
  const filteredList = currentList.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      item.address.toLowerCase().includes(search) ||
      item.name?.toLowerCase().includes(search) ||
      item.nickname?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="h-full overflow-y-auto bg-secondary-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">地址簿</h1>
          <p className="text-secondary-600">管理白名单和黑名单地址</p>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 mb-6">
          <div className="flex border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('whitelist')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'whitelist'
                  ? 'border-green-500 text-green-700 font-semibold'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <ShieldCheck size={20} />
              <span>白名单</span>
              <span className="bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-full text-sm">
                {whitelist.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('blacklist')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'blacklist'
                  ? 'border-red-500 text-red-700 font-semibold'
                  : 'border-transparent text-secondary-600 hover:text-secondary-900'
              }`}
            >
              <AlertTriangle size={20} />
              <span>黑名单</span>
              <span className="bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-full text-sm">
                {blacklist.length}
              </span>
            </button>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索地址、名字或昵称..."
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
                setEditFormData({ name: '', nickname: '' });
              }}
              disabled={showAddForm || editingId !== null}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showAddForm || editingId !== null
                  ? 'bg-secondary-200 text-secondary-700 cursor-not-allowed'
                  : activeTab === 'whitelist'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <Plus size={18} />
              <span>添加地址</span>
            </button>
          </div>
        </div>

        {/* 添加表单 */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4">添加{activeTab === 'whitelist' ? '白名单' : '黑名单'}地址</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">地址 *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">名字</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">昵称</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ address: '', name: '', nickname: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 编辑表单 */}
        {editingId !== null && (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4">编辑{activeTab === 'whitelist' ? '白名单' : '黑名单'}地址</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">地址</label>
                <input
                  type="text"
                  value={currentList.find(item => item.id === editingId)?.address || ''}
                  disabled
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg bg-secondary-50 text-secondary-500 cursor-not-allowed"
                />
                <p className="text-xs text-secondary-500 mt-1">地址不可修改</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">名字</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">昵称</label>
                <input
                  type="text"
                  value={editFormData.nickname}
                  onChange={(e) => setEditFormData({ ...editFormData, nickname: e.target.value })}
                  placeholder="可选"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 地址列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          {loading ? (
            <div className="text-center py-12 text-secondary-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p>加载中...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 text-secondary-500">
              <Users size={48} className="mx-auto mb-4 text-secondary-300" />
              <p>{searchTerm ? '没有找到匹配的地址' : `暂无${activeTab === 'whitelist' ? '白名单' : '黑名单'}地址`}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">地址</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">名字</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">昵称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">添加时间</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            {activeTab === 'whitelist' ? (
                              <ShieldCheck className="text-green-500" size={18} />
                            ) : (
                              <AlertTriangle className="text-red-500" size={18} />
                            )}
                          </div>
                          <span className="text-sm font-mono text-secondary-900">{item.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-700">{item.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-secondary-700">{item.nickname || '-'}</td>
                      <td className="px-6 py-4 text-sm text-secondary-500">
                        {new Date(item.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={editingId !== null}
                            className={`text-primary-500 hover:text-primary-700 transition-colors ${
                              editingId !== null ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="编辑"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={editingId !== null}
                            className={`text-red-500 hover:text-red-700 transition-colors ${
                              editingId !== null ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="删除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressBookPage;

