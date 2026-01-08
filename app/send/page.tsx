"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Copy, ExternalLink, Loader2, AlertCircle, Lock, Sparkles, Zap, User, Clock as ClockIcon, ChevronRight } from 'lucide-react';
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
  const { toast } = useToast();

  const needsReauth = isLoggedIn && !walletMnemonic;

  useEffect(() => {
    if (isLoggedIn && walletAddress) {
      setSenderAddress(walletAddress);
      handleCheckBalance(walletAddress);
      fetchRecentRecipients();
    }
  }, [isLoggedIn, walletAddress]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let mnemonicToUse = isLoggedIn ? walletMnemonic : formData.mnemonic;
    if (isLoggedIn && !mnemonicToUse) { setShowReauthPrompt(true); return; }
    if (!mnemonicToUse || !formData.recipientAddress || !formData.amount) {
      toast({ title: 'Validation Error', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    const recipientAddr = formData.recipientAddress.trim();
    if (recipientAddr.length !== 58) {
      toast({ title: 'Invalid Address', description: 'Must be 58 characters', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Must be positive', variant: 'destructive' });
      return;
    }
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
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLoggedIn && (
                  <div className="space-y-3">
                    <Label htmlFor="mnemonic">Sender Mnemonic <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Textarea id="mnemonic" placeholder="Enter 25-word mnemonic..." value={formData.mnemonic} onChange={(e) => setFormData({ ...formData, mnemonic: e.target.value })} rows={3} className="font-mono text-sm flex-1" />
                      <Button type="button" variant="outline" onClick={handleGenerateMnemonic} className="shrink-0">
                        <Sparkles className="w-4 h-4 mr-1" />Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Never share your mainnet mnemonic. TestNet only!</p>
                    {senderAddress && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 space-y-3">
                        <div>
                          <Label className="text-xs font-semibold">Sender Address</Label>
                          <p className="font-mono text-xs break-all mt-1">{senderAddress}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleCheckBalance()} disabled={checkingBalance}>
                            {checkingBalance ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Check Balance'}
                          </Button>
                          {balance !== null && <span className="text-sm font-bold text-primary">{balance} ALGO</span>}
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
                        <p className="font-semibold">{needsReauth || showReauthPrompt ? 'Re-auth Required' : 'Wallet Connected'}</p>
                        <p className="text-xs font-mono break-all text-muted-foreground">{senderAddress}</p>
                      </div>
                      {balance !== null && !needsReauth && <span className="text-lg font-bold text-primary">{balance} ALGO</span>}
                    </div>
                    {(needsReauth || showReauthPrompt) && (
                      <div className="mt-4 space-y-2">
                        <Textarea placeholder="Enter mnemonic..." value={reauthMnemonic} onChange={(e) => setReauthMnemonic(e.target.value)} rows={2} className="font-mono text-sm" />
                        <Button type="button" size="sm" onClick={handleReauth} className="w-full">Re-authenticate</Button>
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
          {txResult ? (
            <Card className="glass-card border-2 border-emerald-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
              <CardHeader>
                <CardTitle className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><AlertCircle className="w-5 h-5" />Success!</CardTitle>
                <CardDescription>Transaction broadcast to network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted/50 rounded-lg text-xs break-all">{txResult.txId}</code>
                    <Button variant="outline" size="icon" onClick={() => handleCopy(txResult.txId)}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Amount</span><p className="font-bold text-lg">{txResult.amount} ALGO</p></div>
                  <div><span className="text-muted-foreground">Status</span><p className="font-bold text-emerald-500">Pending</p></div>
                </div>
                <a href={`https://testnet.algoexplorer.io/tx/${txResult.txId}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full"><ExternalLink className="w-4 h-4 mr-2" />View on Explorer</Button>
                </a>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardHeader><CardTitle>Transaction Result</CardTitle><CardDescription>Details appear after sending</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                      <Send className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm">No transaction yet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
    </div>
  );
}
