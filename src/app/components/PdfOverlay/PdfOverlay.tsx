'use client';

import { useState } from 'react';

interface InvoiceData {
  recipientName: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  recipientGst: string;
  refNumber: string;
  invoiceDate: string;
  rentedArea: string;
  rentRate: string;
  rentAmount: string;
  sgstRate: string;
  sgstAmount: string;
  cgstRate: string;
  cgstAmount: string;
  grandTotal: string;
  grandTotalInWords: string;
}

interface PdfOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  invoiceData?: InvoiceData; // Add invoice data prop
}

export default function PdfOverlay({ isOpen, onClose, pdfUrl, invoiceData }: PdfOverlayProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailMessage, setEmailMessage] = useState(
    `Dear recipient,

Here is your bill for the month.

Thank you,
Regards
Harsh Vardhan Bhandari
Number: xxxxxxxxx
Email: xxxxxx@gmail.com`
  );

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      alert('Please enter recipient email');
      return;
    }

    if (!invoiceData) {
      alert('Invoice data is missing');
      return;
    }

    setIsSending(true);
    
    try {
      // Make actual API call to send the email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          emailMessage,
          invoiceData
        })
      });

      const result = await response.json();

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => {
          onClose();
          setEmailSent(false);
          setRecipientEmail('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex overflow-hidden">
        
        {/* PDF Viewer - Left Half */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Invoice Preview</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex-1 p-4">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border border-gray-300 rounded"
                title="Invoice PDF"
              />
            ) : (
              <div className="w-full h-full border border-gray-300 rounded flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Generating PDF...</p>
              </div>
            )}
          </div>
        </div>

        {/* Email Form - Right Half */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Send Invoice</h3>
          </div>
          
          <div className="flex-1 p-6 flex flex-col">
            {!emailSent ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter recipient's email"
                    disabled={isSending}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={8}
                    placeholder="Enter your email message"
                    disabled={isSending}
                  />
                </div>

                <div className="mt-auto">
                  <button
                    onClick={handleSendEmail}
                    disabled={isSending || !recipientEmail.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Invoice'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent Successfully!</h3>
                  <p className="text-gray-600">The invoice has been sent to {recipientEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
