import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AlgoSender</h1>
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

      {/* Hero section */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-blue-600 dark:text-blue-400">Send and Track</span> Algorand TestNet Transactions
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            AlgoSender makes it easy to send, monitor, and manage your Algorand TestNet transactions in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/send" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Send Transaction
            </Link>
            <Link 
              href="/dashboard" 
              className="px-6 py-3 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg shadow-md border border-gray-200 transition-colors dark:bg-gray-800 dark:text-blue-400 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Features section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-blue-50 dark:bg-gray-800">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-xl">📤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Send Transactions</h3>
              <p className="text-gray-700 dark:text-gray-300">Easily send Algorand TestNet transactions with just a mnemonic phrase and recipient address.</p>
            </div>
            
            <div className="p-6 rounded-lg bg-blue-50 dark:bg-gray-800">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Track Status</h3>
              <p className="text-gray-700 dark:text-gray-300">Monitor your transaction status in real-time with automatic updates and notifications.</p>
            </div>
            
            <div className="p-6 rounded-lg bg-blue-50 dark:bg-gray-800">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <span className="text-blue-600 dark:text-blue-300 text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Analytics</h3>
              <p className="text-gray-700 dark:text-gray-300">View detailed statistics about your transaction history, including success rates and total amounts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-700 dark:text-gray-300">
          <p>© 2026 AlgoSender. Built with Next.js and Algorand.</p>
        </div>
      </footer>
    </div>
  );
}
