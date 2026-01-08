"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { Copy, LogOut, Loader2, ShieldCheck, AlertTriangle, Key, Wallet as WalletIcon } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { isLoggedIn, address, login, logout } = useWallet();
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!mnemonic.trim()) {
      toast({
        title: 'Mnemonic Required',
        description: 'Please enter your 25-word mnemonic phrase',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await login(mnemonic);
      toast({
        title: 'Login Successful',
        description: 'Your wallet has been loaded',
      });
      setMnemonic('');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid mnemonic phrase',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'Your wallet has been disconnected',
    });
    onOpenChange(false);
  };

  const handleCopyAddress = () => {
    if (address) {
      copyToClipboard(address);
      toast({
        title: 'Address Copied',
        description: 'Address copied to clipboard',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 glass-premium shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
        
        <div className="relative p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
              {isLoggedIn ? (
                <>
                  <div className="p-2 bg-emerald-500/20 rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  Account Profile
                </>
              ) : (
                <>
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Key className="w-6 h-6 text-blue-500" />
                  </div>
                  Secure Access
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base font-medium opacity-80">
              {isLoggedIn
                ? 'Manage your connected Algorand wallet'
                : 'Enter your mnemonic phrase to securely load your wallet'}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {isLoggedIn ? (
              <motion.div 
                key="logged-in"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-5 glass-card rounded-[1.5rem] space-y-4 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <WalletIcon className="w-24 h-24" />
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Address</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-primary/10 rounded-full"
                    >
                      <Copy className="w-3 h-3 mr-1.5" />
                      Copy Address
                    </Button>
                  </div>
                  <p className="font-mono text-sm break-all bg-black/20 dark:bg-white/5 p-4 rounded-xl border border-white/5 font-semibold text-primary/90">
                    {address}
                  </p>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="uppercase tracking-wide">Ready for TestNet Transactions</span>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight">Security Protocol</p>
                      <ul className="space-y-1.5 text-xs font-medium text-muted-foreground leading-relaxed">
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          Keys stay exclusively in local memory
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          Encrypted transmission to Algorand nodes
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />
                          Automatic session cleanup on close
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all border-0"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="logged-out"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label htmlFor="mnemonic" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mnemonic Phrase (25 words)</Label>
                  <Textarea
                    id="mnemonic"
                    placeholder="word1 word2 word3..."
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    rows={4}
                    className="font-mono text-sm glass-premium rounded-2xl p-4 border-white/10 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="space-y-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">Warning Advisory</p>
                      <ul className="space-y-1.5 text-xs font-medium text-muted-foreground leading-relaxed">
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-amber-400 rounded-full" />
                          Never use your MainNet mnemonic here
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-amber-400 rounded-full" />
                          This is a TestNet-only environment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-widest gradient-apple-blue border-0 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all text-white disabled:opacity-50"
                  onClick={handleLogin}
                  disabled={loading || !mnemonic.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Connect Securely'
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
