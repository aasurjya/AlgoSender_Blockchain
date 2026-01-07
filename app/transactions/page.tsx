"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, ExternalLink, RefreshCw, Filter, CheckCircle, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { algorandApi, type Transaction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatAddress, formatDate } from '@/lib/utils';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all');
  const { toast } = useToast();

  useEffect(() => { fetchTransactions(); }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await algorandApi.getAllTransactions({ status: filter === 'all' ? undefined : filter, limit: 50 });
      setTransactions(response.data.transactions);
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to fetch', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', gradient: 'from-emerald-500 to-teal-500' };
      case 'pending': return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', gradient: 'from-amber-500 to-orange-500' };
      case 'failed': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', gradient: 'from-rose-500 to-pink-500' };
      default: return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/30', gradient: 'from-gray-500 to-slate-500' };
    }
  };

  const filterButtons = [
    { key: 'all', label: 'All', gradient: 'from-blue-500 to-purple-500' },
    { key: 'confirmed', label: 'Confirmed', gradient: 'from-emerald-500 to-teal-500' },
    { key: 'pending', label: 'Pending', gradient: 'from-amber-500 to-orange-500' },
    { key: 'failed', label: 'Failed', gradient: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-500/15 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 gradient-sunset rounded-2xl shadow-lg">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">View all TestNet transactions</p>
          </div>
        </div>
        <Button onClick={fetchTransactions} disabled={loading} variant="outline" className="glass-premium">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2"><Filter className="w-4 h-4" />Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((btn) => (
                <Button
                  key={btn.key}
                  variant={filter === btn.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(btn.key as any)}
                  className={filter === btn.key ? `bg-gradient-to-r ${btn.gradient} border-0 text-white shadow-lg` : 'glass-premium'}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
        {loading ? (
          <Card className="glass-card">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <History className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm mt-2">{filter !== 'all' ? 'Try changing the filter or ' : ''}Send your first transaction to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {transactions.map((tx, index) => {
              const statusConfig = getStatusConfig(tx.status);
              const StatusIcon = statusConfig.icon;
              return (
                <motion.div key={tx._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="glass-card group overflow-hidden">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${statusConfig.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                              <p className="font-mono text-sm break-all">{tx.txId}</p>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                              <StatusIcon className="w-3.5 h-3.5" />{tx.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">From</p>
                              <code className="text-sm font-mono">{formatAddress(tx.from)}</code>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">To</p>
                              <code className="text-sm font-mono">{formatAddress(tx.to)}</code>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Amount</p>
                              <p className={`text-sm font-bold bg-gradient-to-r ${statusConfig.gradient} bg-clip-text text-transparent`}>{tx.amount} ALGO</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Date</p>
                              <p className="text-sm">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          {tx.note && (
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground mb-1">Note</p>
                              <p className="text-sm bg-muted/50 p-2 rounded-lg">{tx.note}</p>
                            </div>
                          )}
                        </div>
                        <a href={`https://testnet.algoexplorer.io/tx/${tx.txId}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="glass-premium whitespace-nowrap">
                            <ArrowUpRight className="w-4 h-4 mr-1" />Explorer
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
