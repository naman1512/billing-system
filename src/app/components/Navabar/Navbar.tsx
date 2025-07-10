'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 w-full">
      <div className="w-full px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 w-full">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 overflow-hidden">
            {/* Large Desktop version - Full name */}
            <h1 className="hidden lg:block text-lg font-bold text-red-600 truncate">
              SahayaWarehousing Billing System
            </h1>
            {/* Medium Desktop version - Shorter name */}
            <h1 className="hidden sm:block lg:hidden text-lg font-bold text-red-600 truncate">
              Sahaya Billing
            </h1>
            {/* Mobile version - Abbreviated name */}
            <h1 className="block sm:hidden text-base font-bold text-red-600 truncate">
              SWH Billing
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block flex-shrink-0">
            <div className="flex items-center">
              <button 
                onClick={handleConvertAndSend}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              >
                Convert and Send
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0 ml-2">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
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
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
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
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
          <button 
            onClick={handleConvertAndSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-left"
          >
            Convert and Send
          </button>
        </div>
      </div>
    </nav>
  );
}
