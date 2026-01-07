"use client"

import { useWallet } from '@/contexts/WalletContext';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BalanceChip() {
  const { balance, isBalanceVisible, toggleBalanceVisibility } = useWallet();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
      <span className="text-sm font-medium">
        {isBalanceVisible ? (
          balance !== null ? `${balance.toFixed(2)} ALGO` : '...'
        ) : (
          '••••••'
        )}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={toggleBalanceVisibility}
      >
        {isBalanceVisible ? (
          <Eye className="h-3 w-3" />
        ) : (
          <EyeOff className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
