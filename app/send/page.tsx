"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Copy, ExternalLink, Loader2, AlertCircle, Lock, Sparkles, Zap, User, Clock as ClockIcon, CheckCircle2, Share2, ArrowLeft, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { algorandApi, type Transaction } from '@/lib/api';
import { copyToClipboard, formatAddress } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';

export default function SendTransaction() {
  const { isLoggedIn, address: walletAddress, mnemonic: walletMnemonic, login } = useWallet();
  const [formData, setFormData] = useState({ mnemonic: '', recipientAddress: '', amount: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<any>(null);
  const [senderAddress, setSenderAddress] = useState('');
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [showReauthPrompt, setShowReauthPrompt] = useState(false);
  const [reauthMnemonic, setReauthMnemonic] = useState('');
  const [recentRecipients, setRecentRecipients] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const needsReauth = isLoggedIn && !walletMnemonic;

  useEffect(() => {
    if (isLoggedIn && walletAddress) {
      setSenderAddress(walletAddress);
      handleCheckBalance(walletAddress);
      fetchRecentRecipients();
    }
  }, [isLoggedIn, walletAddress]);

  useEffect(() => {
    const deriveAddress = async () => {
      if (formData.mnemonic.trim() && !isLoggedIn) {
        try {
          const res = await algorandApi.deriveAddress(formData.mnemonic);
          if (res?.success && res?.data?.address) {
            setSenderAddress(res.data.address);
          }
        } catch { setSenderAddress(''); }
      }
    };
    deriveAddress();
  }, [formData.mnemonic, isLoggedIn]);

  const fetchRecentRecipients = async () => {
    try {
      const res = await algorandApi.getAllTransactions({ limit: 50 });
      if (res?.success) {
        const recipients = res.data.transactions
          .map((tx: Transaction) => tx.to)
          .filter((addr: string, index: number, self: string[]) => self.indexOf(addr) === index)
          .slice(0, 5);
        setRecentRecipients(recipients);
      }
    } catch (e) {
      console.error('Failed to fetch recent recipients', e);
    }
  };

  const handleGenerateMnemonic = async () => {
    try {
      const res = await algorandApi.generateMnemonic();
      if (res?.success && res?.data?.mnemonic) {
        setFormData((prev) => ({ ...prev, mnemonic: res.data.mnemonic }));
        setSenderAddress(res.data.address);
        toast({ title: 'Mnemonic Generated', description: `Address: ${res.data.address.slice(0, 12)}...` });
      }
    } catch (e: any) {
      toast({ title: 'Generation Failed', description: e?.message || 'Unable to generate', variant: 'destructive' });
    }
  };

  const handleCheckBalance = async (addr?: string) => {
    const address = addr || senderAddress;
    if (!address) return;
    setCheckingBalance(true);
    try {
      const res = await algorandApi.getBalance(address);
      if (res?.success) setBalance(res.data.balance);
    } catch { }
    finally { setCheckingBalance(false); }
  };

  const handleReauth = async () => {
    if (!reauthMnemonic.trim()) {
      toast({ title: 'Error', description: 'Please enter your mnemonic', variant: 'destructive' });
      return;
    }
    try {
      await login(reauthMnemonic.trim());
      setShowReauthPrompt(false);
      setReauthMnemonic('');
      toast({ title: 'Success', description: 'Wallet re-authenticated' });
    } catch (error: any) {
      toast({ title: 'Failed', description: error.message || 'Invalid mnemonic', variant: 'destructive' });
    }
  };

  const validateForm = () => {
    let mnemonicToUse = isLoggedIn ? walletMnemonic : formData.mnemonic;
    if (isLoggedIn && !mnemonicToUse) { setShowReauthPrompt(true); return false; }
    if (!mnemonicToUse || !formData.recipientAddress || !formData.amount) {
      toast({ title: 'Validation Error', description: 'Please fill required fields', variant: 'destructive' });
      return false;
    }
    const recipientAddr = formData.recipientAddress.trim();
    if (recipientAddr.length !== 58) {
      toast({ title: 'Invalid Address', description: 'Must be 58 characters', variant: 'destructive' });
      return false;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Must be positive', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    }
  };

  const handleConfirmSend = async () => {
    setShowConfirm(false);
    let mnemonicToUse = isLoggedIn ? walletMnemonic : formData.mnemonic;
    const recipientAddr = formData.recipientAddress.trim();
    const amount = parseFloat(formData.amount);

    setLoading(true);
    setTxResult(null);
    try {
      const payload: any = { recipientAddress: recipientAddr, amount, mnemonic: mnemonicToUse };
      if (formData.note) payload.note = formData.note;
      const response = await algorandApi.sendTransaction(payload);
      setTxResult(response.data);
      toast({ title: 'Transaction Sent!', description: `TX: ${response.data.txId.slice(0, 12)}...` });
      setFormData({ mnemonic: '', recipientAddress: '', amount: '', note: '' });
      if (isLoggedIn) handleCheckBalance();
    } catch (error: any) {
      toast({ title: 'Failed', description: error.response?.data?.message || error.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleCopy = (text: string) => { copyToClipboard(text); toast({ title: 'Copied!' }); };

  const handleShare = () => {
    if (!txResult) return;
    const url = `https://testnet.algoexplorer.io/tx/${txResult.txId}`;
    copyToClipboard(url);
    toast({ title: 'Link Copied', description: 'AlgoExplorer link copied to clipboard' });
  };

  const handleReset = () => {
    setTxResult(null);
    setFormData({ mnemonic: '', recipientAddress: '', amount: '', note: '' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 gradient-apple-blue rounded-2xl shadow-lg">
          <Send className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Send ALGO</h1>
          <p className="text-muted-foreground font-medium">Transfer tokens on TestNet with speed</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" />Transaction Details</CardTitle>
              <CardDescription>Enter the details to send ALGO</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInitialSubmit} className="space-y-5">
                {!isLoggedIn && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <Label htmlFor="mnemonic" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sender Mnemonic <span className="text-destructive">*</span></Label>
                      <Button type="button" variant="ghost" size="sm" onClick={handleGenerateMnemonic} className="h-6 text-[10px] font-black uppercase tracking-tighter text-primary hover:bg-primary/5">
                        <Sparkles className="w-3 h-3 mr-1" /> New Wallet
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Textarea 
                        id="mnemonic" 
                        placeholder="Enter 25-word mnemonic phrase..." 
                        value={formData.mnemonic} 
                        onChange={(e) => setFormData({ ...formData, mnemonic: e.target.value })} 
                        rows={3} 
                        className="font-mono text-sm glass-premium rounded-xl p-4 border-white/10 resize-none" 
                      />
                      {formData.mnemonic.trim() && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="self-end text-[10px] font-bold uppercase text-muted-foreground hover:text-primary"
                          onClick={() => { copyToClipboard(formData.mnemonic); toast({ title: 'Copied!' }); }}
                        >
                          <Copy className="w-3 h-3 mr-1" /> Copy All
                        </Button>
                      )}
                    </div>
                    {senderAddress && (
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                          <Wallet className="w-12 h-12" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Derived Address</Label>
                          <p className="font-mono text-xs break-all mt-1 font-semibold text-primary/80">{senderAddress}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button type="button" variant="ghost" className="h-8 px-3 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all" onClick={() => handleCheckBalance()} disabled={checkingBalance}>
                            {checkingBalance ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Check Balance'}
                          </Button>
                          {balance !== null && (
                            <motion.span 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              className="text-xs font-black text-primary"
                            >
                              {balance.toFixed(2)} ALGO
                            </motion.span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isLoggedIn && senderAddress && (
                  <div className={`p-4 rounded-2xl border ${needsReauth || showReauthPrompt ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${needsReauth || showReauthPrompt ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'} shadow-lg`}>
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{needsReauth || showReauthPrompt ? 'Re-auth Required' : 'Wallet Connected'}</p>
                        <p className="text-xs font-mono break-all text-muted-foreground">{senderAddress}</p>
                      </div>
                      {balance !== null && !needsReauth && <span className="text-lg font-bold text-primary">{balance.toFixed(2)} <span className="text-[10px] opacity-60 uppercase">ALGO</span></span>}
                    </div>
                    {(needsReauth || showReauthPrompt) && (
                      <div className="mt-4 space-y-2">
                        <Textarea placeholder="Enter mnemonic..." value={reauthMnemonic} onChange={(e) => setReauthMnemonic(e.target.value)} rows={2} className="font-mono text-sm glass-premium rounded-xl" />
                        <Button type="button" size="sm" onClick={handleReauth} className="w-full gradient-apple-blue border-0 text-white rounded-xl h-10 font-bold uppercase tracking-wider text-xs">Re-authenticate</Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="recipient" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Recipient Address <span className="text-destructive">*</span></Label>
                  <Input 
                    id="recipient" 
                    placeholder="ALGO address (58 chars)" 
                    value={formData.recipientAddress} 
                    onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })} 
                    className="font-mono glass-premium rounded-xl h-12" 
                  />
                  
                  {isLoggedIn && recentRecipients.length > 0 && (
                    <div className="space-y-2.5 px-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                        <ClockIcon className="w-3 h-3" />
                        Quick Select
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentRecipients.map((addr) => (
                          <motion.button
                            key={addr}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary), 0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setFormData({ ...formData, recipientAddress: addr })}
                            className="px-3 py-1.5 rounded-full glass-premium text-[10px] font-mono hover:text-primary transition-all border border-white/10 flex items-center gap-1.5"
                          >
                            <User className="w-3 h-3 opacity-50" />
                            {formatAddress(addr)}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount (ALGO) <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="amount" 
                      type="number" 
                      step="0.000001" 
                      placeholder="0.00" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                      className="glass-premium rounded-xl h-12 pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                      ALGO
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="note" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Note (Optional)</Label>
                  <Textarea 
                    id="note" 
                    placeholder="Add a public note to this transaction..." 
                    value={formData.note} 
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })} 
                    maxLength={1000}
                    className="glass-premium rounded-xl min-h-[100px] resize-none p-4"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-black uppercase tracking-widest gradient-vibrant border-0 text-white shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 fill-current" />
                      <span>Dispatch ALGO</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {txResult ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="space-y-6"
              >
                <Card className="glass-card border-2 border-emerald-500/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none" />
                  
                  {/* Celebration Orbs */}
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"
                  />

                  <CardHeader className="text-center pb-2">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                      className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <CardTitle className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">Transaction Sent!</CardTitle>
                    <CardDescription className="text-base font-medium">Your assets are moving across the network</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 relative z-10">
                    <div className="p-4 bg-black/20 dark:bg-white/5 rounded-2xl border border-white/10 space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Transaction ID</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-black/20 rounded-lg text-[10px] font-mono break-all font-semibold opacity-80">{txResult.txId}</code>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full" onClick={() => handleCopy(txResult.txId)}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount</p>
                          <p className="text-2xl font-black tracking-tighter text-primary">{txResult.amount} <span className="text-xs opacity-60">ALGO</span></p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</p>
                          <div className="flex items-center gap-2 text-emerald-500">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-lg font-bold uppercase tracking-tight">Broadcasted</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 glass-premium border-white/10 h-12 rounded-xl font-bold uppercase tracking-wider text-xs" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" /> Share Link
                      </Button>
                      <a href={`https://testnet.algoexplorer.io/tx/${txResult.txId}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full gradient-apple-blue border-0 h-12 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 text-white">
                          <ExternalLink className="w-4 h-4 mr-2" /> Explorer
                        </Button>
                      </a>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-emerald-500/5 border-t border-emerald-500/10 p-4">
                    <Button 
                      variant="ghost" 
                      className="w-full text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs hover:bg-emerald-500/10"
                      onClick={handleReset}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Send Another Transaction
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Live Status</CardTitle>
                    <CardDescription>Real-time transaction feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-20 text-muted-foreground">
                      <div className="text-center space-y-4">
                        <div className="relative mx-auto w-20 h-20">
                          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                          <div className="relative w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center border border-white/10">
                            <Send className="w-10 h-10 opacity-20" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold tracking-tight">Ready for Dispatch</p>
                          <p className="text-xs opacity-60">Fill the form to begin transfer</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="glass-card border-l-4 border-l-yellow-500">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />Security</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• TestNet only - never use mainnet keys</p>
              <p>• Get free ALGO from <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TestNet Dispenser</a></p>
              <p>• Transactions confirm in ~4-5 seconds</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 glass-premium shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
          
          <div className="relative p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-blue-500" />
                </div>
                Verify Transaction
              </DialogTitle>
              <DialogDescription className="text-base font-medium opacity-80 pt-2">
                Please double-check the recipient and amount before dispatching.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-5 glass-card border border-white/10 rounded-2xl relative overflow-hidden">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipient</p>
                  <p className="font-mono text-xs break-all font-semibold bg-black/20 p-2 rounded-lg">{formData.recipientAddress}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</p>
                    <p className="text-xl font-black tracking-tighter text-primary">{formData.amount} ALGO</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Network Fee</p>
                    <p className="text-sm font-bold text-muted-foreground">0.001 ALGO</p>
                  </div>
                </div>
                {formData.note && (
                  <div className="space-y-1 border-t border-white/5 pt-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attached Note</p>
                    <p className="text-xs font-medium italic opacity-70 truncate">{formData.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                className="w-full h-12 rounded-xl text-sm font-black uppercase tracking-widest gradient-vibrant border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all text-white"
                onClick={handleConfirmSend}
              >
                Sign & Dispatch
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-10 rounded-xl text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                onClick={() => setShowConfirm(false)}
              >
                Cancel & Edit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
