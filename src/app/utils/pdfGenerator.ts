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
    tempDiv.style.width = '800px'; // Custom width
    tempDiv.style.height = '1131px'; // Custom height
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '0';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '10px'; // Match HTML body font size
    tempDiv.style.lineHeight = '1.1'; // Match HTML body line height
    tempDiv.style.visibility = 'hidden'; // Ensure it's not visible
    document.body.appendChild(tempDiv);

    // Wait longer for images to load
    const images = tempDiv.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve(true);
          } else {
            // Set absolute URL for signature image
            if (img.src.includes('sign.png')) {
              img.src = 'http://localhost:3000/sign.png';
            }
            img.onload = () => resolve(true);
            img.onerror = () => {
              console.warn('Image failed to load, continuing without it');
              // Remove the failed image to prevent html2canvas issues
              img.style.display = 'none';
              resolve(true);
            };
            // Longer timeout for signature image
            setTimeout(() => {
              console.warn('Image load timeout, continuing without it');
              img.style.display = 'none';
              resolve(true);
            }, 8000);
          }
        });
      }));
    }

    // Wait for fonts and layout to stabilize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert HTML to canvas with custom dimensions
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true, // Allow cross-origin to handle local images
      backgroundColor: '#ffffff',
      width: 800, // Custom width
      height: 1131, // Custom height
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: true, // Re-enable for better text rendering
      imageTimeout: 15000, // Longer timeout
      logging: false, // Disable logging for cleaner output
      onclone: (clonedDoc) => {
        const clonedDiv = clonedDoc.querySelector('div');
        if (clonedDiv) {
          clonedDiv.style.width = '800px';
          clonedDiv.style.height = '1131px';
          clonedDiv.style.backgroundColor = 'white';
          clonedDiv.style.fontFamily = 'Arial, sans-serif';
          clonedDiv.style.fontSize = '10px';
          clonedDiv.style.lineHeight = '1.1';
          clonedDiv.style.color = 'black';
          clonedDiv.style.border = '2px solid #666';
        }
      }
    });

    // Remove temporary div
    document.body.removeChild(tempDiv);

    // Create PDF from canvas
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Use minimal margins to utilize full page
    const margin = 5; // Very small margin
    const renderWidth = pdfWidth - (margin * 2);
    const canvasAspectRatio = canvas.height / canvas.width;
    const renderHeight = renderWidth * canvasAspectRatio;
    
    // Always use full width and position at top with small margin
    const xOffset = margin;
    const yOffset = margin;
    
    // If content is taller than page, scale it to fit
    if (renderHeight > pdfHeight - (margin * 2)) {
      const maxHeight = pdfHeight - (margin * 2);
      const scaledWidth = maxHeight / canvasAspectRatio;
      const xCentered = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'PNG', xCentered, margin, scaledWidth, maxHeight);
    } else {
      // Use full width and center vertically if needed
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);
    }
    
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
    
  } catch (error) {
    console.error('HTML to canvas conversion failed:', error);
    
    // Generate a proper PDF with the same content but without canvas conversion
    return generateFallbackPDF(invoiceData);
  }
};

