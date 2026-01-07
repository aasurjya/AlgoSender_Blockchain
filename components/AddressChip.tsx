"use client"

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Copy, Check, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatAddress, copyToClipboard } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import ProfileModal from './ProfileModal';

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
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-full glass-card">
        <button
          onClick={() => setProfileOpen(true)}
          className="text-sm font-mono hover:text-primary transition-colors"
        >
          {formatAddress(address)}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-3 w-3" />
        </Button>
      </div>
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
