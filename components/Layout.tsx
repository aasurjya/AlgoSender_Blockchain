"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, Wallet, Send, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { motion } from 'framer-motion';
import ProfileModal from '@/components/ProfileModal';
import { useWallet } from '@/contexts/WalletContext';
import BalanceChip from '@/components/BalanceChip';
import AddressChip from '@/components/AddressChip';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { isLoggedIn } = useWallet();
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen relative">
      <nav className="glass-premium border-b-0 sticky top-0 z-50 shadow-lg">        
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 gradient-apple-blue rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-200">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-primary">
                  AlgoSender
                </h1>
                <p className="text-xs text-muted-foreground">Algorand TestNet</p>
              </div>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/">
                  <Button
                    variant={isActive('/') ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-2 transition-all duration-200 ${isActive('/') ? 'bg-primary text-white' : ''}`}
                  >
                    <Wallet className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/send">
                  <Button
                    variant={isActive('/send') ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-2 transition-all duration-200 ${isActive('/send') ? 'bg-primary text-white' : ''}`}
                  >
                    <Send className="w-4 h-4" />
                    Send ALGO
                  </Button>
                </Link>
                <Link href="/transactions">
                  <Button
                    variant={isActive('/transactions') ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-2 transition-all duration-200 ${isActive('/transactions') ? 'bg-primary text-white' : ''}`}
                  >
                    <History className="w-4 h-4" />
                    History
                  </Button>
                </Link>
              </div>

              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <BalanceChip />
                  <AddressChip />
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="gradient-apple-blue text-white gap-2"
                  onClick={() => setProfileOpen(true)}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-primary/10 transition-all duration-200"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0 text-primary" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100 text-primary" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden justify-around mt-4 space-x-2">
            <Link href="/" className="flex-1">
              <Button
                variant={isActive('/') ? 'default' : 'outline'}
                size="sm"
                className={`w-full gap-2 transition-all duration-200 ${isActive('/') ? 'bg-primary text-white' : ''}`}
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/send" className="flex-1">
              <Button
                variant={isActive('/send') ? 'default' : 'outline'}
                size="sm"
                className={`w-full gap-2 transition-all duration-200 ${isActive('/send') ? 'bg-primary text-white' : ''}`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </Link>
            <Link href="/transactions" className="flex-1">
              <Button
                variant={isActive('/transactions') ? 'default' : 'outline'}
                size="sm"
                className={`w-full gap-2 transition-all duration-200 ${isActive('/transactions') ? 'bg-primary text-white' : ''}`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="glass-premium border-t-0 mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-primary">
                © 2024 AlgoSender
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                For educational TestNet use only
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-2 glass-card px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse glow-green" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  TestNet Active
                </span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
