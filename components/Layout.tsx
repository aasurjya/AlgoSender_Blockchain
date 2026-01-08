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
      <nav className="glass-premium border-b-0 sticky top-0 z-50 shadow-lg backdrop-blur-md bg-white/70 dark:bg-black/70">        
        <div className="container mx-auto px-4 py-3">
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
                    variant="ghost"
                    size="sm"
                    className={`relative gap-2 transition-all duration-300 ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                  >
                    <Wallet className="w-4 h-4" />
                    Dashboard
                    {isActive('/') && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-[-12px] left-0 right-0 h-[3px] bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
                <Link href="/send">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative gap-2 transition-all duration-300 ${isActive('/send') ? 'text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                  >
                    <Send className="w-4 h-4" />
                    Send ALGO
                    {isActive('/send') && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-[-12px] left-0 right-0 h-[3px] bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
                <Link href="/transactions">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative gap-2 transition-all duration-300 ${isActive('/transactions') ? 'text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                  >
                    <History className="w-4 h-4" />
                    History
                    {isActive('/transactions') && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-[-12px] left-0 right-0 h-[3px] bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
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

          {/* Mobile Navigation - Hidden in top nav, moved to bottom floating bar */}
          <div className="md:hidden flex items-center space-x-2">
            {isLoggedIn && (
              <div className="flex items-center space-x-2 mr-2">
                <BalanceChip />
              </div>
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
            
            {!isLoggedIn && (
              <Button
                variant="default"
                size="icon"
                className="gradient-apple-blue text-white rounded-full h-9 w-9"
                onClick={() => setProfileOpen(true)}
              >
                <Wallet className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Floating Bottom Mobile Nav */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
        <div className="glass-premium rounded-full p-2 flex items-center justify-around shadow-2xl border border-white/20 dark:border-white/5">
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full flex-col h-12 gap-0.5 rounded-full transition-all duration-300 ${isActive('/') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            >
              <Wallet className={`w-5 h-5 ${isActive('/') ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
            </Button>
          </Link>
          <Link href="/send" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full flex-col h-12 gap-0.5 rounded-full transition-all duration-300 ${isActive('/send') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            >
              <Send className={`w-5 h-5 ${isActive('/send') ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Send</span>
            </Button>
          </Link>
          <Link href="/transactions" className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full flex-col h-12 gap-0.5 rounded-full transition-all duration-300 ${isActive('/transactions') ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            >
              <History className={`w-5 h-5 ${isActive('/transactions') ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Activity</span>
            </Button>
          </Link>
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileOpen(true)}
              className="flex-1 flex-col h-12 gap-0.5 rounded-full text-muted-foreground hover:text-primary transition-all duration-300"
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
            </Button>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 pb-32 md:pb-8">
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
