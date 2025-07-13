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
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 backdrop-blur-sm">
      <div className="bg-gray-900 w-full h-full flex overflow-hidden border border-gray-700 shadow-2xl">

        {/* PDF Viewer - Left Half */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Invoice Preview</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-all duration-300 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transform hover:scale-110"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex-1 bg-gray-900 overflow-hidden">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0 min-h-screen"
                title="Invoice PDF"
              />
            ) : (
              <div className="w-full h-full border border-gray-600 rounded flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-400">Generating PDF...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Form - Right Half */}
        <div className="w-1/2 flex flex-col bg-gray-900">
          <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Send Invoice</h3>
          </div>

          <div className="flex-1 p-6 flex flex-col">
            {!emailSent ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all duration-300 hover:bg-gray-700"
                    placeholder="Enter recipient's email"
                    disabled={isSending}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-white transition-all duration-300 hover:bg-gray-700"
                    rows={8}
                    placeholder="Enter your email message"
                    disabled={isSending}
                  />
                </div>

                <div className="mt-auto">
                  <button
                    onClick={handleSendEmail}
                    disabled={isSending || !recipientEmail.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-md font-medium transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl"
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
                  <h3 className="text-lg font-semibold text-white mb-2">Email Sent Successfully!</h3>
                  <p className="text-gray-400">The invoice has been sent to {recipientEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
