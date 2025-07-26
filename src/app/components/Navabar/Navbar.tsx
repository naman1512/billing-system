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

  const handleSaveToDirectory = (e?: React.MouseEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Call the global function from the page component
    if (typeof window !== 'undefined') {
      const windowWithHandler = window as typeof window & { handleSaveToDirectory?: () => Promise<void> };
      if (windowWithHandler.handleSaveToDirectory) {
        windowWithHandler.handleSaveToDirectory();
      }
    }
  };

  const handleCompanyDashboard = async () => {
    try {
      if (typeof window !== 'undefined') {
        const selectedCompanyId = localStorage.getItem('selectedCompanyId') || 'company1';
        
        // Import and get the template to find the company name
        const { getTemplateById } = await import('../../utils/companyTemplates');
        const template = getTemplateById(selectedCompanyId);
        
        if (template) {
          // Fetch companies to find the real company ID by name
          const { companiesAPI } = await import('../../../lib/api');
          const companiesResponse = await companiesAPI.getAll() as { companies: { id: string; name: string }[] };
          const company = companiesResponse.companies?.find((c) => 
            c.name.toLowerCase() === template.recipientDetails.name.toLowerCase()
          );
          
          if (company) {
            window.location.href = `/company/${company.id}`;
          } else {
            // If company doesn't exist in database, go to main dashboard
            window.location.href = '/dashboard';
          }
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Error navigating to company dashboard:', error);
      // Fallback to main dashboard
      window.location.href = '/dashboard';
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
                href="/create-bill"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isCurrentPage('/create-bill') 
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
              {pathname === '/create-bill' && (
                <div className="flex items-center space-x-2">
                  {/* Dashboard Navigation Buttons */}
                  <Link 
                    href="/dashboard"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </Link>
                  
                  <button 
                    onClick={handleCompanyDashboard}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 10h10M7 13h10m-9 3h8" />
                    </svg>
                    Company
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleSaveToDirectory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Save to Directory
                  </button>
                  <button 
                    type="button"
                    onClick={handleConvertAndSend}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Convert & Send
                  </button>
                </div>
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
            href="/create-bill"
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
              isCurrentPage('/create-bill') 
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
          {pathname === '/create-bill' && (
            <div className="space-y-2">
              {/* Dashboard Navigation Buttons - Mobile */}
              <Link 
                href="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 w-full text-left transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </Link>
              
              <button 
                onClick={handleCompanyDashboard}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 w-full text-left transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 10h10M7 13h10m-9 3h8" />
                </svg>
                Company Dashboard
              </button>
              
              <button 
                type="button"
                onClick={handleSaveToDirectory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 w-full text-left transform hover:scale-105"
              >
                Save to Directory
              </button>
              <button 
                type="button"
                onClick={handleConvertAndSend}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 w-full text-left transform hover:scale-105"
              >
                Convert & Send
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
