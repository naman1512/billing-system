'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials - in a real app, these would be environment variables or from a secure backend
  const DEMO_USER_ID = 'xforva';
  const DEMO_PASSWORD = 'SWC@9670';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a brief loading time
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (userId === DEMO_USER_ID && password === DEMO_PASSWORD) {
      toast.success('Login successful!', {
        icon: '✅',
        duration: 2000,
      });
      onLogin();
    } else {
      toast.error('Invalid credentials. Please try again.', {
        icon: '❌',
        duration: 3000,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-8 rounded-2xl border border-gray-600 shadow-2xl backdrop-blur-sm animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Sahaya Warehousing
            </h1>
            <p className="text-gray-400">
              Billing System Login
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="Enter your user ID"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p className="text-gray-300">User ID: <span className="text-blue-400 font-mono">UserId</span></p>
              <p className="text-gray-300">Password: <span className="text-blue-400 font-mono">Password</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            &copy; 2025 Sahaya Warehousing Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