// Generate HTML content for invoice that matches the original format exactly
export const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
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
            padding: 0;
            color: black;
            background-color: white;
            line-height: 1.1;
            font-size: 10px;
            height: 1131px;
            width: 800px;
          }
          .invoice-container {
            width: 800px;
            height: 1131px;
            margin: 0;
            padding: 60px; /* Convert 20mm to pixels at 96 DPI */
            background: white;
            border: 2px solid #666;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .main-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
          }
          .header {
            text-align: center;
            margin-bottom: 45px; /* Convert 15mm to pixels */
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 9px; /* Convert 3mm to pixels */
          }
          .company-address {
            font-size: 10px;
            margin-bottom: 9px; /* Convert 3mm to pixels */
            opacity: 0.8;
          }
          .invoice-title {
            font-weight: bold;
            margin-top: 15px; /* Convert 5mm to pixels */
            font-size: 14px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin: 45px 0; /* Convert 15mm to pixels */
            font-size: 10px;
            align-items: flex-start;
          }
          .company-info {
            text-align: right;
            width: 49%;
          }
          .recipient-info {
            text-align: left;
            width: 49%;
          }
          .recipient-info p, .company-info p {
            margin: 0;
            line-height: 1.4;
            height: 15px;
            display: flex;
            align-items: center;
          }
          .recipient-info p {
            justify-content: flex-start;
          }
          .company-info p {
            justify-content: flex-end;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 45px 0 30px 0; /* Convert 15mm top, 10mm bottom to pixels */
            font-size: 10px;
            flex-grow: 1;
          }
          .invoice-table th,
          .invoice-table td {
            border: 1px solid black;
            padding: 6px 4px;
            text-align: left;
          }
          .invoice-table th {
            font-weight: bold;
            background-color: transparent;
            text-align: center;
            font-size: 11px;
          }
          .invoice-table .text-center {
            text-align: center;
          }
          .invoice-table .font-semibold {
            font-weight: bold;
          }
          .bottom-section {
            margin-top: auto;
          }
          .amount-words {
            margin: 30px 0 0 0; /* Convert 10mm to pixels */
            font-size: 10px;
            clear: both;
          }
          .amount-words p {
            margin: 15px 0; /* Convert 5mm to pixels */
            line-height: 1.2;
          }
          .footer-section {
            margin-top: 30px; /* Convert 10mm to pixels */
            font-size: 10px;
          }
          .footer-section p {
            margin: 15px 0; /* Convert 5mm to pixels */
          }
          .declaration {
            margin-top: 30px; /* Convert 10mm to pixels */
            padding: 15px; /* Convert 5mm to pixels */
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            font-size: 9px;
            line-height: 1.2;
          }
          .signature-section {
            margin-top: 30px; /* Convert 10mm to pixels */
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-size: 10px;
            height: auto;
            min-height: 60px; /* Convert 20mm to pixels */
            text-align: right;
            width: 100%;
          }
          .signature-section p {
            margin: 1px 0;
          }
          .signature-section .company-signature {
            font-weight: bold;
            margin-top: 5px;
            color: #dc2626;
          }
          .signature-line {
            margin-top: 1px;
          }
          .signature-img {
            margin-top: 2px;
            text-align: right;
            width: 100%;
          }
          .signature-img img {
            width: 80px;
            height: 40px;
            object-fit: contain;
            display: block;
            margin-left: auto;
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
          
          <div class="info-section">
            <div class="recipient-info">
              <p>To,</p>
              <p><strong>${invoiceData.recipientName}</strong>,</p>
              <p>${invoiceData.addressLine1}</p>
              <p>${invoiceData.addressLine2}</p>
              <p>${invoiceData.addressLine3}</p>
              <p><strong>GST NO:</strong> ${invoiceData.recipientGst}</p>
            </div>
            
            <div class="company-info">
              <p><strong>GST No.:</strong> 09AEZFS6432B1ZL</p>
              <p><strong>PAN No.:</strong> AEZFS6432B</p>
              <p><strong>HSN Code :</strong> 997212</p>
              <p><strong>Ref No</strong> ${invoiceData.refNumber}</p>
              <p><strong>Date:</strong> ${invoiceData.invoiceDate}</p>
              <p></p>
            </div>
          </div>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th style="width: 50%;">Particulars Area Sqft</th>
                <th style="width: 25%;">Rate</th>
                <th style="width: 25%;">Amount</th>
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
              <tr style="background-color: #f5f5f5;">
                <td class="font-semibold">Grand Total</td>
                <td></td>
                <td class="font-semibold text-center" style="font-size: 10px;">${invoiceData.grandTotal}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer-section">
            <div class="amount-words">
              <p><strong>Amount Chargeable (In Words) :</strong> <span style="color: #dc2626; font-weight: bold;">${invoiceData.grandTotalInWords}</span></p>
              <p>Rent for the month of May '25</p>
            </div>
            
            <p><strong>Pan No. :</strong> AEZFS6432B</p>
            <p><strong>HDFC Bank Account No. :</strong> S0200081328200</p>
            <p><strong>IFSC Code :</strong> HDFC0000078</p>
          </div>
          
          <div class="declaration">
            <strong>Declaration :</strong><br>
            *TDS – Under section 194I should be deducted on gross bill value excluding service tax value
            (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)
          </div>
          
          <div class="signature-section">
            <p>Customer's Seal and Signature For</p>
            <p class="company-signature">Sahaya Warehousing Company</p>
            <p class="signature-line">_____________________</p>
            <div class="signature-img">
              <img src="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'}/sign.png" alt="Company Signature" onError="this.style.display='none'" />
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

// Fallback PDF generation that matches the HTML layout exactly with A4 optimization
const generateFallbackPDF = async (invoiceData: InvoiceData): Promise<Buffer> => {
  try {
    const { jsPDF } = await getLibraries();
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add main border around the entire content - A4 optimized
    const borderMargin = 20; // Match HTML padding
    const contentWidth = pageWidth - (borderMargin * 2);
    const contentHeight = pageHeight - (borderMargin * 2);
    
    // Draw main border
    pdf.setLineWidth(0.8); // Thicker border to match HTML
    pdf.rect(borderMargin, borderMargin, contentWidth, contentHeight);
    
    // Content margins inside the border
    const leftX = borderMargin + 5;
    const contentStartY = borderMargin + 15;
    let yPos = contentStartY;
    
    // Header - Company Name (larger font for A4)
    pdf.setFontSize(18);
    pdf.setTextColor(220, 38, 38); // Red color
    pdf.setFont('helvetica', 'bold');
    pdf.text('SAHAYA WAREHOUSING COMPANY', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // Company Address
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100); // Gray color
    pdf.setFont('helvetica', 'normal');
    pdf.text('Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // TAX INVOICE
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0); // Black
    pdf.setFont('helvetica', 'bold');
    pdf.text('TAX INVOICE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Info Section - Two columns with A4 spacing
    const infoSectionY = yPos;
    
    // Recipient Info (Left) - A4 optimized spacing
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('To,', leftX, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${invoiceData.recipientName},`, leftX, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoiceData.addressLine1, leftX, yPos);
    yPos += 6;
    pdf.text(invoiceData.addressLine2, leftX, yPos);
    yPos += 6;
    pdf.text(invoiceData.addressLine3, leftX, yPos);
    yPos += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`GST NO: ${invoiceData.recipientGst}`, leftX, yPos);
    
    // Company Info (Right) - Aligned with left column
    let rightYPos = infoSectionY;
    const rightStartX = leftX + (contentWidth * 0.52);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GST No.: 09AEZFS6432B1ZL', rightStartX, rightYPos);
    rightYPos += 6;
    pdf.text('PAN No.: AEZFS6432B', rightStartX, rightYPos);
    rightYPos += 6;
    pdf.text('HSN Code : 997212', rightStartX, rightYPos);
    rightYPos += 6;
    pdf.text(`Ref No ${invoiceData.refNumber}`, rightStartX, rightYPos);
    rightYPos += 6;
    pdf.text(`Date: ${invoiceData.invoiceDate}`, rightStartX, rightYPos);
    rightYPos += 6; // Empty line to match HTML
    
    yPos += 20; // A4 optimized spacing after info section
    
    // Table with A4 optimized styling
    const tableStartY = yPos;
    const tableWidth = contentWidth - 10;
    const col1Width = tableWidth * 0.5;
    const col2Width = tableWidth * 0.25;
    const col3Width = tableWidth * 0.25;
    const rowHeight = 10; // Larger row height for A4
    
    // Table Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setLineWidth(0.3);
    
    // Header borders
    pdf.rect(leftX, tableStartY, col1Width, rowHeight);
    pdf.rect(leftX + col1Width, tableStartY, col2Width, rowHeight);
    pdf.rect(leftX + col1Width + col2Width, tableStartY, col3Width, rowHeight);
    
    // Header text
    pdf.text('Particulars Area Sqft', leftX + 3, tableStartY + 6.5);
    pdf.text('Rate', leftX + col1Width + (col2Width/2), tableStartY + 6.5, { align: 'center' });
    pdf.text('Amount', leftX + col1Width + col2Width + (col3Width/2), tableStartY + 6.5, { align: 'center' });
    
    let currentY = tableStartY + rowHeight;
    
    // Table Rows with A4 spacing
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    // Row 1
    pdf.rect(leftX, currentY, col1Width, rowHeight);
    pdf.rect(leftX + col1Width, currentY, col2Width, rowHeight);
    pdf.rect(leftX + col1Width + col2Width, currentY, col3Width, rowHeight);
    pdf.text(`Rented for ${invoiceData.rentedArea}`, leftX + 3, currentY + 6.5);
    pdf.text(invoiceData.rentRate, leftX + col1Width + (col2Width/2), currentY + 6.5, { align: 'center' });
    pdf.text(invoiceData.rentAmount, leftX + col1Width + col2Width + (col3Width/2), currentY + 6.5, { align: 'center' });
    currentY += rowHeight;
    
    // Row 2 - SGST
    pdf.rect(leftX, currentY, col1Width, rowHeight);
    pdf.rect(leftX + col1Width, currentY, col2Width, rowHeight);
    pdf.rect(leftX + col1Width + col2Width, currentY, col3Width, rowHeight);
    pdf.text('SGST', leftX + 3, currentY + 6.5);
    pdf.text(`${invoiceData.sgstRate}%`, leftX + col1Width + (col2Width/2), currentY + 6.5, { align: 'center' });
    pdf.text(invoiceData.sgstAmount, leftX + col1Width + col2Width + (col3Width/2), currentY + 6.5, { align: 'center' });
    currentY += rowHeight;
    
    // Row 3 - CGST
    pdf.rect(leftX, currentY, col1Width, rowHeight);
    pdf.rect(leftX + col1Width, currentY, col2Width, rowHeight);
    pdf.rect(leftX + col1Width + col2Width, currentY, col3Width, rowHeight);
    pdf.text('CGST', leftX + 3, currentY + 6.5);
    pdf.text(`${invoiceData.cgstRate}%`, leftX + col1Width + (col2Width/2), currentY + 6.5, { align: 'center' });
    pdf.text(invoiceData.cgstAmount, leftX + col1Width + col2Width + (col3Width/2), currentY + 6.5, { align: 'center' });
    currentY += rowHeight;
    
    // Row 4 - Grand Total (with gray background)
    pdf.setFillColor(245, 245, 245);
    pdf.rect(leftX, currentY, col1Width + col2Width + col3Width, rowHeight, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.text('Grand Total', leftX + 3, currentY + 6.5);
    pdf.setFontSize(10);
    pdf.text(invoiceData.grandTotal, leftX + col1Width + col2Width + (col3Width/2), currentY + 6.5, { align: 'center' });
    
    currentY += 15; // A4 optimized spacing after table
    
    // Amount in Words - A4 spacing
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Amount Chargeable (In Words) :', leftX, currentY);
    pdf.setTextColor(220, 38, 38); // Red color for amount
    pdf.text(invoiceData.grandTotalInWords, leftX + 70, currentY);
    pdf.setTextColor(0, 0, 0); // Back to black
    currentY += 8;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text('Rent for the month of May \'25', leftX, currentY);
    currentY += 12; // A4 spacing
    
    // Footer Info with A4 spacing
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pan No. :', leftX, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text('AEZFS6432B', leftX + 20, currentY);
    currentY += 6;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('HDFC Bank Account No. :', leftX, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text('S0200081328200', leftX + 50, currentY);
    currentY += 6;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('IFSC Code :', leftX, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text('HDFC0000078', leftX + 25, currentY);
    currentY += 12;
    
    // Declaration Box with A4 styling
    const declarationY = currentY;
    const declarationHeight = 18; // Larger for A4
    const declarationWidth = contentWidth - 10;
    
    pdf.setFillColor(249, 249, 249);
    pdf.rect(leftX, declarationY, declarationWidth, declarationHeight, 'FD');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Declaration :', leftX + 3, declarationY + 5);
    pdf.setFont('helvetica', 'normal');
    const declarationText = '*TDS – Under section 194I should be deducted on gross bill value excluding service tax value\n(refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)';
    const splitDeclaration = pdf.splitTextToSize(declarationText, declarationWidth - 6);
    pdf.text(splitDeclaration, leftX + 3, declarationY + 9);
    
    currentY += 22; // A4 spacing
    
    // Signature Section - properly aligned to the right with A4 spacing
    const signatureStartX = leftX + contentWidth - 90;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Customer\'s Seal and Signature For', signatureStartX, currentY);
    currentY += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38); // Red color
    pdf.text('Sahaya Warehousing Company', signatureStartX, currentY);
    currentY += 5;
    pdf.setTextColor(0, 0, 0); // Back to black
    pdf.text('_____________________', signatureStartX, currentY);
    currentY += 8;
    
    // Add signature area - A4 optimized
    pdf.setFillColor(255, 255, 255);
    pdf.rect(signatureStartX, currentY, 40, 10, 'FD');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('[Digital Signature]', signatureStartX + 20, currentY + 6, { align: 'center' });
    
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
    
  } catch (error) {
    console.error('Fallback PDF generation failed:', error);
    throw new Error('Failed to generate fallback PDF');
  }
};
