"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Copy, ExternalLink, Loader2, AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { algorandApi } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils';
import { useWallet } from '@/contexts/WalletContext';

export default function SendTransaction() {
  const { isLoggedIn, address: walletAddress, mnemonic: walletMnemonic, login } = useWallet();
  const [formData, setFormData] = useState({
    mnemonic: '',
    recipientAddress: '',
    amount: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<any>(null);
  const [senderAddress, setSenderAddress] = useState('');
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [showReauthPrompt, setShowReauthPrompt] = useState(false);
  const [reauthMnemonic, setReauthMnemonic] = useState('');
  const { toast } = useToast();

  const needsReauth = isLoggedIn && !walletMnemonic;

  useEffect(() => {
    if (isLoggedIn && walletAddress) {
      setSenderAddress(walletAddress);
    } else {
      setSenderAddress('');
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
        } catch (e) {
          setSenderAddress('');
        }
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
        toast({ title: 'Mnemonic Generated', description: `Address: ${res.data.address}` });
      }
    } catch (e: any) {
      toast({ title: 'Generation Failed', description: e?.message || 'Unable to generate mnemonic', variant: 'destructive' });
    }
  };

  const handleCheckBalance = async () => {
    if (!senderAddress) {
      toast({ title: 'No Address', description: 'Please enter or generate a mnemonic first', variant: 'destructive' });
      return;
    }
    setCheckingBalance(true);
    try {
      const res = await algorandApi.getBalance(senderAddress);
      if (res?.success) {
        setBalance(res.data.balance);
        toast({ title: 'Balance Retrieved', description: `${res.data.balance} ALGO` });
      }
    } catch (e: any) {
      toast({ title: 'Balance Check Failed', description: e?.response?.data?.message || 'Unable to fetch balance', variant: 'destructive' });
    } finally {
      setCheckingBalance(false);
    }
  };

  const handleReauth = async () => {
    if (!reauthMnemonic.trim()) {
      toast({ title: 'Error', description: 'Please enter your mnemonic phrase', variant: 'destructive' });
      return;
    }
    try {
      await login(reauthMnemonic.trim());
      setShowReauthPrompt(false);
      setReauthMnemonic('');
      toast({ title: 'Success', description: 'Wallet re-authenticated successfully' });
    } catch (error: any) {
      toast({ title: 'Authentication Failed', description: error.message || 'Invalid mnemonic phrase', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let mnemonicToUse: string | null = null;
    
    if (isLoggedIn) {
      mnemonicToUse = walletMnemonic;
      if (!mnemonicToUse) {
        setShowReauthPrompt(true);
        return;
      }
    } else {
      mnemonicToUse = formData.mnemonic;
    }

    if (!mnemonicToUse || !formData.recipientAddress || !formData.amount) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const recipientAddr = formData.recipientAddress.trim();
    if (recipientAddr.length !== 58) {
      toast({ title: 'Invalid Recipient Address', description: 'Algorand address must be exactly 58 characters', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Amount must be a positive number', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setTxResult(null);

    try {
      const payload: any = { recipientAddress: recipientAddr, amount: amount, mnemonic: mnemonicToUse };
      if (formData.note) payload.note = formData.note;

      const response = await algorandApi.sendTransaction(payload);
      setTxResult(response.data);
      toast({ title: 'Transaction Sent!', description: `Transaction ID: ${response.data.txId}` });
      setFormData({ mnemonic: '', recipientAddress: '', amount: '', note: '' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send transaction';
      toast({ title: 'Transaction Failed', description: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast({ title: 'Copied!', description: 'Copied to clipboard' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Send ALGO</h1>
        <p className="text-muted-foreground mt-2">Send Algorand tokens on the TestNet</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5" />Transaction Details</CardTitle>
              <CardDescription>Enter the details to send ALGO on TestNet</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoggedIn && (
                  <div className="space-y-2">
                    <Label htmlFor="mnemonic">Sender Mnemonic <span className="text-red-500">*</span></Label>
                    <div className="flex items-center gap-2">
                      <Textarea id="mnemonic" placeholder="Enter your 25-word mnemonic phrase" value={formData.mnemonic} onChange={(e) => setFormData({ ...formData, mnemonic: e.target.value })} rows={3} className="font-mono text-sm flex-1" />
                      <Button type="button" variant="outline" size="sm" onClick={handleGenerateMnemonic}>Generate</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">⚠️ Never share your mainnet mnemonic. TestNet only!</p>
                    {senderAddress && (
                      <div className="mt-3 p-3 bg-muted rounded-lg space-y-2">
                        <Label className="text-xs font-semibold">Sender Address:</Label>
                        <p className="font-mono text-xs break-all">{senderAddress}</p>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={handleCheckBalance} disabled={checkingBalance}>
                            {checkingBalance ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Checking...</> : 'Check Balance'}
                          </Button>
                          {balance !== null && <span className="text-sm font-semibold">{balance} ALGO</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(isLoggedIn && senderAddress) && (
                  <div className={`p-4 rounded-lg border ${needsReauth || showReauthPrompt ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${needsReauth || showReauthPrompt ? 'bg-yellow-500' : 'bg-green-500'}`}>
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${needsReauth || showReauthPrompt ? 'text-yellow-900 dark:text-yellow-100' : 'text-green-900 dark:text-green-100'}`}>
                          {needsReauth || showReauthPrompt ? 'Re-authentication Required' : 'Wallet Connected'}
                        </p>
                        <p className={`text-xs font-mono break-all ${needsReauth || showReauthPrompt ? 'text-yellow-700 dark:text-yellow-300' : 'text-green-700 dark:text-green-300'}`}>{senderAddress}</p>
                      </div>
                    </div>
                    {(needsReauth || showReauthPrompt) && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">Your session expired. Please re-enter your mnemonic.</p>
                        <Textarea placeholder="Enter your 25-word mnemonic phrase" value={reauthMnemonic} onChange={(e) => setReauthMnemonic(e.target.value)} rows={2} className="font-mono text-sm" />
                        <Button type="button" size="sm" onClick={handleReauth} className="w-full">Re-authenticate Wallet</Button>
                      </div>
                    )}
                    {balance !== null && !needsReauth && !showReauthPrompt && (
                      <div className="mt-2 text-sm font-semibold text-green-900 dark:text-green-100">Balance: {balance} ALGO</div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address <span className="text-red-500">*</span></Label>
                  <Input id="recipient" placeholder="ALGO address (58 characters)" value={formData.recipientAddress} onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })} className="font-mono" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ALGO) <span className="text-red-500">*</span></Label>
                  <Input id="amount" type="number" step="0.000001" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note (Optional)</Label>
                  <Input id="note" placeholder="Add a note (max 1000 bytes)" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} maxLength={1000} />
                </div>

                <Button type="submit" className="w-full" disabled={loading} size="lg">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending Transaction...</> : <><Send className="w-4 h-4 mr-2" />Send ALGO</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          {txResult ? (
            <Card className="border-2 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2"><AlertCircle className="w-5 h-5" />Transaction Sent Successfully</CardTitle>
                <CardDescription>Your transaction has been broadcast to the network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-xs break-all">{txResult.txId}</code>
                    <Button variant="outline" size="icon" onClick={() => handleCopy(txResult.txId)}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <code className="block p-2 bg-muted rounded text-xs break-all">{txResult.from}</code>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <code className="block p-2 bg-muted rounded text-xs break-all">{txResult.to}</code>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <div className="p-2 bg-muted rounded text-sm font-semibold">{txResult.amount} ALGO</div>
                </div>
                <a href={`https://testnet.algoexplorer.io/tx/${txResult.txId}`} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full" size="sm"><ExternalLink className="w-4 h-4 mr-2" />View on AlgoExplorer</Button>
                </a>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Transaction Result</CardTitle>
                <CardDescription>Transaction details will appear here after submission</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Send className="w-12 h-12 mx-auto opacity-20" />
                    <p className="text-sm">No transaction yet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />Security Notice</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>• This is TestNet only. Never use your mainnet private keys or mnemonic.</p>
              <p>• Get free TestNet ALGO from the <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">TestNet Dispenser</a></p>
              <p>• Transactions typically confirm within 4-5 seconds.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
