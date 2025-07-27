'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { companiesAPI, invoicesAPI } from '../../../lib/api';
import { generatePDF, InvoiceData } from '../../utils/pdfGenerator-new';

interface Invoice {
  id: string;
  refNumber: string;
  amount: number;
  rentDescription?: string;
  invoiceDate: string;
  dueDate?: string;
  status: string;
  pdfUrl?: string;
  emailSentAt?: string;
  emailRecipient?: string;
  company: {
    name: string;
    gstNumbers: string; // JSON string, not array
  };
}

interface Company {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  gstNumbers: string; // This is a JSON string, not an array
  rentedArea: number;
  rentRate: number;
}

export default function CompanyInvoicesPage() {
  const params = useParams();
  const companyId = params?.id ? (params.id as string) : '';
  
  const [company, setCompany] = useState<Company | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch company details and invoices in parallel
        const [companyResponse, invoicesResponse] = await Promise.all([
          companiesAPI.getById(companyId),
          companiesAPI.getInvoices(companyId)
        ]);

        // Cast responses to expected types
        const companyData = companyResponse as { company: Company };
        const invoicesData = invoicesResponse as { invoices: Invoice[] };

        setCompany(companyData.company);
        setInvoices(invoicesData.invoices || []);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch company data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleDeleteInvoice = async (invoiceId: string) => {
    
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await invoicesAPI.delete(invoiceId);
      setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
    } catch (err) {
      console.error('Error deleting invoice:', err);
      alert('Failed to delete invoice: ' + String(err));
    }
  };

  const handleViewPDF = async (invoiceId: string) => {
    try {
      // Find the invoice by ID
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice || !company) {
        console.error('Invoice or company not found');
        return;
      }

      // Create invoice data for PDF generation
      const invoiceData: InvoiceData = {
        recipientName: company.name,
        addressLine1: company.addressLine1,
        addressLine2: company.addressLine2 || '',
        addressLine3: company.addressLine3 || '',
        recipientGst: Array.isArray(company.gstNumbers) ? company.gstNumbers[0] : 
                     typeof company.gstNumbers === 'string' ? JSON.parse(company.gstNumbers)[0] : '',
        refNumber: invoice.refNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        rentedArea: company.rentedArea.toString(),
        rentRate: company.rentRate.toString(),
        rentAmount: (company.rentedArea * company.rentRate).toString(),
        sgstRate: '9', // Default SGST rate
        sgstAmount: ((company.rentedArea * company.rentRate * 9) / 100).toString(),
        cgstRate: '9', // Default CGST rate
        cgstAmount: ((company.rentedArea * company.rentRate * 9) / 100).toString(),
        grandTotal: invoice.amount.toString(),
        grandTotalInWords: 'Rupees ' + invoice.amount + ' Only', // You might want to implement number to words conversion
        rentMonth: new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'long' }),
        rentYear: new Date(invoice.invoiceDate).getFullYear().toString().slice(-2),
        rentDescription: invoice.rentDescription || `Rent for the month of ${new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'long' })} '${new Date(invoice.invoiceDate).getFullYear().toString().slice(-2)}`
      };

      // Generate PDF URL and open in new tab
      const url = await generatePDF(invoiceData);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
    }
  };

  const handleConvertAndSend = async (invoice: Invoice) => {
    if (!company) return;

    try {
      // Create invoice data for PDF generation
      const invoiceData: InvoiceData = {
        recipientName: company.name,
        addressLine1: company.addressLine1,
        addressLine2: company.addressLine2 || '',
        addressLine3: company.addressLine3 || '',
        recipientGst: Array.isArray(company.gstNumbers) ? company.gstNumbers[0] : 
                     typeof company.gstNumbers === 'string' ? JSON.parse(company.gstNumbers)[0] : '',
        refNumber: invoice.refNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        rentedArea: company.rentedArea.toString(),
        rentRate: company.rentRate.toString(),
        rentAmount: (company.rentedArea * company.rentRate).toString(),
        sgstRate: '9',
        sgstAmount: ((company.rentedArea * company.rentRate * 9) / 100).toString(),
        cgstRate: '9',
        cgstAmount: ((company.rentedArea * company.rentRate * 9) / 100).toString(),
        grandTotal: invoice.amount.toString(),
        grandTotalInWords: 'Rupees ' + invoice.amount + ' Only',
        rentMonth: new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'long' }),
        rentYear: new Date(invoice.invoiceDate).getFullYear().toString().slice(-2),
        rentDescription: invoice.rentDescription || `Rent for the month of ${new Date(invoice.invoiceDate).toLocaleDateString('en-US', { month: 'long' })} '${new Date(invoice.invoiceDate).getFullYear().toString().slice(-2)}`
      };

      // Generate PDF URL
      const pdfUrl = await generatePDF(invoiceData);
      
      // Convert URL to blob for email
      const response = await fetch(pdfUrl);
      const pdfBlob = await response.blob();
      
      // Create FormData and send email
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `Invoice-${invoice.refNumber}.pdf`);
      formData.append('recipientEmail', invoice.emailRecipient || company.name + '@example.com');
      formData.append('subject', `Invoice ${invoice.refNumber}`);
      formData.append('body', `Please find attached your invoice ${invoice.refNumber}.`);

      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });

      if (emailResponse.ok) {
        // Update invoice status to SENT
        const updateResponse = await invoicesAPI.update(invoice.id, {
          ...invoice,
          status: 'SENT'
        });

        if (updateResponse) {
          alert('Invoice sent successfully!');
          // Refresh invoices
          const invoicesResponse = await companiesAPI.getInvoices(companyId);
          const invoicesData = invoicesResponse as { invoices: Invoice[] };
          setInvoices(invoicesData.invoices || []);
        }
      } else {
        alert('Failed to send invoice.');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error sending invoice.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent': return 'text-green-400 bg-green-400/10';
      case 'paid': return 'text-blue-400 bg-blue-400/10';
      case 'overdue': return 'text-red-400 bg-red-400/10';
      case 'draft': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/dashboard">
          <button className="group flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-green-500">
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Company Header */}
        {company && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
                <p className="text-gray-400 mb-4">{company.addressLine3}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {JSON.parse(company.gstNumbers).map((gst: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-400/10 text-green-400 rounded-full text-sm border border-green-400/20"
                    >
                      GST: {gst}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Area</p>
                <p className="text-2xl font-bold text-yellow-400">{company.rentedArea.toLocaleString()} sq ft</p>
                <p className="text-sm text-gray-500 mt-2">Rate: ₹{company.rentRate}/sq ft</p>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Invoices ({invoices.length})</h2>
            <Link href={`/create-bill?companyId=${companyId}`}>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105">
                Create New Invoice
              </button>
            </Link>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No invoices found</p>
              <p className="text-gray-500 text-sm mt-2">Create your first invoice to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600 rounded-lg p-4 hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-white">{invoice.refNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="text-green-400 font-semibold">₹{invoice.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Invoice Date</p>
                          <p className="text-gray-300">{formatDate(invoice.invoiceDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">GST Numbers</p>
                          <p className="text-gray-300">{JSON.parse(invoice.company.gstNumbers).join(', ')}</p>
                        </div>
                        {invoice.rentDescription && (
                          <div>
                            <p className="text-gray-500">Description</p>
                            <p className="text-gray-300">{invoice.rentDescription}</p>
                          </div>
                        )}
                      </div>

                      {invoice.emailSentAt && (
                        <div className="mt-2 text-xs text-blue-400">
                          Email sent: {formatDate(invoice.emailSentAt)}
                          {invoice.emailRecipient && ` to ${invoice.emailRecipient}`}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewPDF(invoice.id)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                        title="View PDF"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {(!invoice.status || invoice.status === 'DRAFT') && (
                        <button
                          onClick={() => handleConvertAndSend(invoice)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                          title="Convert and Send"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                        title="Delete Invoice"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
