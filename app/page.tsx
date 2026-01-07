"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Clock, XCircle, Wallet, Activity, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { algorandApi, type Stats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
    { title: 'Total Transactions', value: stats?.total || 0, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { title: 'Confirmed', value: stats?.confirmed || 0, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { title: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { title: 'Failed', value: stats?.failed || 0, icon: XCircle, color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome to AlgoSender</h1>
          <p className="text-lg text-blue-100">Send and track Algorand TestNet transactions with ease</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <Card className="glass-card hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <div className="w-12 h-12 gradient-apple-blue rounded-xl flex items-center justify-center mb-2">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Send ALGO</CardTitle>
            <CardDescription>Secure TestNet transactions with validation</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Track Status</CardTitle>
            <CardDescription>Real-time monitoring and confirmation</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-card hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2">
              <History className="w-6 h-6 text-white" />
            </div>
            <CardTitle>View History</CardTitle>
            <CardDescription>Detailed transaction analytics</CardDescription>
          </CardHeader>
        </Card>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-2 hover:shadow-xl transition-shadow">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loading ? '...' : stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Total ALGO Sent</CardTitle>
              <CardDescription>Confirmed transactions only</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {loading ? '...' : `${stats?.totalAlgoSent?.toFixed(2) || 0} ALGO`}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
              <CardDescription>Confirmed vs Total transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {loading ? '...' : stats?.successRate || '0%'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>✅ Connected to <span className="font-semibold text-foreground">Algorand TestNet</span></p>
            <p className="mt-2">⚠️ This application is for educational purposes only. Never use mainnet private keys.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
