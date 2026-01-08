"use client"

import { useWallet } from '@/contexts/WalletContext';
import { Eye, EyeOff, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function BalanceChip() {
  const { balance, isBalanceVisible, toggleBalanceVisibility } = useWallet();

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-premium border border-white/10 shadow-sm hover:shadow-md transition-all duration-300">
      <Coins className="w-3.5 h-3.5 text-primary opacity-70" />
      <span className="text-xs font-bold tracking-tight min-w-[60px] text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={isBalanceVisible ? 'visible' : 'hidden'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {isBalanceVisible ? (
              balance !== null ? `${balance.toFixed(2)} ALGO` : '...'
            ) : (
              '••••••'
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded-full hover:bg-primary/10 transition-colors"
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
