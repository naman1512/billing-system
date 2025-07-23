'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

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
      toast.error('Please enter recipient email', {
        icon: '📧',
        duration: 3000,
      });
      return;
    }

    if (!invoiceData) {
      toast.error('Invoice data is missing', {
        icon: '❌',
        duration: 3000,
      });
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
        toast.success('Email sent successfully!', {
          icon: '✅',
          duration: 4000,
        });
        
        // Automatically download PDF copy after successful email send
        if (invoiceData) {
          try {
            // Generate actual PDF for download with signature
            const { jsPDF } = await import('jspdf');
            
            // Load signature image as base64 for browser
            const loadSignatureImage = (): Promise<string> => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx?.drawImage(img, 0, 0);
                  const dataURL = canvas.toDataURL('image/png');
                  resolve(dataURL);
                };
                img.onerror = () => reject(new Error('Failed to load signature image'));
                img.src = '/sign.png';
              });
            };
            
            // Create PDF with signature
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            
            // Add borders
            pdf.setLineWidth(0.5);
            pdf.setDrawColor(0, 0, 0);
            pdf.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin * 2) + 10);
            pdf.setLineWidth(0.2);
            pdf.setDrawColor(100, 100, 100);
            pdf.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
            
            let currentY = margin + 10;
            
            // Company Header
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.setTextColor(220, 38, 38);
            const companyName = 'SAHAYA WAREHOUSING COMPANY';
            const companyNameWidth = pdf.getTextWidth(companyName);
            pdf.text(companyName, (pageWidth - companyNameWidth) / 2, currentY);
            
            currentY += 8;
            pdf.setFontSize(9);
            pdf.setTextColor(60, 60, 60);
            pdf.setFont('helvetica', 'normal');
            const address = 'Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008';
            const addressWidth = pdf.getTextWidth(address);
            pdf.text(address, (pageWidth - addressWidth) / 2, currentY);
            
            currentY += 10;
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            const invoiceTitle = 'TAX INVOICE';
            const titleWidth = pdf.getTextWidth(invoiceTitle);
            pdf.text(invoiceTitle, (pageWidth - titleWidth) / 2, currentY);
            
            currentY += 8;
            pdf.setLineWidth(0.3);
            pdf.setDrawColor(0, 0, 0);
            pdf.line(margin + 10, currentY, pageWidth - margin - 10, currentY);
            currentY += 15;
            
            // Recipient and company info
            const leftColX = margin + 5;
            const rightColX = pageWidth - margin - 70;
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text('To,', leftColX, currentY);
            
            // Company info (right side)
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('GST No.: 09AEZFS6432B1ZL', rightColX, currentY);
            pdf.text('PAN No.: AEZFS6432B', rightColX, currentY + 4);
            pdf.text('HSN Code : 997212', rightColX, currentY + 8);
            pdf.text(`Ref No ${invoiceData.refNumber}     Date: ${invoiceData.invoiceDate}`, rightColX, currentY + 12);
            
            currentY += 4;
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${invoiceData.recipientName},`, leftColX, currentY);
            currentY += 4;
            pdf.setFont('helvetica', 'normal');
            pdf.text(invoiceData.addressLine1, leftColX, currentY);
            currentY += 4;
            pdf.text(invoiceData.addressLine2, leftColX, currentY);
            currentY += 4;
            pdf.text(invoiceData.addressLine3, leftColX, currentY);
            currentY += 4;
            pdf.text(`GST NO: ${invoiceData.recipientGst}`, leftColX, currentY);
            
            currentY += 15;
            
            // Table
            const tableY = currentY;
            const col1X = margin + 5;
            const col2X = margin + 100;
            const col3X = margin + 140;
            const rowHeight = 8;
            
            // Table header
            pdf.setFillColor(240, 240, 240);
            pdf.rect(col1X, tableY, contentWidth - 10, rowHeight, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.text('Particulars Area Sqft', col1X + 2, tableY + 5);
            pdf.text('Rate', col2X + 2, tableY + 5);
            pdf.text('Amount', col3X + 2, tableY + 5);
            
            // Table rows
            currentY = tableY + rowHeight;
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Rented for ${invoiceData.rentedArea}`, col1X + 2, currentY + 5);
            pdf.text(invoiceData.rentRate, col2X + 2, currentY + 5);
            pdf.text(invoiceData.rentAmount, col3X + 2, currentY + 5);
            
            currentY += rowHeight;
            pdf.text('SGST', col1X + 2, currentY + 5);
            pdf.text(`${invoiceData.sgstRate}%`, col2X + 2, currentY + 5);
            pdf.text(invoiceData.sgstAmount, col3X + 2, currentY + 5);
            
            currentY += rowHeight;
            pdf.text('CGST', col1X + 2, currentY + 5);
            pdf.text(`${invoiceData.cgstRate}%`, col2X + 2, currentY + 5);
            pdf.text(invoiceData.cgstAmount, col3X + 2, currentY + 5);
            
            currentY += rowHeight;
            pdf.setFillColor(220, 220, 220);
            pdf.rect(col1X, currentY, contentWidth - 10, rowHeight, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.text('Grand Total', col1X + 2, currentY + 5);
            pdf.text(invoiceData.grandTotal, col3X + 2, currentY + 5);
            
            // Table borders
            pdf.setLineWidth(0.3);
            for (let i = 0; i <= 4; i++) {
              const y = tableY + (i * rowHeight);
              pdf.line(col1X, y, col1X + contentWidth - 10, y);
            }
            pdf.line(col1X, tableY, col1X, tableY + (4 * rowHeight));
            pdf.line(col2X, tableY, col2X, tableY + (4 * rowHeight));
            pdf.line(col3X, tableY, col3X, tableY + (4 * rowHeight));
            pdf.line(col1X + contentWidth - 10, tableY, col1X + contentWidth - 10, tableY + (4 * rowHeight));
            
            currentY += 15;
            
            // Amount in words and other details
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(`Amount Chargeable (In Words) : ${invoiceData.grandTotalInWords}`, leftColX, currentY);
            currentY += 6;
            pdf.text(`Rent for the month of May '25`, leftColX, currentY);
            currentY += 6;
            pdf.text('Pan No. : AEZFS6432B', leftColX, currentY);
            currentY += 6;
            pdf.text('HDFC Bank Account No. : S0200081328200', leftColX, currentY);
            currentY += 6;
            pdf.text('IFSC Code : HDFC0000078', leftColX, currentY);
            
            currentY += 10;
            pdf.setFontSize(8);
            const declarationText = '*TDS – Under section 194I should be deducted on gross bill value excluding service tax value (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)';
            const splitDeclaration = pdf.splitTextToSize(declarationText, contentWidth - 60);
            pdf.text(splitDeclaration, margin + 5, currentY);
            
            // Signature section
            const signatureX = pageWidth - margin - 60;
            const signatureY = currentY + 15;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.text('Customer\'s Seal and Signature For', signatureX, signatureY);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Sahaya Warehousing Company', signatureX, signatureY + 4);
            pdf.setLineWidth(0.3);
            pdf.line(signatureX, signatureY + 10, signatureX + 50, signatureY + 10);
            
            // Add signature image
            try {
              const signatureDataURL = await loadSignatureImage();
              pdf.addImage(signatureDataURL, 'PNG', signatureX + 5, signatureY + 12, 40, 15);
            } catch (error) {
              console.warn('Could not load signature image:', error);
            }
            
            // Create blob and download
            const pdfBlob = pdf.output('blob');
            const downloadUrl = URL.createObjectURL(pdfBlob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Invoice_${invoiceData.refNumber || 'copy'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
            
            setTimeout(() => {
              toast.success('PDF downloaded to your device!', {
                icon: '📥',
                duration: 3000,
              });
            }, 1000);
          } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF', {
              icon: '❌',
              duration: 3000,
            });
          }
        }
        
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
      toast.error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        icon: '❌',
        duration: 5000,
      });
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
