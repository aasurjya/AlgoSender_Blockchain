"use client"

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ExternalLink, RefreshCw, Filter, CheckCircle, Clock, XCircle, ArrowUpRight, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { algorandApi, type Transaction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatAddress, formatDate } from '@/lib/utils';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all');
  const [search, setSearch] = useState('');
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
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

  const filteredTransactions = transactions.filter(tx => 
    tx.txId.toLowerCase().includes(search.toLowerCase()) ||
    tx.from.toLowerCase().includes(search.toLowerCase()) ||
    tx.to.toLowerCase().includes(search.toLowerCase()) ||
    (tx.note && tx.note.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleExpand = (id: string) => {
    setExpandedTx(expandedTx === id ? null : id);
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
            <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground">View all TestNet transactions</p>
          </div>
        </div>
        <Button onClick={fetchTransactions} disabled={loading} variant="outline" className="glass-premium">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card md:col-span-1">
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
        
        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2"><Search className="w-4 h-4" />Search Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID, Address, or Note..." 
                className="pl-10 glass-premium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted/20 rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <History className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm mt-2">{search ? 'Try a different search term or ' : ''}{filter !== 'all' ? 'change the filter' : 'send your first transaction'}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTransactions.map((tx, index) => {
              const statusConfig = getStatusConfig(tx.status);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedTx === tx._id;
              
              return (
                <motion.div key={tx._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className={`glass-card group overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/20 shadow-xl' : 'hover:shadow-lg'}`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${statusConfig.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                    <CardContent className="p-0">
                      <div 
                        className="p-6 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        onClick={() => toggleExpand(tx._id)}
                      >
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Transaction ID</p>
                              <p className="font-mono text-sm break-all font-semibold">{tx.txId}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} shadow-sm`}>
                                <StatusIcon className="w-3.5 h-3.5" />{tx.status}
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Amount</p>
                              <p className={`text-lg font-black bg-gradient-to-r ${statusConfig.gradient} bg-clip-text text-transparent`}>{tx.amount} ALGO</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Date</p>
                              <p className="text-sm font-semibold">{formatDate(tx.createdAt)}</p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">From</p>
                              <code className="text-xs font-mono font-medium">{formatAddress(tx.from)}</code>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">To</p>
                              <code className="text-xs font-mono font-medium">{formatAddress(tx.to)}</code>
                            </div>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-2 border-t border-white/10 bg-black/5 dark:bg-white/5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Full Sender Address</p>
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs font-mono bg-muted/50 p-2 rounded-lg flex-1 break-all">{tx.from}</code>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Full Recipient Address</p>
                                    <div className="flex items-center gap-2">
                                      <code className="text-xs font-mono bg-muted/50 p-2 rounded-lg flex-1 break-all">{tx.to}</code>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Note / Metadata</p>
                                    <p className="text-sm bg-muted/50 p-3 rounded-xl italic text-muted-foreground">
                                      {tx.note || "No note attached to this transaction."}
                                    </p>
                                  </div>
                                  <div className="flex gap-3">
                                    <a href={`https://explorer.perawallet.app/tx/${tx.txId}/?network=testnet`} target="_blank" rel="noopener noreferrer" className="flex-1">
                                      <Button className="w-full gradient-apple-blue border-0 shadow-lg text-white font-bold">
                                        <ExternalLink className="w-4 h-4 mr-2" />View on Pera Explorer
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
