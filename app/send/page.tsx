"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';

interface FormData {
  mnemonic: string;
  recipientAddress: string;
  amount: string;
  note: string;
}

interface TransactionResult {
  txId: string;
  from: string;
  to: string;
  amount: number;
  note?: string;
}

export default function SendTransaction() {
  const [formData, setFormData] = useState<FormData>({
    mnemonic: '',
    recipientAddress: '',
    amount: '',
    note: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateMnemonic = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate-mnemonic');
      const data = await response.json();
      
      if (data.success) {
        setFormData((prev) => ({ ...prev, mnemonic: data.data.mnemonic }));
      } else {
        setError(data.message || 'Failed to generate mnemonic');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Basic validation
    if (!formData.mnemonic.trim()) {
      setError('Mnemonic is required');
      return;
    }
    
    if (!formData.recipientAddress.trim()) {
      setError('Recipient address is required');
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mnemonic: formData.mnemonic,
          recipientAddress: formData.recipientAddress,
          amount,
          note: formData.note || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        // Reset form except for mnemonic
        setFormData((prev) => ({
          mnemonic: prev.mnemonic,
          recipientAddress: '',
          amount: '',
          note: '',
        }));
      } else {
        setError(data.message || 'Failed to send transaction');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AlgoSender</h1>
            </Link>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/send" 
                  className="text-blue-600 font-medium dark:text-blue-400"
                >
                  Send
                </Link>
              </li>
              <li>
                <Link 
                  href="/transactions" 
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  Transactions
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send Transaction</h1>

        {result && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4">
              Transaction Sent Successfully!
            </h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Transaction ID:</span> <span className="font-mono">{result.txId}</span></p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">From:</span> <span className="font-mono">{result.from}</span></p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">To:</span> <span className="font-mono">{result.to}</span></p>
              <p><span className="font-medium text-gray-700 dark:text-gray-300">Amount:</span> {result.amount} ALGO</p>
              {result.note && <p><span className="font-medium text-gray-700 dark:text-gray-300">Note:</span> {result.note}</p>}
            </div>
            <div className="mt-4 flex space-x-4">
              <Link
                href={`/transactions`}
                className="text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                View All Transactions
              </Link>
              <Link
                href={`/status/${result.txId}`}
                className="text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              >
                Check Status
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Mnemonic */}
            <div>
              <label htmlFor="mnemonic" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Mnemonic Phrase
              </label>
              <div className="flex space-x-2">
                <textarea
                  id="mnemonic"
                  name="mnemonic"
                  value={formData.mnemonic}
                  onChange={handleChange}
                  placeholder="Enter your mnemonic phrase (25 words)"
                  className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  rows={2}
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateMnemonic}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 rounded-lg transition-colors"
                >
                  Generate
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your mnemonic is only used locally and never stored.
              </p>
            </div>

            {/* Recipient Address */}
            <div>
              <label htmlFor="recipientAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Recipient Address
              </label>
              <input
                type="text"
                id="recipientAddress"
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleChange}
                placeholder="Enter Algorand address"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Amount (ALGO)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.0"
                min="0.000001"
                step="0.000001"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required
              />
            </div>

            {/* Note */}
            <div>
              <label htmlFor="note" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                Note (Optional)
              </label>
              <input
                type="text"
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Add a note to the transaction"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Transaction'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
