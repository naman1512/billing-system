import { NextResponse } from 'next/server';
import { generateInvoiceHTML } from '../../utils/pdfGenerator-new';

export async function GET() {
  try {
    // Default invoice data for testing
    const testInvoiceData = {
      recipientName: 'Rackup',
      addressLine1: 'Plot No 552, Chandani Warehouse',
      addressLine2: 'Village Parvar Poorab, Sarojini Nagar,',
      addressLine3: 'Lucknow, Uttar Pradesh 226008',
      recipientGst: '09CVWPG8839A2Z0',
      refNumber: 'SWC/25-26/10',
      invoiceDate: '1 May 2025',
      rentedArea: '26500',
      rentRate: '18',
      rentAmount: '477000',
      sgstRate: '9',
      sgstAmount: '42930',
      cgstRate: '9',
      cgstAmount: '42930',
      grandTotal: '562860',
      grandTotalInWords: 'Five Lakh Sixty Two Thousand Eight Hundred Sixty Only'
    };

    // Generate the HTML content with current CSS
    const htmlContent = generateInvoiceHTML(testInvoiceData);

    // Return the HTML directly so you can see CSS changes in real-time
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF preview' },
      { status: 500 }
    );
  }
}
