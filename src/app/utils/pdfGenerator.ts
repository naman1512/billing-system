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
}

// Import libraries dynamically to avoid SSR issues
const getLibraries = async () => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  return { jsPDF, html2canvas };
};

// Generate PDF buffer for email attachment using HTML to Canvas conversion
export const generatePDFBuffer = async (invoiceData: InvoiceData): Promise<Buffer> => {
  try {
    const { jsPDF, html2canvas } = await getLibraries();
    
    // Create a temporary div with the invoice HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateInvoiceHTML(invoiceData);
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px'; // Fixed width for consistent desktop rendering
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '0';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.4';
    document.body.appendChild(tempDiv);

    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Convert HTML to canvas with high quality settings
    const canvas = await html2canvas(tempDiv, {
      scale: 2.5, // Higher quality for better text rendering
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: 1200, // Approximate A4 height
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: true,
      onclone: (clonedDoc) => {
        // Ensure all styles are applied in the cloned document
        const clonedDiv = clonedDoc.querySelector('div');
        if (clonedDiv) {
          clonedDiv.style.width = '800px';
          clonedDiv.style.backgroundColor = 'white';
          clonedDiv.style.fontFamily = 'Arial, sans-serif';
          clonedDiv.style.fontSize = '14px';
          clonedDiv.style.lineHeight = '1.4';
        }
      }
    });

    // Remove temporary div
    document.body.removeChild(tempDiv);

    // Create PDF from canvas with A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate dimensions to fit A4 properly
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Use full width with minimal margins
    const margin = 10; // 10mm margin
    const renderWidth = pdfWidth - (margin * 2);
    const canvasAspectRatio = canvas.height / canvas.width;
    const renderHeight = renderWidth * canvasAspectRatio;
    
    // If content is too tall, fit to height instead
    if (renderHeight > pdfHeight - (margin * 2)) {
      const maxHeight = pdfHeight - (margin * 2);
      const newWidth = maxHeight / canvasAspectRatio;
      const xOffset = (pdfWidth - newWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, margin, newWidth, maxHeight);
    } else {
      const xOffset = margin;
      const yOffset = (pdfHeight - renderHeight) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
    }
    
    // Convert PDF to buffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback to basic jsPDF if html2canvas fails
    return generateBasicPDFBuffer(invoiceData);
  }
};

