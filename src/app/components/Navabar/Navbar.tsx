'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleConvertAndSend = () => {
    // Call the global function from the page component
    if (typeof window !== 'undefined') {
      const windowWithHandler = window as typeof window & { handleConvertAndSend?: () => Promise<void> };
      if (windowWithHandler.handleConvertAndSend) {
        windowWithHandler.handleConvertAndSend();
      }
    }
  };

  const isCurrentPage = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-900 shadow-2xl border-b border-gray-700 w-full backdrop-blur-sm">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 overflow-hidden">
            <Link href="/" className="block">
              {/* Large Desktop version - Full name */}
              <h1 className="hidden lg:block text-lg font-bold text-red-400 truncate hover:text-red-300 transition-colors duration-300">
                SahayaWarehousing Billing System
              </h1>
              {/* Medium Desktop version - Shorter name */}
              <h1 className="hidden sm:block lg:hidden text-lg font-bold text-red-400 truncate hover:text-red-300 transition-colors duration-300">
                Sahaya Billing
              </h1>
              {/* Mobile version - Abbreviated name */}
              <h1 className="block sm:hidden text-base font-bold text-red-400 truncate hover:text-red-300 transition-colors duration-300">
                SWH Billing
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-shrink-0">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isCurrentPage('/') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Main Invoice
              </Link>
              <Link 
                href="/edit-invoice"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isCurrentPage('/edit-invoice') 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                Live Editor
              </Link>
              {pathname === '/' && (
                <button 
                  onClick={handleConvertAndSend}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Convert & Send
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0 ml-2">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-transform duration-300`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-transform duration-300`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 border-t border-gray-700">
          <Link 
            href="/"
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              isCurrentPage('/') 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Main Invoice
          </Link>
          <Link 
            href="/edit-invoice"
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              isCurrentPage('/edit-invoice') 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Live Editor
          </Link>
          {pathname === '/' && (
            <button 
              onClick={handleConvertAndSend}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 w-full text-left transform hover:scale-105"
            >
              Convert & Send
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
