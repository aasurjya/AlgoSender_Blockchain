"use client"

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, CheckCircle, Clock, XCircle, Wallet, Activity, 
  History, Sparkles, ArrowRight, ArrowUpRight, ExternalLink, 
  HelpCircle, Droplets, Globe, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { algorandApi, type Stats, type Transaction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { formatAddress, formatDate } from '@/lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
    fetchRecentTransactions();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await algorandApi.getStats();
      setStats(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await algorandApi.getAllTransactions({ limit: 5 });
      setRecentTransactions(response.data.transactions);
    } catch (error: any) {
      console.error('Failed to fetch recent transactions', error);
    } finally {
      setLoadingTxs(false);
    }
  };

  const testnetResources = [
    {
      title: 'TestNet Faucet',
      desc: 'Get free TestNet ALGO for testing your transactions.',
      icon: Droplets,
      href: 'https://bank.testnet.algorand.network/',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Pera Explorer',
      desc: 'View all transactions and network activity in real-time.',
      icon: Globe,
      href: 'https://testnet.explorer.perawallet.app/',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'AlgoNode',
      desc: 'Connect to fast, reliable Algorand APIs and infrastructure.',
      icon: Activity,
      href: 'https://algonode.io/',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  const statCards = [
    { title: 'Total Transactions', value: stats?.total || 0, icon: TrendingUp, gradient: 'from-blue-500 via-indigo-500 to-purple-500' },
    { title: 'Confirmed', value: stats?.confirmed || 0, icon: CheckCircle, gradient: 'from-emerald-400 via-green-500 to-teal-500' },
    { title: 'Pending', value: stats?.pending || 0, icon: Clock, gradient: 'from-amber-400 via-orange-500 to-red-500' },
    { title: 'Failed', value: stats?.failed || 0, icon: XCircle, gradient: 'from-rose-400 via-red-500 to-pink-500' },
  ];

  const featureCards = [
    { title: 'Send ALGO', desc: 'Secure TestNet transactions', icon: Wallet, href: '/send', gradient: 'gradient-apple-blue' },
    { title: 'Track Status', desc: 'Real-time monitoring', icon: Activity, href: '/transactions', gradient: 'gradient-ocean' },
    { title: 'View History', desc: 'Transaction analytics', icon: History, href: '/transactions', gradient: 'gradient-sunset' },
  ];

  return (
    <div className="space-y-8 relative pb-20">
      {/* Liquid Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2rem] p-8 md:p-16 border border-white/20 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.8) 50%, rgba(236, 72, 153, 0.8) 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-semibold tracking-wide uppercase">Algorand TestNet Ecosystem</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">Digital Assets</span>
            </h1>
            <p className="text-xl text-white/90 max-w-xl leading-relaxed font-medium">
              Send, track, and manage Algorand assets with unmatched speed and beauty. 
              Built on a foundation of liquid glass aesthetics.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/send">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 font-bold px-8 h-14 rounded-2xl shadow-xl shadow-blue-900/20">
                  Send ALGO <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/transactions">
                <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 backdrop-blur-md px-8 h-14 rounded-2xl">
                  View History
                </Button>
              </Link>
            </div>
          </div>
          
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="hidden lg:block w-72 h-72 relative"
          >
            <div className="absolute inset-0 bg-white/10 rounded-[3rem] backdrop-blur-2xl border border-white/30 rotate-12 flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent group-hover:opacity-100 transition-opacity" />
              <Wallet className="w-32 h-32 text-white/80 drop-shadow-2xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {featureCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="glass-card cursor-pointer group overflow-hidden h-full">
                  <CardHeader>
                    <div className={`w-14 h-14 ${card.gradient} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
                    <CardDescription className="text-base font-medium opacity-70">{card.desc}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </motion.section>

      {/* Stats Grid */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black tracking-tight">Ecosystem Health</h2>
          <div className="px-4 py-1.5 rounded-full glass-premium text-xs font-bold uppercase tracking-wider text-primary">Live Stats</div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="glass-card overflow-hidden group border-0 shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg shadow-black/5`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl md:text-4xl font-black tracking-tighter">
                      {loading ? (
                        <div className="h-10 w-16 bg-muted rounded-lg animate-pulse" />
                      ) : (
                        <span className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Recent Transactions & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card h-full overflow-hidden border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Recent Activity</CardTitle>
                <CardDescription className="font-medium opacity-70">Latest transactions on the network</CardDescription>
              </div>
              <Link href="/transactions">
                <Button variant="outline" size="sm" className="glass-premium hover:bg-primary/10 rounded-full font-bold text-xs">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loadingTxs ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="h-4 bg-muted rounded w-16" />
                    </div>
                  ))
                ) : recentTransactions.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-bold">No transactions found</p>
                  </div>
                ) : (
                  recentTransactions.map((tx, i) => (
                    <motion.div 
                      key={tx._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center justify-between group p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                          tx.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 
                          tx.status === 'failed' ? 'bg-rose-500/10 text-rose-500' : 
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm tracking-tight">{formatAddress(tx.to)}</p>
                          <p className="text-xs text-muted-foreground font-bold opacity-60">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-base tracking-tighter">{tx.amount} ALGO</p>
                        <Link href={`https://testnet.explorer.perawallet.app/tx/${tx.txId}/`} target="_blank" className="text-[10px] text-primary hover:underline flex items-center justify-end font-black uppercase tracking-widest">
                          Explorer <ArrowUpRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass-card overflow-hidden group border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Total ALGO Sent
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {loading ? <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" /> : `${stats?.totalAlgoSent?.toFixed(2) || 0} ALGO`}
                </div>
                {!loading && (
                  <div className="h-12 w-24 flex items-end gap-1 pb-1">
                    {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.7 + (i * 0.1), duration: 0.5 }}
                        className="flex-1 bg-blue-500/30 rounded-t-sm"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Aggregated from confirmed txs</p>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass-card overflow-hidden group border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-4xl font-black tracking-tighter bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  {loading ? <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" /> : stats?.successRate || '0%'}
                </div>
                {!loading && (
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-emerald-500/10"
                      />
                      <motion.circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="125.6"
                        initial={{ strokeDashoffset: 125.6 }}
                        animate={{ strokeDashoffset: 125.6 - (125.6 * (parseInt(stats?.successRate || '0') / 100)) }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="text-emerald-500"
                      />
                    </svg>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex flex-col gap-2">
                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stats?.successRate || '0%' }}
                    className="h-full bg-emerald-500"
                    transition={{ duration: 1, delay: 1 }}
                  />
                </div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Optimized network performance</p>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="glass-card border-l-4 border-l-blue-500 overflow-hidden relative border-0 shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="w-16 h-16" />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black flex items-center gap-3 uppercase tracking-widest">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                  </div>
                  System Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Network</span>
                  <span className="text-emerald-500">TestNet (v3.0)</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-emerald-500">Fully Operational</span>
                </div>
                <div className="border-t border-white/10 pt-3 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full h-8 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/10 text-primary">
                        <HelpCircle className="w-3.5 h-3.5 mr-2" /> Help Resources
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-premium border-0 shadow-2xl p-0 overflow-hidden sm:max-w-[500px]">
                      <div className="p-6 space-y-6">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black tracking-tight">TestNet Ecosystem</DialogTitle>
                          <DialogDescription className="font-medium text-base">Quick access to essential Algorand testing tools.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          {testnetResources.map((res) => (
                            <a key={res.title} href={res.href} target="_blank" rel="noopener noreferrer" className="group">
                              <div className="p-4 glass-card border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-2xl ${res.bg} ${res.color}`}>
                                    <res.icon className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-black text-sm uppercase tracking-widest">{res.title}</h4>
                                    <p className="text-xs font-medium opacity-70 leading-relaxed">{res.desc}</p>
                                  </div>
                                  <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
