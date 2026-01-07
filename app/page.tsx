"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Clock, XCircle, Wallet, Activity, History, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { algorandApi, type Stats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
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
    <div className="space-y-8 relative">
      {/* Liquid Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 50%, rgba(240, 147, 251, 0.9) 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl float-animation" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '3s' }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-white/80" />
            <span className="text-white/80 text-sm font-medium">Algorand TestNet</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Welcome to AlgoSender</h1>
          <p className="text-lg text-white/80 max-w-2xl">Send and track Algorand transactions with a beautiful, modern interface. Built for the TestNet.</p>
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
                <Card className="glass-card cursor-pointer group overflow-hidden">
                  <CardHeader>
                    <div className={`w-14 h-14 ${card.gradient} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <CardDescription className="text-base">{card.desc}</CardDescription>
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
        <h2 className="text-2xl font-bold mb-6">Transaction Statistics</h2>
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
                <Card className="glass-card overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl md:text-4xl font-bold">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                Total ALGO Sent
              </CardTitle>
              <CardDescription>Confirmed transactions only</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {loading ? <div className="h-12 w-32 bg-muted rounded-lg animate-pulse" /> : `${stats?.totalAlgoSent?.toFixed(2) || 0} ALGO`}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                Success Rate
              </CardTitle>
              <CardDescription>Confirmed vs total transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
                {loading ? <div className="h-12 w-24 bg-muted rounded-lg animate-pulse" /> : stats?.successRate || '0%'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Network Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="glass-card border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
              </div>
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Connected to <span className="font-semibold text-foreground">Algorand TestNet</span></p>
            <p className="text-yellow-600 dark:text-yellow-400">This application is for educational purposes only. Never use mainnet private keys.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
