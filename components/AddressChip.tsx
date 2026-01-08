"use client"

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Copy, Check, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAddress, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ProfileModal from './ProfileModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddressChip() {
  const { address, logout } = useWallet();
  const [copied, setCopied] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (address) {
      await copyToClipboard(address);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Address copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!address) return null;

  return (
    <>
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full glass-premium border border-white/10 shadow-sm transition-all duration-300">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setProfileOpen(true)}
          className="h-7 px-3 flex items-center gap-2 rounded-full hover:bg-primary/10 transition-all text-xs font-bold"
        >
          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-2.5 h-2.5 text-primary" />
          </div>
          <span className="font-mono tracking-tight">{formatAddress(address)}</span>
        </Button>
        
        <div className="flex items-center border-l border-white/10 pl-1 gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-primary/10 transition-colors"
            onClick={handleCopy}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="h-3.5 w-3.5 opacity-70" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-rose-500/10 transition-colors group"
            onClick={logout}
          >
            <LogOut className="h-3.5 w-3.5 text-muted-foreground group-hover:text-rose-500 transition-colors" />
          </Button>
        </div>
      </div>
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
