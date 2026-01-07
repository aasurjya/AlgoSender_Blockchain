"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, ExternalLink, RefreshCw, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await algorandApi.getAllTransactions({
        status: filter === 'all' ? undefined : filter,
        limit: 50,
      });
      setTransactions(response.data.transactions);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8" />
            Transaction History
          </h1>
          <p className="text-muted-foreground mt-2">View all your Algorand TestNet transactions</p>
        </div>
        <Button onClick={fetchTransactions} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['all', 'confirmed', 'pending', 'failed'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status as any)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No transactions found</p>
                <p className="text-sm mt-2">
                  {filter !== 'all' && 'Try changing the filter or '}
                  Send your first transaction to get started
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-mono break-all">{tx.txId}</CardTitle>
                        <CardDescription className="mt-1">{formatDate(tx.createdAt)}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <p className="text-sm font-semibold">{tx.amount} ALGO</p>
                      </div>
                    </div>
                    {tx.note && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground mb-1">Note</p>
                        <p className="text-sm bg-muted p-2 rounded">{tx.note}</p>
                      </div>
                    )}
                    {tx.confirmedRound && (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground">Confirmed in round: {tx.confirmedRound}</p>
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <a href={`https://testnet.algoexplorer.io/tx/${tx.txId}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Explorer
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
