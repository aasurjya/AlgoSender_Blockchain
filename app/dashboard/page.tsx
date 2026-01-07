"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  totalAlgoSent: number;
  successRate: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch stats');
        }
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

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
                  className="text-blue-600 font-medium dark:text-blue-400"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/send" 
                  className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
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
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dashboard</h1>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Try again
            </button>
          </div>
        )}

        {stats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Transactions</h2>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stats.total}</p>
            </div>

            {/* Confirmed Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Confirmed</h2>
              <p className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">{stats.confirmed}</p>
            </div>

            {/* Pending Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Pending</h2>
              <p className="text-3xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>

            {/* Failed Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Failed</h2>
              <p className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">{stats.failed}</p>
            </div>

            {/* Total ALGO Sent */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total ALGO Sent</h2>
              <p className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">{stats.totalAlgoSent.toFixed(2)} ALGO</p>
            </div>

            {/* Success Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Success Rate</h2>
              <p className="text-3xl font-bold mt-2 text-purple-600 dark:text-purple-400">{stats.successRate}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/send"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
              >
                Send New Transaction
              </Link>
              <Link
                href="/transactions"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                View All Transactions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
