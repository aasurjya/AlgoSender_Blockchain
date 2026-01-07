"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { Copy, LogOut, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <ShieldCheck className="w-5 h-5 text-green-500" />
                My Wallet
              </>
            ) : (
              'Login with Mnemonic'
            )}
          </DialogTitle>
          <DialogDescription>
            {isLoggedIn
              ? 'Your wallet is connected and ready to use'
              : 'Enter your Algorand mnemonic to access your wallet'}
          </DialogDescription>
        </DialogHeader>

        {isLoggedIn ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Wallet Address:</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-8"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="font-mono text-xs break-all bg-background p-2 rounded">
                {address}
              </p>
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Active wallet loaded</span>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Security Notes:</p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>✓ Your mnemonic stays in browser memory</li>
                    <li>✓ Never saved or uploaded to servers</li>
                    <li>✓ Never stored in any database</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mnemonic">Mnemonic Phrase (25 words)</Label>
              <Textarea
                id="mnemonic"
                placeholder="Enter your 25-word mnemonic phrase..."
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Important:</p>
                  <ul className="space-y-1 text-amber-800 dark:text-amber-200">
                    <li>⚠️ Your mnemonic never leaves your browser</li>
                    <li>⚠️ It is not sent to the server</li>
                    <li>⚠️ TestNet use only — never paste MainNet mnemonic</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={loading || !mnemonic.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
