// Updated signature loading using public URL - works for both PDF and email
const getSignatureBase64 = async (): Promise<string | null> => {
  try {
    if (typeof window !== 'undefined') {
      return null; // Client-side, return null
    }

    // Get the base URL of your deployed app
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL 
      ? process.env.NEXTAUTH_URL
      : process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'https://billing-system-sahaya-warehousing.vercel.app';

    // Fetch the signature image directly from the public URL
    const signatureUrl = `${baseUrl}/sign.png`;
    console.log('Loading signature from public URL:', signatureUrl);
    
    const response = await fetch(signatureUrl);
    
    if (response.ok) {
      console.log('Successfully fetched signature from public URL');
      
      // Convert the response to buffer and then to base64
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = `data:image/png;base64,${buffer.toString('base64')}`;
      
      console.log('Signature converted to base64, length:', base64.length);
      return base64;
      
    } else {
      console.warn('Failed to fetch signature from public URL:', response.status, response.statusText);
      return null;
    }
    
  } catch (error) {
    console.warn('Could not load signature image from URL:', (error as Error).message);
    return null;
  }
};

// Create SVG fallback signature
function createSVGFallback(): string {
  const svgSignature = `
    <svg width="160" height="60" xmlns="http://www.w3.org/2000/svg">
      <style>
        .signature-text { 
          font-family: 'Brush Script MT', cursive, serif; 
          font-size: 18px; 
          fill: #000080; 
          font-weight: bold;
        }
        .underline { 
          stroke: #000080; 
          stroke-width: 2; 
        }
      </style>
      <text x="10" y="25" class="signature-text">Sahaya Warehousing</text>
      <text x="40" y="45" class="signature-text">Company</text>
      <line x1="10" y1="50" x2="140" y2="50" class="underline"/>
    </svg>
  `;
  
  const base64Svg = Buffer.from(svgSignature).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

// Unified signature loading for both PDF and email
export const getSignatureForEmailAndPDF = async (): Promise<string> => {
  try {
    console.log('Loading signature for email/PDF generation...');
    
    const signatureBase64 = await getSignatureBase64();
    
    if (signatureBase64) {
      console.log('✅ PNG signature loaded successfully');
      return signatureBase64;
    }
    
    // Fallback to SVG signature
    console.log('📝 Using SVG fallback signature');
    return createSVGFallback();
    
  } catch (error) {
    console.error('Failed to load signature, using SVG fallback:', (error as Error).message);
    return createSVGFallback();
  }
};

// Updated email generation function
export const generateInvoiceHTMLEmail = async (invoiceData: InvoiceData): Promise<string> => {
  try {
    console.log('Generating invoice HTML for email...');
    
    const signatureDataUrl = await getSignatureForEmailAndPDF();
    console.log('Signature loaded for email, type:', signatureDataUrl.startsWith('data:image/png') ? 'PNG' : 'SVG');
    
    const html = generateInvoiceHTML(invoiceData, signatureDataUrl);
    
    // Verify signature is embedded
    const signatureIndex = html.indexOf('data:image/');
    if (signatureIndex !== -1) {
      console.log('✅ Signature successfully embedded in email HTML');
    } else {
      console.warn('❌ No signature data found in generated HTML');
    }
    
    return html;
    
  } catch (error) {
    console.error('Error generating invoice HTML for email:', error);
    // Return HTML with fallback signature
    const fallbackSignature = createSVGFallback();
    return generateInvoiceHTML(invoiceData, fallbackSignature);
  }
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

// Generate PDF buffer for email attachment with integrated signature loading
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
    
    currentY += 8;
    
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
    
    // Use the unified signature loading function
    try {
      const signatureBase64 = await getSignatureForEmailAndPDF();
      
      if (signatureBase64 && signatureBase64.startsWith('data:image/png')) {
        // Add the actual PNG signature image
        pdf.addImage(signatureBase64, 'PNG', signatureX + 5, signatureY + 12, 40, 15);
        console.log('✅ PNG signature added to PDF');
      } else if (signatureBase64 && signatureBase64.startsWith('data:image/svg')) {
        // For SVG, we'll use text fallback in PDF since jsPDF doesn't handle SVG well
        console.log('📝 Using text signature in PDF (SVG fallback)');
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Sahaya Warehousing', signatureX + 5, signatureY + 20);
        pdf.text('Company', signatureX + 15, signatureY + 24);
        pdf.setLineWidth(0.5);
        pdf.line(signatureX + 5, signatureY + 26, signatureX + 35, signatureY + 26);
        pdf.line(signatureX + 10, signatureY + 28, signatureX + 30, signatureY + 28);
      } else {
        throw new Error('No valid signature loaded');
      }
    } catch (error) {
      console.warn('Could not add signature image to PDF, using stylized text:', (error as Error).message);
      // Fallback - create a stylized signature text
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

// Updated HTML generation with better signature handling
export const generateInvoiceHTML = (
  invoiceData: InvoiceData,
  signatureDataUrl?: string | null
): string => {
  console.log('Generating HTML with signature:', signatureDataUrl ? 'YES' : 'NO');
  
  // Determine signature content
  let signatureContent = '';
  
  if (signatureDataUrl && signatureDataUrl.startsWith('data:image/')) {
    // Use the embedded base64 image (PNG or SVG)
    const imageType = signatureDataUrl.startsWith('data:image/png') ? 'PNG' : 'SVG';
    console.log(`Using ${imageType} signature in HTML`);
    
    signatureContent = `
      <img 
        src="${signatureDataUrl}" 
        alt="Digital Signature" 
        style="
          width: 80px !important; 
          height: 40px !important; 
          object-fit: contain; 
          margin: 10px auto; 
          display: block;
          max-width: 80px;
          max-height: 40px;
        " 
        onerror="console.log('Signature image failed to load'); this.style.display='none';" 
      />`;
  } else {
    // Text fallback
    console.log('Using text fallback signature in HTML');
    signatureContent = `
      <div style="margin: 10px auto; text-align: center; font-family: cursive;">
        <div style="font-size: 16px; color: #000080; font-weight: bold; line-height: 1.2;">
          Sahaya Warehousing<br>Company
        </div>
        <div style="border-bottom: 2px solid #000080; width: 80px; margin: 5px auto;"></div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
        <style>
          @page {
            margin: 20mm;
            size: A4;
          }
          
          body { 
            font-family: 'Arial', 'Helvetica', sans-serif !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: #333 !important;
            line-height: 1.4 !important;
          }
          
          .invoice-container {
            max-width: 800px !important;
            margin: 0 auto !important;
            border: 2px solid #000 !important;
            padding: 30px !important;
            background: white !important;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          .inner-border {
            border: 1px solid #666 !important;
            padding: 20px !important;
            min-height: 90vh;
          }
          
          .header {
            text-align: center !important;
            margin-bottom: 30px !important;
            border-bottom: 2px solid #000 !important;
            padding-bottom: 20px !important;
          }
          
          .company-name {
            font-size: 24px !important;
            font-weight: bold !important;
            color: #dc2626 !important;
            margin-bottom: 8px !important;
            letter-spacing: 1px !important;
          }
          
          .company-address {
            font-size: 12px !important;
            color: #666 !important;
            margin-bottom: 15px !important;
          }
          
          .invoice-title {
            font-size: 18px !important;
            font-weight: bold !important;
            color: #000 !important;
            margin-top: 10px !important;
          }
          
          .invoice-details {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 30px !important;
            gap: 40px !important;
          }
          
          .billing-info {
            flex: 1 !important;
          }
          
          .company-info {
            flex: 1 !important;
            text-align: right !important;
          }
          
          .billing-info h3,
          .company-info h3 {
            font-size: 12px !important;
            margin-bottom: 10px !important;
            font-weight: bold !important;
          }
          
          .billing-info p,
          .company-info p {
            margin: 4px 0 !important;
            font-size: 11px !important;
          }
          
          .invoice-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 30px 0 !important;
            border: 2px solid #000 !important;
          }
          
          .invoice-table th {
            background: #f0f0f0 !important;
            padding: 12px 8px !important;
            text-align: center !important;
            font-weight: bold !important;
            font-size: 12px !important;
            border: 1px solid #000 !important;
          }
          
          .invoice-table td {
            padding: 12px 8px !important;
            text-align: center !important;
            font-size: 11px !important;
            border: 1px solid #000 !important;
          }
          
          .invoice-table tr:nth-child(even) {
            background: #fafafa !important;
          }
          
          .particulars {
            text-align: left !important;
            padding-left: 15px !important;
          }
          
          .amount {
            text-align: right !important;
            padding-right: 15px !important;
            font-weight: bold !important;
          }
          
          .total-row {
            background: #e0e0e0 !important;
            font-weight: bold !important;
          }
          
          .total-row td {
            border-top: 2px solid #000 !important;
            font-size: 13px !important;
          }
          
          .amount-words {
            margin: 8px 0 !important;
            padding: 15px !important;
            background: #f9f9f9 !important;
            border: 1px solid #ddd !important;
            border-radius: 4px !important;
          }
          
          .amount-words strong {
            font-weight: bold !important;
            color: #000 !important;
          }
          
          .footer-info {
            margin: 30px 0 !important;
            font-size: 11px !important;
            line-height: 1.6 !important;
          }
          
          .footer-info p {
            margin: 6px 0 !important;
          }
          
          .bank-details {
            font-weight: bold !important;
            color: #000 !important;
          }
          
          .declaration {
            margin: 25px 0 !important;
            padding: 15px !important;
            background: #f9f9f9 !important;
            border-left: 4px solid #dc2626 !important;
            font-size: 10px !important;
            line-height: 1.5 !important;
          }
          
          .declaration h4 {
            margin: 0 0 10px 0 !important;
            font-size: 11px !important;
            font-weight: bold !important;
          }
          
          .signature-section {
            display: flex !important;
            justify-content: flex-end !important;
            margin-top: 40px !important;
            padding-top: 20px !important;
          }
          
          .signature-box {
            text-align: center !important;
            border: 1px solid #ccc !important;
            padding: 20px !important;
            width: 200px !important;
            background: #fafafa !important;
          }
          
          .signature-line {
            border-bottom: 1px solid #000 !important;
            height: 60px !important;
            margin: 20px 0 10px 0 !important;
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .signature-text {
            font-size: 10px !important;
            color: #666 !important;
            margin-top: 5px !important;
          }
          
          .company-signature {
            font-weight: bold !important;
            font-size: 12px !important;
            margin-bottom: 2px !important;
          }
          
          .signature-line img {
            max-width: 80px !important;
            max-height: 40px !important;
            width: auto !important;
            height: auto !important;
          }
          
          @media print {
            body { 
              margin: 0 !important;
              padding: 0 !important;
            }
            .invoice-container {
              box-shadow: none !important;
              border: 2px solid #000 !important;
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
                  ${signatureContent}
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

// Debug function to test signature loading - call this in your email sending code
export const testSignatureLoading = async (): Promise<void> => {
  console.log('🔍 TESTING SIGNATURE LOADING...');
  console.log('Production URL: https://billing-system-sahaya-warehousing.vercel.app');
  
  try {
    const signature = await getSignatureForEmailAndPDF();
    
    console.log('✅ Signature loaded successfully');
    console.log('Type:', signature.startsWith('data:image/png') ? 'PNG' : signature.startsWith('data:image/svg') ? 'SVG' : 'Unknown');
    console.log('Length:', signature.length);
    console.log('First 50 chars:', signature.substring(0, 50));
    
    // Test if it's valid base64
    try {
      const base64Data = signature.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      console.log('✅ Valid base64 format, decoded size:', buffer.length, 'bytes');
    } catch {
      console.warn('❌ Invalid base64 format');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('🔍 TEST COMPLETE\n');
};