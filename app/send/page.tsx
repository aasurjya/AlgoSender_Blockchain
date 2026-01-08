"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Copy, ExternalLink, Loader2, AlertCircle, Lock, 
  Sparkles, Zap, User, Clock as ClockIcon, CheckCircle2, 
  Share2, ArrowLeft, Wallet, HelpCircle, Info
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
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
    const url = `https://testnet.explorer.perawallet.app/tx/${txResult.txId}/`;
    copyToClipboard(url);
    toast({ title: 'Link Copied', description: 'Pera Explorer link copied to clipboard' });
  };

  const handleReset = () => {
    setTxResult(null);
    setFormData({ mnemonic: '', recipientAddress: '', amount: '', note: '' });
  };

  const QuickInfo = ({ title, content }: { title: string, content: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="ml-1 text-muted-foreground hover:text-primary transition-colors">
          <HelpCircle className="w-3 h-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="glass-premium border-0 shadow-2xl p-6 sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base font-medium leading-relaxed opacity-90">
            {content}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative pb-24">
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
          <p className="text-muted-foreground font-medium text-sm md:text-base">Transfer tokens on TestNet with unmatched speed</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
          <Card className="glass-card border-0 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                <Zap className="w-6 h-6 text-yellow-500" />
                Transaction details
              </CardTitle>
              <CardDescription className="font-medium opacity-70">Enter the parameters for your blockchain transfer</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <form onSubmit={handleInitialSubmit} className="space-y-6">
                {!isLoggedIn && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <div className="flex items-center">
                        <Label htmlFor="mnemonic" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sender Mnemonic <span className="text-destructive">*</span></Label>
                        <QuickInfo title="Mnemonic Phrase" content="A 25-word secret key that gives access to your wallet. Never share this with anyone." />
                      </div>
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
                        className="font-mono text-sm glass-premium rounded-2xl p-4 border-white/10 focus:ring-primary/20 resize-none shadow-inner" 
                      />
                      {formData.mnemonic.trim() && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="self-end text-[10px] font-bold uppercase text-muted-foreground hover:text-primary transition-all"
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
                          <Button type="button" variant="ghost" className="h-8 px-4 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all text-primary" onClick={() => handleCheckBalance()} disabled={checkingBalance}>
                            {checkingBalance ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Check Balance'}
                          </Button>
                          {balance !== null && (
                            <motion.span 
                              initial={{ opacity: 0, x: -10 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              className="text-xs font-black text-primary flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {balance.toFixed(2)} ALGO
                            </motion.span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isLoggedIn && senderAddress && (
                  <div className={`p-5 rounded-[1.5rem] border transition-all duration-500 ${needsReauth || showReauthPrompt ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${needsReauth || showReauthPrompt ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'} shadow-lg shadow-black/10`}>
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{needsReauth || showReauthPrompt ? 'Security Protocol Required' : 'Secure Wallet Linked'}</p>
                        <p className="text-xs font-mono break-all font-semibold opacity-80">{senderAddress}</p>
                      </div>
                      {balance !== null && !needsReauth && (
                        <div className="text-right">
                          <span className="text-lg font-black tracking-tight text-primary">{balance.toFixed(2)}</span>
                          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">ALGO</span>
                        </div>
                      )}
                    </div>
                    {(needsReauth || showReauthPrompt) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-5 space-y-3 overflow-hidden"
                      >
                        <Textarea placeholder="Paste your mnemonic to re-authenticate..." value={reauthMnemonic} onChange={(e) => setReauthMnemonic(e.target.value)} rows={2} className="font-mono text-sm glass-premium rounded-xl border-white/10 resize-none" />
                        <Button type="button" size="sm" onClick={handleReauth} className="w-full gradient-apple-blue border-0 text-white rounded-xl h-11 font-black uppercase tracking-[0.1em] text-xs shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">Authenticate Access</Button>
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Label htmlFor="recipient" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Recipient Address <span className="text-destructive">*</span></Label>
                    <QuickInfo title="Recipient Address" content="The 58-character public address of the wallet you want to send ALGO to." />
                  </div>
                  <Input 
                    id="recipient" 
                    placeholder="ALGO address (58 chars)" 
                    value={formData.recipientAddress} 
                    onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })} 
                    className="font-mono glass-premium rounded-2xl h-14 border-white/10 focus:ring-primary/20 shadow-inner px-5" 
                  />
                  
                  {isLoggedIn && recentRecipients.length > 0 && (
                    <div className="space-y-2.5 px-1 pt-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-1.5 ml-1">
                        <ClockIcon className="w-3 h-3" />
                        Frequent contacts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentRecipients.map((addr) => (
                          <motion.button
                            key={addr}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setFormData({ ...formData, recipientAddress: addr })}
                            className="px-4 py-2 rounded-full glass-premium text-[10px] font-mono hover:text-primary transition-all border border-white/10 flex items-center gap-2 shadow-sm"
                          >
                            <User className="w-3 h-3 opacity-40 text-primary" />
                            <span className="font-bold">{formatAddress(addr)}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Transfer Amount <span className="text-destructive">*</span></Label>
                    <QuickInfo title="ALGO Amount" content="The total amount of ALGO tokens to send. Note: 1 ALGO = 1,000,000 MicroAlgos." />
                  </div>
                  <div className="relative group">
                    <Input 
                      id="amount" 
                      type="number" 
                      step="0.000001" 
                      placeholder="0.00" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                      className="glass-premium rounded-2xl h-14 border-white/10 focus:ring-primary/20 shadow-inner px-5 pr-20 text-lg font-black tracking-tight"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.1em] border border-primary/10">
                      ALGO
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Label htmlFor="note" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Transaction Note</Label>
                    <QuickInfo title="Public Note" content="An optional message stored on the blockchain. This is visible to everyone who views the transaction." />
                  </div>
                  <Textarea 
                    id="note" 
                    placeholder="Add a secure public note to this transfer..." 
                    value={formData.note} 
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })} 
                    maxLength={1000}
                    className="glass-premium rounded-2xl min-h-[120px] resize-none p-5 border-white/10 focus:ring-primary/20 shadow-inner font-medium text-sm leading-relaxed"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-black uppercase tracking-[0.2em] gradient-vibrant border-0 text-white shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01] transition-all active:scale-[0.98] mt-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Synchronizing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 fill-current" />
                      <span>Broadcast Transfer</span>
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
                <Card className="glass-card border-2 border-emerald-500/50 overflow-hidden relative shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none" />
                  
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"
                  />

                  <CardHeader className="text-center pb-2 relative z-10">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                      className="mx-auto w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30"
                    >
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                    <CardTitle className="text-4xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400 mb-2">Success!</CardTitle>
                    <CardDescription className="text-base font-bold opacity-80 uppercase tracking-widest text-[10px]">Transaction Dispatched</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 relative z-10">
                    <div className="p-5 bg-black/20 dark:bg-white/5 rounded-[1.5rem] border border-white/10 space-y-5 shadow-inner">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Receipt ID</Label>
                        <div className="flex items-center gap-3">
                          <code className="flex-1 p-3 bg-black/30 rounded-xl text-[10px] font-mono break-all font-bold opacity-90 leading-relaxed border border-white/5">{txResult.txId}</code>
                          <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/10 rounded-full shrink-0" onClick={() => handleCopy(txResult.txId)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Payload</p>
                          <p className="text-3xl font-black tracking-tighter text-primary">{txResult.amount} <span className="text-[10px] opacity-40 uppercase tracking-widest">ALGO</span></p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Finality</p>
                          <div className="flex items-center gap-2 text-emerald-500 pt-1">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-xl font-black tracking-tight uppercase">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="outline" className="flex-1 glass-premium border-white/10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" /> Share Receipt
                      </Button>
                      <a href={`https://testnet.explorer.perawallet.app/tx/${txResult.txId}/`} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full gradient-apple-blue border-0 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/30 text-white">
                          <ExternalLink className="w-4 h-4 mr-2" /> Pera Explorer
                        </Button>
                      </a>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-emerald-500/5 border-t border-emerald-500/10 p-5 mt-2">
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-500/10 transition-all rounded-xl"
                      onClick={handleReset}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> New Transfer
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
                <Card className="glass-card border-0 shadow-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-xl font-black tracking-tight uppercase tracking-widest opacity-80 text-sm">Live status</CardTitle>
                    <CardDescription className="font-medium opacity-60">Real-time feedback window</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="flex items-center justify-center py-24 text-muted-foreground">
                      <div className="text-center space-y-6">
                        <div className="relative mx-auto w-24 h-24">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-[-20%] bg-primary/20 rounded-full" 
                          />
                          <div className="relative w-24 h-24 rounded-[2rem] bg-muted/30 flex items-center justify-center border border-white/10 shadow-inner backdrop-blur-sm">
                            <Send className="w-10 h-10 opacity-20" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-black uppercase tracking-[0.2em] text-[10px]">Awaiting Dispatch</p>
                          <p className="text-xs font-medium opacity-50 max-w-[200px] mx-auto leading-relaxed">Submit the form to initialize your blockchain transfer.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="glass-card border-l-4 border-l-amber-500 border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12">
              <AlertCircle className="w-20 h-20" />
            </div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4" />
                Security protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs font-medium opacity-80 space-y-3 relative z-10">
              <p className="leading-relaxed">• This is an experimental <span className="font-black text-amber-600 dark:text-amber-400 underline decoration-2 underline-offset-2">TestNet environment</span>. Never use mainnet credentials.</p>
              <p className="leading-relaxed">• Need assets? Use the <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noopener noreferrer" className="text-primary font-black hover:underline underline-offset-4">Algorand Faucet</a> to receive free test ALGO.</p>
              <p className="leading-relaxed">• Transactions typically achieve finality in <span className="font-black text-primary">~3.8 seconds</span> on the Algorand network.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 glass-premium shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
          
          <div className="relative p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-4 text-3xl font-black tracking-tight">
                <div className="p-3 bg-blue-500/20 rounded-2xl shadow-inner">
                  <AlertCircle className="w-8 h-8 text-blue-500" />
                </div>
                Verify Details
              </DialogTitle>
              <DialogDescription className="text-base font-semibold opacity-70 pt-2 leading-relaxed">
                Confirm your transaction parameters before final dispatch to the ledger.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 p-6 glass-card border border-white/10 rounded-[2rem] relative overflow-hidden shadow-inner bg-black/5 dark:bg-white/5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Destination Address</p>
                  <p className="font-mono text-xs break-all font-bold bg-black/20 dark:bg-white/10 p-3 rounded-xl border border-white/5 text-primary/90">{formData.recipientAddress}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Transfer payload</p>
                    <p className="text-2xl font-black tracking-tighter text-primary">{formData.amount} <span className="text-[10px] opacity-40 uppercase tracking-widest">ALGO</span></p>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right mr-1">Ledger Fee</p>
                    <p className="text-sm font-black text-muted-foreground pt-1">0.001 <span className="text-[10px] opacity-60">ALGO</span></p>
                  </div>
                </div>
                {formData.note && (
                  <div className="space-y-2 border-t border-white/10 pt-4 mt-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Blockchain Memo</p>
                    <p className="text-xs font-bold italic opacity-60 line-clamp-2 px-1">"{formData.note}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                className="w-full h-14 rounded-2xl text-base font-black uppercase tracking-[0.2em] gradient-vibrant border-0 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all text-white active:scale-[0.98]"
                onClick={handleConfirmSend}
              >
                Authorize & Dispatch
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:bg-white/5 transition-all"
                onClick={() => setShowConfirm(false)}
              >
                Cancel & Rectify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
