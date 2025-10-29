import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { evmAPI } from '../services/api';
import { EVMBalanceResult } from '../types';

export const useEVM = () => {
  const [balanceResult, setBalanceResult] = useState<EVMBalanceResult | null>(null);

  // 查询余额
  const getBalanceMutation = useMutation({
    mutationFn: ({ address, privateKey }: { address: string; privateKey?: string }) =>
      evmAPI.getBalance(address, privateKey),
    onSuccess: (result) => {
      setBalanceResult(result);
    },
    onError: (error) => {
      console.error('查询余额失败:', error);
      setBalanceResult({
        address: '',
        balance: '0',
        network: 'Sepolia',
        success: false,
        error: error instanceof Error ? error.message : '查询失败',
      });
    },
  });

  // 查询余额
  const getBalance = useCallback((address: string, privateKey?: string) => {
    getBalanceMutation.mutate({ address, privateKey });
  }, [getBalanceMutation]);

  // 从私钥推导地址并查询余额
  const getBalanceFromPrivateKey = useCallback((privateKey: string) => {
    getBalanceMutation.mutate({ address: '', privateKey });
  }, [getBalanceMutation]);

  // 验证地址格式
  const validateAddress = useCallback((address: string): boolean => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  }, []);

  // 验证私钥格式
  const validatePrivateKey = useCallback((privateKey: string): boolean => {
    const privateKeyRegex = /^0x[a-fA-F0-9]{64}$/;
    return privateKeyRegex.test(privateKey);
  }, []);

  // 提取地址或私钥
  const extractAddressOrPrivateKey = useCallback((text: string): { address?: string; privateKey?: string } => {
    const addressRegex = /0x[a-fA-F0-9]{40}/g;
    const privateKeyRegex = /0x[a-fA-F0-9]{64}/g;
    
    const addressMatch = text.match(addressRegex);
    const privateKeyMatch = text.match(privateKeyRegex);
    
    if (privateKeyMatch) {
      return { privateKey: privateKeyMatch[0] };
    } else if (addressMatch) {
      return { address: addressMatch[0] };
    }
    
    return {};
  }, []);

  return {
    // 状态
    balanceResult,
    isLoading: getBalanceMutation.isPending,
    error: getBalanceMutation.error,
    
    // 操作
    getBalance,
    getBalanceFromPrivateKey,
    validateAddress,
    validatePrivateKey,
    extractAddressOrPrivateKey,
    
    // 重置
    clearResult: () => setBalanceResult(null),
  };
};
