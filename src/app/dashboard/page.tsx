'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <div className="absolute top-8 left-8">
        <Link href="/">
          <button className="group flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-green-500">
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 animate-fade-in-up">
          Dashboard
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Company analytics and insights coming soon...
        </p>
        
        {/* Placeholder content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
            <h3 className="text-xl font-semibold text-blue-400 mb-2">Total Bills</h3>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-gray-400 text-sm mt-2">This month</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300">
            <h3 className="text-xl font-semibold text-green-400 mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-white">₹0</p>
            <p className="text-gray-400 text-sm mt-2">This month</p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Clients</h3>
            <p className="text-3xl font-bold text-white">0</p>
            <p className="text-gray-400 text-sm mt-2">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
