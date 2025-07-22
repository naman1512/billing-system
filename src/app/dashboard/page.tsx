'use client';

import Link from 'next/link';
import { companyTemplates } from '../utils/companyTemplates';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Back to Home Button */}
      <div className="mb-8 sm:absolute sm:top-8 sm:left-8 sm:mb-0">
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
        <div className="sm:pt-16">
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
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Companies</h3>
            <p className="text-3xl font-bold text-white">{companyTemplates.length}</p>
            <p className="text-gray-400 text-sm mt-2">Total registered</p>
          </div>
        </div>

        {/* Company Cards Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8 animate-fade-in-up">
            Registered Companies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyTemplates.map((company) => (
              <div 
                key={company.id}
                className="bg-gradient-to-br from-gray-800/70 via-gray-700/70 to-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-600 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 animate-fade-in-up group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                        {company.recipientDetails.name}
                      </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        Company {company.id.slice(-1)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      GST: {company.recipientDetails.gstNumber}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300 truncate">
                      {company.recipientDetails.addressLine3}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Area:</span>
                      <span className="text-sm font-medium text-yellow-400">{company.billDetails.rentedArea} sq ft</span>
                    </div>
                    <div className="text-gray-600">|</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Rate:</span>
                      <span className="text-sm font-medium text-green-400">₹{company.billDetails.rentRate}/sq ft</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-600 group-hover:border-gray-500 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">
                      Ref: {company.defaultRefNumberPrefix}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span>View Details</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