// Fallback PDF generation using basic jsPDF
const generateBasicPDFBuffer = async (invoiceData: InvoiceData): Promise<Buffer> => {
  const { jsPDF } = await getLibraries();
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;
  
  // Header
  pdf.setFontSize(18);
  pdf.setTextColor(220, 38, 38);
  pdf.text('SAHAYA WAREHOUSING COMPANY', 105, yPosition, { align: 'center' });
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008', 105, yPosition, { align: 'center' });
  yPosition += 10;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TAX INVOICE', 105, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Company info (right side) - comes first
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('GST No.: 09AEZFS6432B1ZL', 120, yPosition);
  yPosition += 6;
  pdf.text('PAN No.: AEZFS6432B', 120, yPosition);
  yPosition += 6;
  pdf.text('HSN Code : 997212', 120, yPosition);
  yPosition += 6;
  pdf.text(`Ref No ${invoiceData.refNumber}`, 120, yPosition);
  yPosition += 6;
  pdf.text(`Date: ${invoiceData.invoiceDate}`, 120, yPosition);
  
  yPosition += 15;
  
  // Recipient info (left side) - comes after company info
  pdf.text('To,', 20, yPosition);
  yPosition += 6;
  pdf.text(`${invoiceData.recipientName},`, 20, yPosition);
  yPosition += 6;
  pdf.text(invoiceData.addressLine1, 20, yPosition);
  yPosition += 6;
  pdf.text(invoiceData.addressLine2, 20, yPosition);
  yPosition += 6;
  pdf.text(invoiceData.addressLine3, 20, yPosition);
  yPosition += 6;
  pdf.text(`GST NO: ${invoiceData.recipientGst}`, 20, yPosition);
  
  yPosition += 20;
  
  // Table
  const tableY = yPosition;
  const col1Width = 85;
  const col2Width = 42.5;
  const col3Width = 42.5;
  const rowHeight = 10;
  
  // Table header
  pdf.setFont('helvetica', 'bold');
  pdf.rect(20, tableY, col1Width, rowHeight);
  pdf.rect(20 + col1Width, tableY, col2Width, rowHeight);
  pdf.rect(20 + col1Width + col2Width, tableY, col3Width, rowHeight);
  pdf.text('Particulars Area Sqft', 22, tableY + 6);
  pdf.text('Rate', 20 + col1Width + 2, tableY + 6);
  pdf.text('Amount', 20 + col1Width + col2Width + 2, tableY + 6);
  
  // Table rows
  pdf.setFont('helvetica', 'normal');
  let currentY = tableY + rowHeight;
  
  // Row 1
  pdf.rect(20, currentY, col1Width, rowHeight);
  pdf.rect(20 + col1Width, currentY, col2Width, rowHeight);
  pdf.rect(20 + col1Width + col2Width, currentY, col3Width, rowHeight);
  pdf.text(`Rented for ${invoiceData.rentedArea}`, 22, currentY + 6);
  pdf.text(invoiceData.rentRate, 20 + col1Width + 2, currentY + 6);
  pdf.text(invoiceData.rentAmount, 20 + col1Width + col2Width + 2, currentY + 6);
  
  // Row 2
  currentY += rowHeight;
  pdf.rect(20, currentY, col1Width, rowHeight);
  pdf.rect(20 + col1Width, currentY, col2Width, rowHeight);
  pdf.rect(20 + col1Width + col2Width, currentY, col3Width, rowHeight);
  pdf.text('SGST', 22, currentY + 6);
  pdf.text(`${invoiceData.sgstRate}%`, 20 + col1Width + 2, currentY + 6);
  pdf.text(invoiceData.sgstAmount, 20 + col1Width + col2Width + 2, currentY + 6);
  
  // Row 3
  currentY += rowHeight;
  pdf.rect(20, currentY, col1Width, rowHeight);
  pdf.rect(20 + col1Width, currentY, col2Width, rowHeight);
  pdf.rect(20 + col1Width + col2Width, currentY, col3Width, rowHeight);
  pdf.text('CGST', 22, currentY + 6);
  pdf.text(`${invoiceData.cgstRate}%`, 20 + col1Width + 2, currentY + 6);
  pdf.text(invoiceData.cgstAmount, 20 + col1Width + col2Width + 2, currentY + 6);
  
  // Row 4 - Grand Total
  currentY += rowHeight;
  pdf.rect(20, currentY, col1Width, rowHeight);
  pdf.rect(20 + col1Width, currentY, col2Width, rowHeight);
  pdf.rect(20 + col1Width + col2Width, currentY, col3Width, rowHeight);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Grand Total', 22, currentY + 6);
  pdf.text(invoiceData.grandTotal, 20 + col1Width + col2Width + 2, currentY + 6);
  
  // Amount in words
  currentY += 20;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Amount Chargeable (In Words) : ${invoiceData.grandTotalInWords}`, 20, currentY);
  
  // Footer
  currentY += 15;
  pdf.text('Rent for the month of May \'25', 20, currentY);
  currentY += 8;
  pdf.text('Pan No. : AEZFS6432B', 20, currentY);
  currentY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text('HDFC Bank Account No. : S0200081328200', 20, currentY);
  currentY += 8;
  pdf.text('IFSC Code : HDFC0000078', 20, currentY);
  
  // Declaration
  currentY += 12;
  pdf.setFont('helvetica', 'normal');
  pdf.text('Declaration :', 20, currentY);
  currentY += 6;
  const declarationText = '*TDS – Under section 194I should be deducted on gross bill value excluding service tax value (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)';
  const splitText = pdf.splitTextToSize(declarationText, 170);
  pdf.text(splitText, 20, currentY);
  
  // Signature
  currentY += 25;
  pdf.text('Customer\'s Seal and Signature For', 120, currentY);
  currentY += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sahaya Warehousing Company', 120, currentY);
  currentY += 8;
  pdf.text('_____________________', 120, currentY);
  
  const pdfArrayBuffer = pdf.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
};

// Generate HTML content for invoice that matches the original format exactly
const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 40px;
            color: black;
            background-color: white;
            line-height: 1.4;
            font-size: 14px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 32px;
            background: white;
            border: 2px solid #d1d5db;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 4px;
          }
          .company-address {
            font-size: 14px;
            margin-bottom: 8px;
          }
          .invoice-title {
            font-weight: bold;
            margin-top: 8px;
            font-size: 16px;
          }
          .company-info {
            text-align: right;
            margin: 20px 0;
            font-size: 14px;
          }
          .recipient-info {
            text-align: left;
            margin: 20px 0;
            font-size: 14px;
          }
          .recipient-info p, .company-info p {
            margin: 2px 0;
            line-height: 1.3;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            font-size: 14px;
          }
          .invoice-table th,
          .invoice-table td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          .invoice-table th {
            font-weight: bold;
            background-color: transparent;
          }
          .invoice-table .text-center {
            text-align: center;
          }
          .invoice-table .font-semibold {
            font-weight: bold;
          }
          .amount-words {
            margin: 24px 0;
            font-size: 14px;
          }
          .amount-words p {
            margin: 4px 0;
          }
          .footer-info {
            margin-top: 24px;
            font-size: 14px;
          }
          .footer-info p {
            margin: 4px 0;
          }
          .signature-section {
            margin-top: 24px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-size: 14px;
          }
          .signature-section p {
            margin: 4px 0;
          }
          .signature-section .company-signature {
            font-weight: bold;
          }
          .signature-line {
            margin-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">SAHAYA WAREHOUSING COMPANY</div>
            <div class="company-address">Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008</div>
            <div class="invoice-title">TAX INVOICE</div>
          </div>
          
          <div class="company-info">
            <p>GST No.: 09AEZFS6432B1ZL</p>
            <p>PAN No.: AEZFS6432B</p>
            <p>HSN Code : 997212</p>
            <p>Ref No ${invoiceData.refNumber} &nbsp;&nbsp;&nbsp; Date: ${invoiceData.invoiceDate}</p>
          </div>
          
          <div class="recipient-info">
            <p>To,</p>
            <p>${invoiceData.recipientName},</p>
            <p>${invoiceData.addressLine1}</p>
            <p>${invoiceData.addressLine2}</p>
            <p>${invoiceData.addressLine3}</p>
            <p>GST NO: ${invoiceData.recipientGst}</p>
          </div>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Particulars Area Sqft</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rented for ${invoiceData.rentedArea}</td>
                <td class="text-center">${invoiceData.rentRate}</td>
                <td class="text-center">${invoiceData.rentAmount}</td>
              </tr>
              <tr>
                <td>SGST</td>
                <td class="text-center">${invoiceData.sgstRate}%</td>
                <td class="text-center">${invoiceData.sgstAmount}</td>
              </tr>
              <tr>
                <td>CGST</td>
                <td class="text-center">${invoiceData.cgstRate}%</td>
                <td class="text-center">${invoiceData.cgstAmount}</td>
              </tr>
              <tr>
                <td class="font-semibold">Grand Total</td>
                <td></td>
                <td class="font-semibold text-center">${invoiceData.grandTotal}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="amount-words">
            <p><strong>Amount Chargeable (In Words) : ${invoiceData.grandTotalInWords}</strong></p>
            <p>Rent for the month of May '25</p>
          </div>
          
          <div class="footer-info">
            <p>Pan No. : AEZFS6432B</p>
            <p><strong>HDFC Bank Account No.</strong> : S0200081328200</p>
            <p><strong>IFSC Code</strong> : HDFC0000078</p>
            <p style="margin-top: 16px;">
              <strong>Declaration :</strong><br>
              *TDS – Under section 194I should be deducted on gross bill value excluding service tax value
              (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)
            </p>
          </div>
          
          <div class="signature-section">
            <p>Customer's Seal and Signature For</p>
            <p class="company-signature">Sahaya Warehousing Company</p>
            <p class="signature-line">_____________________</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Utility function to generate PDF from HTML content (for preview in browser)
export const generatePDF = async (invoiceData: InvoiceData): Promise<string> => {
  try {
    // Generate HTML for PDF preview with desktop formatting
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
