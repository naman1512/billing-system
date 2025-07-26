import { NextResponse } from 'next/server';
import { generateInvoiceHTML } from '../../utils/pdfGenerator-new';
import { getTemplateById } from '../../utils/companyTemplates';

export async function GET() {
  try {
    const defaultTemplate = getTemplateById('company1')!;
    // Default invoice data for testing
    const testInvoiceData = {
      recipientName: defaultTemplate.recipientDetails.name,
      addressLine1: defaultTemplate.recipientDetails.addressLine1,
      addressLine2: defaultTemplate.recipientDetails.addressLine2,
      addressLine3: defaultTemplate.recipientDetails.addressLine3,
      recipientGst: defaultTemplate.recipientDetails.gstNumber,
      refNumber: defaultTemplate.defaultRefNumberPrefix + '/10',
      invoiceDate: '1 May 2025',
      rentedArea: defaultTemplate.billDetails.rentedArea,
      rentRate: defaultTemplate.billDetails.rentRate,
      rentAmount: (parseInt(defaultTemplate.billDetails.rentedArea) * parseInt(defaultTemplate.billDetails.rentRate)).toString(),
      sgstRate: defaultTemplate.billDetails.sgstRate,
      sgstAmount: ((parseInt(defaultTemplate.billDetails.rentedArea) * parseInt(defaultTemplate.billDetails.rentRate)) * parseInt(defaultTemplate.billDetails.sgstRate) / 100).toString(),
      cgstRate: defaultTemplate.billDetails.cgstRate,
      cgstAmount: ((parseInt(defaultTemplate.billDetails.rentedArea) * parseInt(defaultTemplate.billDetails.rentRate)) * parseInt(defaultTemplate.billDetails.cgstRate) / 100).toString(),
      grandTotal: ((parseInt(defaultTemplate.billDetails.rentedArea) * parseInt(defaultTemplate.billDetails.rentRate)) * (1 + (parseInt(defaultTemplate.billDetails.sgstRate) + parseInt(defaultTemplate.billDetails.cgstRate)) / 100)).toString(),
      grandTotalInWords: 'Amount calculation based on template values',
      rentMonth: 'May',
      rentYear: '25',
      rentDescription: "Rent for the month of May '25"
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
