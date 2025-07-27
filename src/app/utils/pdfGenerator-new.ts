// EMBEDDED BASE64 SIGNATURE IMAGE (replace the string below with your actual base64 data)
const EMBEDDED_SIGNATURE_BASE64 =
  'data:image/png;base64,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';

// Always return the embedded base64 string for maximum reliability
const getSignatureBase64 = async (): Promise<string | null> => {
  return EMBEDDED_SIGNATURE_BASE64;
};
// Helper to generate invoice HTML for emails with embedded signature
export const generateInvoiceHTMLEmail = async (invoiceData: InvoiceData): Promise<string> => {
  const signatureDataUrl = await getSignatureBase64ForHTML();
  return generateInvoiceHTML(invoiceData, signatureDataUrl);
};

// Interface for invoice data
export interface InvoiceData {
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
  rentMonth: string;
  rentYear: string;
  rentDescription: string;
}

// Import jsPDF dynamically to avoid SSR issues
const getJsPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  return { jsPDF, html2canvas };
};

// Utility to format date as "21st July 2025"
export function formatInvoiceDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

// Generate PDF buffer for email attachment
export const generatePDFBuffer = async (invoiceData: InvoiceData): Promise<Buffer> => {
  try {
    const { jsPDF } = await getJsPDF();
    
    // Create new PDF document with better margins
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Add outer border
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin * 2) + 10);
    
    // Add inner border with some padding
    pdf.setLineWidth(0.2);
    pdf.setDrawColor(100, 100, 100);
    pdf.rect(margin, margin, contentWidth, pageHeight - (margin * 2));
    
    let currentY = margin + 10;
    
    // Company Header with better styling
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
    
    // Add a line separator
    currentY += 8;
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin + 10, currentY, pageWidth - margin - 10, currentY);
    
    currentY += 15;
    
    // Two column layout for recipient and company info
    const leftColX = margin + 5;
    const rightColX = pageWidth - margin - 70;
    
    // Recipient information (left column)
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('To,', leftColX, currentY);
    
    currentY += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${invoiceData.recipientName},`, leftColX, currentY);
    
    currentY += 5;
    pdf.text(invoiceData.addressLine1, leftColX, currentY);
    
    currentY += 5;
    pdf.text(invoiceData.addressLine2, leftColX, currentY);
    
    currentY += 5;
    pdf.text(invoiceData.addressLine3, leftColX, currentY);
    
    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`GST NO: ${invoiceData.recipientGst}`, leftColX, currentY);
    
    // Company information (right column) - reset Y position
    let rightColY = currentY - 25;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('GST No.: 09AEZFS6432B1ZL', rightColX, rightColY);
    
    rightColY += 5;
    pdf.text('PAN No.: AEZFS6432B', rightColX, rightColY);
    
    rightColY += 5;
    pdf.text('HSN Code: 997212', rightColX, rightColY);
    
    rightColY += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Ref No: ${invoiceData.refNumber}`, rightColX, rightColY);
    
    rightColY += 5;
    pdf.text(`Date: ${formatInvoiceDate(invoiceData.invoiceDate)}`, rightColX, rightColY);
    
    currentY += 20;
    
    // Table with professional styling
    const tableX = margin + 5;
    const tableWidth = contentWidth - 10;
    const col1Width = tableWidth * 0.55;
    const col2Width = tableWidth * 0.20;
    const col3Width = tableWidth * 0.25;
    const rowHeight = 12;
    
    // Table header with background
    pdf.setFillColor(240, 240, 240);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.3);
    
    // Header row background
    pdf.rect(tableX, currentY, tableWidth, rowHeight, 'FD');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Header text
    pdf.text('Particulars Area Sqft', tableX + 3, currentY + 8);
    pdf.text('Rate', tableX + col1Width + (col2Width / 2) - (pdf.getTextWidth('Rate') / 2), currentY + 8);
    pdf.text('Amount', tableX + col1Width + col2Width + (col3Width / 2) - (pdf.getTextWidth('Amount') / 2), currentY + 8);
    
    // Header borders
    pdf.line(tableX, currentY, tableX + tableWidth, currentY); // top
    pdf.line(tableX, currentY + rowHeight, tableX + tableWidth, currentY + rowHeight); // bottom
    pdf.line(tableX, currentY, tableX, currentY + rowHeight); // left
    pdf.line(tableX + col1Width, currentY, tableX + col1Width, currentY + rowHeight); // middle 1
    pdf.line(tableX + col1Width + col2Width, currentY, tableX + col1Width + col2Width, currentY + rowHeight); // middle 2
    pdf.line(tableX + tableWidth, currentY, tableX + tableWidth, currentY + rowHeight); // right
    
    currentY += rowHeight;
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    
    const rows = [
      [`Rented for ${invoiceData.rentedArea}`, invoiceData.rentRate, invoiceData.rentAmount],
      ['SGST', `${invoiceData.sgstRate}%`, invoiceData.sgstAmount],
      ['CGST', `${invoiceData.cgstRate}%`, invoiceData.cgstAmount]
    ];
    
    rows.forEach((row, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(tableX, currentY, tableWidth, rowHeight, 'F');
      }
      
      pdf.text(row[0], tableX + 3, currentY + 8);
      pdf.text(row[1], tableX + col1Width + (col2Width / 2) - (pdf.getTextWidth(row[1]) / 2), currentY + 8);
      pdf.text(row[2], tableX + col1Width + col2Width + col3Width - 3 - pdf.getTextWidth(row[2]), currentY + 8);
      
      // Row borders
      pdf.line(tableX, currentY + rowHeight, tableX + tableWidth, currentY + rowHeight);
      pdf.line(tableX, currentY, tableX, currentY + rowHeight);
      pdf.line(tableX + col1Width, currentY, tableX + col1Width, currentY + rowHeight);
      pdf.line(tableX + col1Width + col2Width, currentY, tableX + col1Width + col2Width, currentY + rowHeight);
      pdf.line(tableX + tableWidth, currentY, tableX + tableWidth, currentY + rowHeight);
      
      currentY += rowHeight;
    });
    
    // Grand Total row with special styling
    pdf.setFillColor(220, 220, 220);
    pdf.rect(tableX, currentY, tableWidth, rowHeight, 'FD');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('Grand Total', tableX + 3, currentY + 8);
    pdf.text(invoiceData.grandTotal, tableX + col1Width + col2Width + col3Width - 3 - pdf.getTextWidth(invoiceData.grandTotal), currentY + 8);
    
    // Grand total borders
    pdf.line(tableX, currentY + rowHeight, tableX + tableWidth, currentY + rowHeight);
    pdf.line(tableX, currentY, tableX, currentY + rowHeight);
    pdf.line(tableX + col1Width, currentY, tableX + col1Width, currentY + rowHeight);
    pdf.line(tableX + col1Width + col2Width, currentY, tableX + col1Width + col2Width, currentY + rowHeight);
    pdf.line(tableX + tableWidth, currentY, tableX + tableWidth, currentY + rowHeight);
    
    currentY += rowHeight + 15;
    
    // Amount in words with better formatting
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Amount Chargeable (In Words):', margin + 5, currentY);
    
    currentY += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const wordsText = invoiceData.grandTotalInWords;
    const splitWords = pdf.splitTextToSize(wordsText, contentWidth - 10);
    pdf.text(splitWords, margin + 5, currentY);
    
    currentY += 8; /* Reduced spacing */
    
    // Additional information
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(invoiceData.rentDescription || `Rent for the month of ${invoiceData.rentMonth} '${invoiceData.rentYear}`, margin + 5, currentY);
    
    currentY += 8;
    pdf.text('Pan No.: AEZFS6432B', margin + 5, currentY);
    
    currentY += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text('HDFC Bank Account No.: S0200081328200', margin + 5, currentY);
    
    currentY += 6;
    pdf.text('IFSC Code: HDFC0000078', margin + 5, currentY);
    
    currentY += 12;
    
    // Declaration section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text('Declaration:', margin + 5, currentY);
    
    currentY += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const declarationText = '*TDS – Under section 194I should be deducted on gross bill value excluding service tax value (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)';
    const splitDeclaration = pdf.splitTextToSize(declarationText, contentWidth - 60);
    pdf.text(splitDeclaration, margin + 5, currentY);
    
    // Signature section with better positioning
    const signatureX = pageWidth - margin - 60;
    const signatureY = currentY + 15;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Customer\'s Seal and Signature For', signatureX, signatureY);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sahaya Warehousing Company', signatureX, signatureY + 4);
    
    // Add signature line after company name
    pdf.setLineWidth(0.3);
    pdf.line(signatureX, signatureY + 10, signatureX + 50, signatureY + 10);
    
    // Try to add the actual signature image below the line
    try {
      const signatureBase64 = await getSignatureBase64();
      if (signatureBase64) {
        // Add the actual signature image below the line
        pdf.addImage(signatureBase64, 'PNG', signatureX + 5, signatureY + 12, 40, 15);
      } else {
        throw new Error('Signature image not found');
      }
    } catch (error) {
      console.warn('Could not add signature image, using stylized text:', error);
      // Fallback - create a stylized signature text below the line
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Sahaya Warehousing', signatureX + 5, signatureY + 20);
      pdf.text('Company', signatureX + 15, signatureY + 24);
      pdf.setLineWidth(0.5);
      pdf.line(signatureX + 5, signatureY + 26, signatureX + 35, signatureY + 26);
      pdf.line(signatureX + 10, signatureY + 28, signatureX + 30, signatureY + 28);
    }
    
    // Convert PDF to buffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Generate HTML content for invoice
