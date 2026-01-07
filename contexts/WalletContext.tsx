"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import algosdk from 'algosdk';

interface WalletContextType {
  isLoggedIn: boolean;
  address: string | null;
  balance: number | null;
  isBalanceVisible: boolean;
  secretKey: Uint8Array | null;
  mnemonic: string | null;
  login: (mnemonic: string) => Promise<void>;
  logout: () => void;
  toggleBalanceVisibility: () => void;
  fetchBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ADDRESS: 'algoAddress',
  LOGGED_IN: 'loggedIn',
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<Uint8Array | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const fetchBalance = useCallback(async (currentAddress?: string) => {
    const addressToFetch = currentAddress || address;
    if (!addressToFetch) return;

    try {
      const response = await fetch(`/api/balance/${addressToFetch}`);
      const data = await response.json();
      if (data.success && data.data) {
        setBalance(data.data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(null);
    }
  }, [address]);

  // Auto-login on mount if user was previously logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem(STORAGE_KEYS.ADDRESS);
      const storedLoggedIn = localStorage.getItem(STORAGE_KEYS.LOGGED_IN);

      if (storedLoggedIn === 'true' && storedAddress) {
        setIsLoggedIn(true);
        setAddress(storedAddress);
        fetchBalance(storedAddress);
      }
    }
  }, []);

  const login = async (mnemonicPhrase: string): Promise<void> => {
    try {
      const account = algosdk.mnemonicToSecretKey(mnemonicPhrase.trim());
      
      setSecretKey(account.sk);
      setMnemonic(mnemonicPhrase.trim());
      setAddress(account.addr.toString());
      setIsLoggedIn(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADDRESS, account.addr.toString());
        localStorage.setItem(STORAGE_KEYS.LOGGED_IN, 'true');
      }

      await fetchBalance(account.addr.toString());
    } catch (error) {
      throw new Error('Invalid mnemonic phrase');
    }
  };

  const logout = () => {
    setSecretKey(null);
    setMnemonic(null);
    setAddress(null);
    setIsLoggedIn(false);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.LOGGED_IN);
    }
    setBalance(null);
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev);
  };

  // Refresh balance every 30 seconds
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchBalance]);

  return (
    <WalletContext.Provider
      value={{
        isLoggedIn,
        address,
        balance,
        isBalanceVisible,
        secretKey,
        mnemonic,
        login,
        logout,
        toggleBalanceVisibility,
        fetchBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
