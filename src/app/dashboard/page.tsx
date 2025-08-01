'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { invoicesAPI, companiesAPI } from '../../lib/api';
import { generatePDF, InvoiceData } from '../utils/pdfGenerator-new';
import PdfOverlay from '../components/PdfOverlay/PdfOverlay';

interface Company {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  gstNumbers: string[]; // Changed from string to string[] array
  rentedArea: number;
  rentRate: number;
  sgstRate: number;
  cgstRate: number;
  refNumberPrefix: string;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  refNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  invoiceDate?: string;
  rentDescription?: string;
  invoiceData?: InvoiceData; // Stored invoice data from when it was created
  company: {
    name: string;
  };
}

export default function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfOverlayOpen, setIsPdfOverlayOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceData | null>(null);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch companies from backend API
        const [companiesResponse, invoicesResponse] = await Promise.all([
          companiesAPI.getAll(),
          invoicesAPI.getRecent(3) // Get 3 recent invoices as requested
        ]);

        const typedCompaniesResponse = companiesResponse as { companies: Company[] };
        const typedInvoicesResponse = invoicesResponse as { invoices: Invoice[] };
        
        setCompanies(typedCompaniesResponse.companies || []);
        setInvoices(typedInvoicesResponse.invoices || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data from backend');
        setCompanies([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);


  // Helper: extract true company base name (robust for your templates)
  const getBaseName = (name: string) => {
    // Remove 'Company X - ' prefix if present
    let base = name.replace(/^Company \d+ - /, '').trim();
    // Remove trailing numbers (e.g. 'Value Logistics 1' -> 'Value Logistics')
    base = base.replace(/\s*\d+$/, '').trim();
    // Remove trailing dash if any
    base = base.replace(/\s*-\s*$/, '').trim();
    // Special case: treat all 'Value Logistics' as one group
    if (base.toLowerCase().includes('value logistics')) return 'Value Logistics';
    if (base.toLowerCase().includes('cmunity innovation')) return 'Cmunity Innovation';
    if (base.toLowerCase().includes('kapoor diesels garage')) return 'Kapoor Diesels Garage';
    return base;
  };

  // Group companies by base name and sum rentedArea
  const companyGroups: { [baseName: string]: { totalArea: number, companies: Company[] } } = {};
  companies.forEach(company => {
    const base = getBaseName(company.name);
    if (!companyGroups[base]) {
      companyGroups[base] = { totalArea: 0, companies: [] };
    }
    companyGroups[base].totalArea += company.rentedArea;
    companyGroups[base].companies.push(company);
  });

  // Calculate total area across all companies
  const totalArea = Object.values(companyGroups).reduce((sum, group) => sum + group.totalArea, 0);

  // Function to handle Convert & Send for DRAFT invoices
  const handleConvertAndSend = async (invoice: Invoice) => {
    try {
      let invoiceData: InvoiceData;

      console.log('Invoice object:', invoice);
      console.log('Invoice.invoiceData:', invoice.invoiceData);
      console.log('Type of invoiceData:', typeof invoice.invoiceData);

      // If invoice has saved data, use it; otherwise create new data
      if (invoice.invoiceData) {
        // Handle both string and object cases for invoiceData
        if (typeof invoice.invoiceData === 'string') {
          try {
            invoiceData = JSON.parse(invoice.invoiceData);
            console.log('Parsed invoiceData from string:', invoiceData);
          } catch (parseError) {
            console.error('Failed to parse invoiceData string:', parseError);
            throw new Error('Invalid saved invoice data format');
          }
        } else {
          invoiceData = invoice.invoiceData;
          console.log('Using invoiceData object directly:', invoiceData);
        }
        
        // Validate that all required fields are present
        const requiredFields = ['recipientName', 'refNumber', 'invoiceDate', 'grandTotal'];
        const missingFields = requiredFields.filter(field => !invoiceData[field as keyof InvoiceData]);
        
        if (missingFields.length > 0) {
          console.warn('Missing required fields in saved data:', missingFields);
          throw new Error(`Saved invoice data is incomplete. Missing: ${missingFields.join(', ')}`);
        }
        
        console.log('Using saved invoice data:', invoiceData);
      } else {
        // Fallback: Create invoice data from company details (for old invoices)
        console.log('No saved invoice data found, creating from company details');
        const company = companies.find(c => c.name === invoice.company.name);
        if (!company) {
          console.error('Company not found for invoice:', invoice.company.name);
          console.log('Available companies:', companies.map(c => c.name));
          alert('Error: Company data not found for this invoice');
          return;
        }

        // Ensure all required fields have fallback values for convert & send
        const recipientGst = (company.gstNumbers && company.gstNumbers.length > 0) ? company.gstNumbers[0] : '';
        const rentedArea = company.rentedArea || 0;
        const rentRate = company.rentRate || 0;
        const rentAmount = rentedArea * rentRate;
        const sgstRate = company.sgstRate || 9;
        const cgstRate = company.cgstRate || 9;
        const sgstAmount = (rentAmount * sgstRate) / 100;
        const cgstAmount = (rentAmount * cgstRate) / 100;
        const grandTotal = rentAmount + sgstAmount + cgstAmount;

        // Create invoice data for PDF generation
        invoiceData = {
          recipientName: company.name || 'Unknown Company',
          addressLine1: company.addressLine1 || '',
          addressLine2: company.addressLine2 || '',
          addressLine3: company.addressLine3 || '',
          recipientGst: recipientGst,
          refNumber: invoice.refNumber || 'Unknown Ref',
          invoiceDate: invoice.invoiceDate || new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          rentedArea: rentedArea.toString(),
          rentRate: rentRate.toString(),
          rentAmount: rentAmount.toString(),
          sgstRate: sgstRate.toString(),
          sgstAmount: sgstAmount.toString(),
          cgstRate: cgstRate.toString(),
          cgstAmount: cgstAmount.toString(),
          grandTotal: grandTotal.toString(),
          grandTotalInWords: `Rupees ${grandTotal} Only`,
          rentMonth: new Date(invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(invoice.createdAt)).toLocaleDateString('en-US', { month: 'long' }),
          rentYear: new Date(invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(invoice.createdAt)).getFullYear().toString().slice(-2),
          rentDescription: invoice.rentDescription || `Rent for the month of ${new Date(invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(invoice.createdAt)).toLocaleDateString('en-US', { month: 'long' })} '${new Date(invoice.invoiceDate ? new Date(invoice.invoiceDate) : new Date(invoice.createdAt)).getFullYear().toString().slice(-2)}`
        };
        console.log('Created new invoice data from company details for convert & send:', invoiceData);
      }

      console.log('Final invoiceData being passed to PDF generator:', invoiceData);
      // Generate PDF URL
      const url = await generatePDF(invoiceData);
      setPdfUrl(url);
      setCurrentInvoiceData(invoiceData);
      setCurrentInvoiceId(invoice.id); // Store the invoice ID for updating
      setIsPdfOverlayOpen(true);
    } catch (error) {
      console.error('Error opening Convert & Send:', error);
      alert(`Error: Failed to open invoice preview - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleViewPDF = async (invoice: Invoice) => {
    try {
      console.log('=== DEBUG: Dashboard handleViewPDF ===');
      console.log('Invoice:', invoice);
      console.log('Invoice has saved data:', !!invoice.invoiceData);
      console.log('Invoice saved data:', invoice.invoiceData);

      let invoiceData: InvoiceData;

      // If invoice has saved data, use it; otherwise create new data
      if (invoice.invoiceData) {
        // Use the saved invoice data
        invoiceData = invoice.invoiceData;
        console.log('Using saved invoice data for view:', invoiceData);
      } else {
        // Fallback: Create invoice data from company details (for old invoices)
        console.log('No saved invoice data found, creating from company details');
        
        // Get company details for the invoice by name
        const company = companies.find(c => c.name === invoice.company.name);
        if (!company) {
          console.error('Company not found for invoice');
          return;
        }

        console.log('Creating fallback invoice data from company:', {
          companyName: company.name,
          rentedArea: company.rentedArea,
          rentRate: company.rentRate,
          gstNumbers: company.gstNumbers
        });

        // Ensure all required fields have fallback values
        const recipientGst = (company.gstNumbers && company.gstNumbers.length > 0) ? company.gstNumbers[0] : '';
        const rentedArea = company.rentedArea || 0;
        const rentRate = company.rentRate || 0;
        const rentAmount = rentedArea * rentRate;
        const sgstRate = company.sgstRate || 9;
        const cgstRate = company.cgstRate || 9;
        const sgstAmount = (rentAmount * sgstRate) / 100;
        const cgstAmount = (rentAmount * cgstRate) / 100;
        const grandTotal = rentAmount + sgstAmount + cgstAmount;

        // Create invoice data for PDF generation
        invoiceData = {
          recipientName: company.name || 'Unknown Company',
          addressLine1: company.addressLine1 || '',
          addressLine2: company.addressLine2 || '',
          addressLine3: company.addressLine3 || '',
          recipientGst: recipientGst,
          refNumber: invoice.refNumber || 'Unknown Ref',
          invoiceDate: new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          rentedArea: rentedArea.toString(),
          rentRate: rentRate.toString(),
          rentAmount: rentAmount.toString(),
          sgstRate: sgstRate.toString(),
          sgstAmount: sgstAmount.toString(),
          cgstRate: cgstRate.toString(),
          cgstAmount: cgstAmount.toString(),
          grandTotal: grandTotal.toString(),
          grandTotalInWords: `Rupees ${grandTotal} Only`,
          rentMonth: new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('en-US', { month: 'long' }),
          rentYear: new Date(invoice.invoiceDate || invoice.createdAt).getFullYear().toString().slice(-2),
          rentDescription: invoice.rentDescription || `Rent for the month of ${new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('en-US', { month: 'long' })} '${new Date(invoice.invoiceDate || invoice.createdAt).getFullYear().toString().slice(-2)}`
        };
        
        console.log('Created fallback invoice data for dashboard view:', invoiceData);
      }

      console.log('Final invoice data for PDF generation:', invoiceData);
      // Generate PDF URL and open in new tab
      const url = await generatePDF(invoiceData);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  // If error, show dashboard with template data and a warning
  // (companies will be set to template data in this case)
  // Only show a warning banner, not a blocking error page

  // Show warning banner if error
  const WarningBanner = error ? (
    <div className="bg-yellow-200 text-yellow-900 px-4 py-2 rounded mb-4 text-center font-semibold">
      {error}
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {WarningBanner}
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
            Company analytics and insights
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <h3 className="text-xl font-semibold text-blue-400 mb-2">Total Invoices</h3>
              <p className="text-3xl font-bold text-white">{invoices.length}</p>
              <p className="text-gray-400 text-sm mt-2">Generated</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300">
              <h3 className="text-xl font-semibold text-green-400 mb-2">Total Area</h3>
              <p className="text-3xl font-bold text-white">{totalArea.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-2">sq ft across all companies</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <h3 className="text-xl font-semibold text-purple-400 mb-2">Companies</h3>
              <p className="text-3xl font-bold text-white">{Object.keys(companyGroups).length}</p>
              <p className="text-gray-400 text-sm mt-2">Total registered</p>
            </div>
          </div>

          {/* Company Cards Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 animate-fade-in-up">
              Registered Companies
            </h2>
            {Object.keys(companyGroups).length === 0 ? (
              <div className="text-gray-400 text-lg">No companies registered yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(companyGroups).map(([baseName, group]) => (
                  <div 
                    key={baseName}
                    className="bg-gradient-to-br from-gray-800/70 via-gray-700/70 to-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-600 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 animate-fade-in-up group cursor-pointer"
                    onClick={() => window.location.href = `/company/${group.companies[0].id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                          <span className="text-white font-bold text-lg">
                            {baseName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors duration-300">
                            {baseName}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {group.companies[0].addressLine1}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Total Rented Area:</span>
                        <span className="text-white font-semibold">
                          {group.totalArea.toLocaleString()} sq ft
                        </span>
                      </div>
                      {/* Show all rent rates for this group */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Rent Rate(s):</span>
                        <span className="text-green-400 font-semibold">
                          {group.companies.map(c => `₹${c.rentRate}/sq ft`).join(', ')}
                        </span>
                      </div>
                      {/* GST Numbers for all companies in group */}
                      <div className="mt-4">
                        <span className="text-gray-400 text-sm block mb-2">GST Numbers:</span>
                        {baseName === 'Value Logistics' ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-gray-700/50 text-yellow-400 text-xs rounded-md border border-gray-600">
                                09APAPK2219Q2ZL
                              </span>
                              <span className="px-2 py-1 bg-gray-700/50 text-yellow-400 text-xs rounded-md border border-gray-600">
                                APAPK2219Q
                              </span>
                            </div>
                          </>
                        ) : baseName === 'Cmunity Innovation' ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-gray-700/50 text-yellow-400 text-xs rounded-md border border-gray-600">
                                09AAGICC7028B1ZU
                              </span>
                            </div>
                          </>
                        ) : baseName === 'Kapoor Diesels Garage' ? (
                          <>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-gray-700/50 text-yellow-400 text-xs rounded-md border border-gray-600">
                                09AAACK9286G1ZL
                              </span>
                            </div>
                          </>
                        ) : (
                          (() => {
                            const allGsts = group.companies.flatMap(c => {
                              return Array.isArray(c.gstNumbers) ? c.gstNumbers : [c.gstNumbers];
                            });
                            const uniqueGsts = Array.from(new Set(allGsts.filter(Boolean)));
                            return (
                              <>
                                {uniqueGsts.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-gray-700/50 text-yellow-400 text-xs rounded-md border border-gray-600">
                                      {uniqueGsts[0]}
                                    </span>
                                  </div>
                                )}
                                {uniqueGsts.length > 1 && (
                                  <div className="flex flex-col gap-1 mt-2 pl-1">
                                    {uniqueGsts.slice(1).map((gst) => (
                                      <span key={gst} className="flex items-center text-xs text-yellow-300">
                                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                                        </svg>
                                        {gst}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Click to view details</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Invoices Section */}
          {invoices.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-white mb-8">Recent Invoices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.slice(0, 3).map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-white">{invoice.refNumber}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs ${
                        invoice.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                        invoice.status === 'SENT' ? 'bg-blue-500/20 text-blue-400' :
                        invoice.status === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {invoice.status === 'DRAFT' ? 'Unsent' : 
                         invoice.status === 'SENT' ? 'Sent' : 
                         invoice.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{invoice.company.name}</p>
                    <p className="text-2xl font-bold text-green-400">₹{invoice.amount.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                    
                    <div className="flex gap-2 mt-3">
                      {/* Eye icon to view PDF in new tab */}
                      <button
                        onClick={() => handleViewPDF(invoice)}
                        className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        title="View PDF"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      
                      {/* Convert & Send button for DRAFT invoices */}
                      {invoice.status === 'DRAFT' && (
                        <button
                          onClick={() => handleConvertAndSend(invoice)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Convert & Send
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Overlay for Convert & Send */}
      {currentInvoiceData && (
        <PdfOverlay
          isOpen={isPdfOverlayOpen}
          onClose={() => {
            setIsPdfOverlayOpen(false);
            setPdfUrl('');
            setCurrentInvoiceData(null);
            setCurrentInvoiceId(null);
            // Optionally, you can refresh invoices here if needed
          }}
          pdfUrl={pdfUrl}
          invoiceData={currentInvoiceData}
          existingInvoiceId={currentInvoiceId || undefined}
        />
      )}
    </div>
  );
}
