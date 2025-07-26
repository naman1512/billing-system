// Load signature image as base64 for server-side PDF generation
const getSignatureBase64 = async (): Promise<string | null> => {
  try {
    // Only run on server-side
    if (typeof window !== 'undefined') {
      return null;
    }
    // For server-side, we need to read the file from the public directory
    const fs = await import('fs');
    const path = await import('path');
    const signaturePath = path.join(process.cwd(), 'public', 'sign.png');
    console.log('[Signature Debug] Checking for signature at:', signaturePath);
    if (fs.existsSync(signaturePath)) {
      console.log('[Signature Debug] Signature file found.');
      const imageBuffer = fs.readFileSync(signaturePath);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } else {
      console.warn('[Signature Debug] Signature file NOT found at:', signaturePath);
    }
    return null;
  } catch (error) {
    console.warn('Could not load signature image:', error);
    return null;
  }
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
  try {
    if (typeof window !== 'undefined') return null;
    const path = await import('path');
    const fs = await import('fs/promises');
    // Try PNG first
    try {
      const pngPath = path.resolve(process.cwd(), 'public', 'sign.png');
      console.log('[Signature Debug] (HTML) Checking for PNG signature at:', pngPath);
      const pngBuffer = await fs.readFile(pngPath);
      console.log('[Signature Debug] (HTML) PNG signature file found.');
      return `data:image/png;base64,${pngBuffer.toString('base64')}`;
    } catch {
      console.warn('[Signature Debug] (HTML) PNG signature file NOT found.');
    }
    // Try JPEG fallback
    try {
      const jpgPath = path.resolve(process.cwd(), 'public', 'sign.jpg');
      console.log('[Signature Debug] (HTML) Checking for JPG signature at:', jpgPath);
      const jpgBuffer = await fs.readFile(jpgPath);
      console.log('[Signature Debug] (HTML) JPG signature file found.');
      return `data:image/jpeg;base64,${jpgBuffer.toString('base64')}`;
    } catch {
      console.warn('[Signature Debug] (HTML) JPG signature file NOT found.');
    }
    return null;
  } catch (err) {
    console.warn('[Signature Debug] (HTML) Error loading signature:', err);
    return null;
  }
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