// Helper to get base64 signature for server-side HTML embedding
export const getSignatureBase64ForHTML = async (): Promise<string | null> => {
  return EMBEDDED_SIGNATURE_BASE64;
};

// Generate HTML content for invoice, optionally embedding signature as base64
export const generateInvoiceHTML = (
  invoiceData: InvoiceData,
  signatureDataUrl?: string | null
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <style>
          @page {
            margin: 20mm;
            size: A4;
          }
          
          body { 
            font-family: 'Arial', 'Helvetica', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            line-height: 1.4;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 30px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          .inner-border {
            border: 1px solid #666;
            padding: 20px;
            min-height: 90vh;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 8px;
            letter-spacing: 1px;
          }
          
          .company-address {
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
          }
          
          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            margin-top: 10px;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 40px;
          }
          
          .billing-info {
            flex: 1;
          }
          
          .company-info {
            flex: 1;
            text-align: right;
          }
          
          .billing-info h3,
          .company-info h3 {
            font-size: 12px;
            margin-bottom: 10px;
            font-weight: bold;
          }
          
          .billing-info p,
          .company-info p {
            margin: 4px 0;
            font-size: 11px;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            border: 2px solid #000;
          }
          
          .invoice-table th {
            background: #f0f0f0;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            border: 1px solid #000;
          }
          
          .invoice-table td {
            padding: 12px 8px;
            text-align: center;
            font-size: 11px;
            border: 1px solid #000;
          }
          
          .invoice-table tr:nth-child(even) {
            background: #fafafa;
          }
          
          .particulars {
            text-align: left !important;
            padding-left: 15px !important;
          }
          
          .amount {
            text-align: right !important;
            padding-right: 15px !important;
            font-weight: bold;
          }
          
          .total-row {
            background: #e0e0e0 !important;
            font-weight: bold;
          }
          
          .total-row td {
            border-top: 2px solid #000;
            font-size: 13px;
          }
          
          .amount-words {
            margin: 8px 0; /* Reduced margin to minimize gap */
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          
          .amount-words strong {
            font-weight: bold;
            color: #000;
          }
          
          .footer-info {
            margin: 30px 0;
            font-size: 11px;
            line-height: 1.6;
          }
          
          .footer-info p {
            margin: 6px 0;
          }
          
          .bank-details {
            font-weight: bold;
            color: #000;
          }
          
          .declaration {
            margin: 25px 0;
            padding: 15px;
            background: #f9f9f9;
            border-left: 4px solid #dc2626;
            font-size: 10px;
            line-height: 1.5;
          }
          
          .declaration h4 {
            margin: 0 0 10px 0;
            font-size: 11px;
            font-weight: bold;
          }
          
          .signature-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 40px;
            padding-top: 20px;
          }
          
          .signature-box {
            text-align: center;
            border: 1px solid #ccc;
            padding: 20px;
            width: 200px;
            background: #fafafa;
          }
          
          .signature-line {
            border-bottom: 1px solid #000;
            height: 60px;
            margin: 20px 0 10px 0;
            position: relative;
          }
          
          .signature-text {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
          }
          
          .company-signature {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 2px; /* Reduced margin to minimize gap */
          }
          
          @media print {
            body { 
              margin: 0;
              padding: 0;
            }
            .invoice-container {
              box-shadow: none;
              border: 2px solid #000;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="inner-border">
            <div class="header">
              <div class="company-name">SAHAYA WAREHOUSING COMPANY</div>
              <div class="company-address">
                Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008
              </div>
              <div class="invoice-title">TAX INVOICE</div>
            </div>
            
            <div class="invoice-details">
              <div class="billing-info">
                <h3>To,</h3>
                <p><strong>${invoiceData.recipientName},</strong></p>
                <p>${invoiceData.addressLine1}</p>
                <p>${invoiceData.addressLine2}</p>
                <p>${invoiceData.addressLine3}</p>
                <p><strong>GST NO: ${invoiceData.recipientGst}</strong></p>
              </div>
              
              <div class="company-info">
                <p>GST No.: 09AEZFS6432B1ZL</p>
                <p>PAN No.: AEZFS6432B</p>
                <p>HSN Code: 997212</p>
                <p><strong>Ref No: ${invoiceData.refNumber}</strong></p>
                <p><strong>Date: ${formatInvoiceDate(invoiceData.invoiceDate)}</strong></p>
              </div>
            </div>
            
            <table class="invoice-table">
              <thead>
                <tr>
                  <th style="width: 55%;">Particulars Area Sqft</th>
                  <th style="width: 20%;">Rate</th>
                  <th style="width: 25%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="particulars">Rented for ${invoiceData.rentedArea}</td>
                  <td>${invoiceData.rentRate}</td>
                  <td class="amount">${invoiceData.rentAmount}</td>
                </tr>
                <tr>
                  <td class="particulars">SGST</td>
                  <td>${invoiceData.sgstRate}%</td>
                  <td class="amount">${invoiceData.sgstAmount}</td>
                </tr>
                <tr>
                  <td class="particulars">CGST</td>
                  <td>${invoiceData.cgstRate}%</td>
                  <td class="amount">${invoiceData.cgstAmount}</td>
                </tr>
                <tr class="total-row">
                  <td class="particulars"><strong>Grand Total</strong></td>
                  <td></td>
                  <td class="amount"><strong>${invoiceData.grandTotal}</strong></td>
                </tr>
              </tbody>
            </table>
            
            <div class="amount-words">
              <p><strong>Amount Chargeable (In Words):</strong> <strong>${invoiceData.grandTotalInWords}</strong></p>
            </div>
            
            <div class="footer-info">
              <p>${invoiceData.rentDescription || `Rent for the month of ${invoiceData.rentMonth} '${invoiceData.rentYear}`}</p>
              <p>Pan No.: AEZFS6432B</p>
              <p class="bank-details">HDFC Bank Account No.: S0200081328200</p>
              <p class="bank-details">IFSC Code: HDFC0000078</p>
            </div>
            
            <div class="declaration">
              <h4>Declaration:</h4>
              <p>*TDS – Under section 194I should be deducted on gross bill value excluding service tax value (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)</p>
            </div>
            
            <div class="signature-section">
              <div class="signature-box">
                <p style="font-size: 11px; margin-bottom: 10px;">Customer's Seal and Signature For</p>
                <div class="company-signature">Sahaya Warehousing Company</div>
                <div class="signature-line">
                  <img src="${signatureDataUrl || '/sign.png'}" alt="Digital Signature" style="width: 80px; height: 40px; object-fit: contain; margin: 10px auto; display: block;" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Utility function to generate PDF from HTML content (for preview in browser)
export const generatePDF = async (invoiceData: InvoiceData): Promise<string> => {
  try {
    // Generate HTML for PDF preview
    const invoiceHTML = generateInvoiceHTML(invoiceData);
    
    // Create a blob URL for the HTML content
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('Error generating PDF preview:', error);
    throw new Error('Failed to generate PDF preview');
  }
};
