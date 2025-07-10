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

// Import jsPDF dynamically to avoid SSR issues
const getJsPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  return { jsPDF, html2canvas };
};

// Generate PDF buffer for email attachment
export const generatePDFBuffer = async (invoiceData: InvoiceData): Promise<Buffer> => {
  try {
    const { jsPDF } = await getJsPDF();
    
    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set font
    pdf.setFont('helvetica');
    
    // Add header
    pdf.setFontSize(20);
    pdf.setTextColor(220, 38, 38); // Red color
    pdf.text('SAHAYA WAREHOUSING COMPANY', 105, 20, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0); // Black color
    pdf.text('Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008', 105, 28, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TAX INVOICE', 105, 38, { align: 'center' });
    
    // Add recipient info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('To,', 20, 55);
    pdf.text(`${invoiceData.recipientName},`, 20, 63);
    pdf.text(invoiceData.addressLine1, 20, 71);
    pdf.text(invoiceData.addressLine2, 20, 79);
    pdf.text(invoiceData.addressLine3, 20, 87);
    pdf.text(`GST NO: ${invoiceData.recipientGst}`, 20, 95);
    
    // Add company info (right side)
    pdf.text('GST No.: 09AEZFS6432B1ZL', 120, 55);
    pdf.text('PAN No.: AEZFS6432B', 120, 63);
    pdf.text('HSN Code : 997212', 120, 71);
    pdf.text(`Ref No ${invoiceData.refNumber}     Date: ${invoiceData.invoiceDate}`, 120, 79);
    
    // Add table header
    const tableY = 110;
    pdf.setFont('helvetica', 'bold');
    pdf.rect(20, tableY, 50, 8);
    pdf.rect(70, tableY, 30, 8);
    pdf.rect(100, tableY, 30, 8);
    pdf.text('Particulars Area Sqft', 22, tableY + 5);
    pdf.text('Rate', 82, tableY + 5);
    pdf.text('Amount', 112, tableY + 5);
    
    // Add table rows
    pdf.setFont('helvetica', 'normal');
    let rowY = tableY + 8;
    
    // Row 1: Rented area
    pdf.rect(20, rowY, 50, 8);
    pdf.rect(70, rowY, 30, 8);
    pdf.rect(100, rowY, 30, 8);
    pdf.text(`Rented for ${invoiceData.rentedArea}`, 22, rowY + 5);
    pdf.text(invoiceData.rentRate, 82, rowY + 5);
    pdf.text(invoiceData.rentAmount, 112, rowY + 5);
    
    // Row 2: SGST
    rowY += 8;
    pdf.rect(20, rowY, 50, 8);
    pdf.rect(70, rowY, 30, 8);
    pdf.rect(100, rowY, 30, 8);
    pdf.text('SGST', 22, rowY + 5);
    pdf.text(`${invoiceData.sgstRate}%`, 82, rowY + 5);
    pdf.text(invoiceData.sgstAmount, 112, rowY + 5);
    
    // Row 3: CGST
    rowY += 8;
    pdf.rect(20, rowY, 50, 8);
    pdf.rect(70, rowY, 30, 8);
    pdf.rect(100, rowY, 30, 8);
    pdf.text('CGST', 22, rowY + 5);
    pdf.text(`${invoiceData.cgstRate}%`, 82, rowY + 5);
    pdf.text(invoiceData.cgstAmount, 112, rowY + 5);
    
    // Row 4: Grand Total
    rowY += 8;
    pdf.rect(20, rowY, 50, 8);
    pdf.rect(70, rowY, 30, 8);
    pdf.rect(100, rowY, 30, 8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Grand Total', 22, rowY + 5);
    pdf.text(invoiceData.grandTotal, 112, rowY + 5);
    
    // Add amount in words
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Amount Chargeable (In Words) : ${invoiceData.grandTotalInWords}`, 20, rowY + 20);
    
    // Add footer info
    pdf.text('Rent for the month of May \'25', 20, rowY + 30);
    pdf.text('Pan No. : AEZFS6432B', 20, rowY + 40);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HDFC Bank Account No. : S0200081328200', 20, rowY + 48);
    pdf.text('IFSC Code : HDFC0000078', 20, rowY + 56);
    
    // Add declaration
    pdf.setFont('helvetica', 'normal');
    pdf.text('Declaration :', 20, rowY + 68);
    pdf.text('*TDS – Under section 194I should be deducted on gross bill value excluding service tax value', 20, rowY + 76);
    pdf.text('(refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)', 20, rowY + 84);
    
    // Add signature section
    pdf.text('Customer\'s Seal and Signature For', 120, rowY + 100);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sahaya Warehousing Company', 120, rowY + 108);
    pdf.text('_____________________', 120, rowY + 116);
    
    // Convert PDF to buffer
    const pdfArrayBuffer = pdf.output('arraybuffer');
    return Buffer.from(pdfArrayBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Generate HTML content for invoice
const generateInvoiceHTML = (invoiceData: InvoiceData): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px;
            color: black;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #dc2626;
            margin-bottom: 5px;
          }
          .company-address { 
            font-size: 12px; 
            margin-bottom: 5px;
          }
          .invoice-title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-top: 10px;
          }
          .invoice-details { 
            display: flex; 
            justify-content: space-between; 
            margin: 30px 0;
          }
          .recipient-info { 
            flex: 1; 
            font-size: 12px;
          }
          .company-info { 
            flex: 1; 
            text-align: right; 
            font-size: 12px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          th, td { 
            border: 1px solid black; 
            padding: 8px; 
            text-align: left;
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          .amount-words { 
            margin: 20px 0; 
            font-size: 12px;
          }
          .footer-info { 
            margin-top: 30px; 
            font-size: 12px;
          }
          .signature { 
            margin-top: 50px; 
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SAHAYA WAREHOUSING COMPANY</div>
          <div class="company-address">Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008</div>
          <div class="invoice-title">TAX INVOICE</div>
        </div>
        
        <div class="invoice-details">
          <div class="recipient-info">
            <p>To,</p>
            <p>${invoiceData.recipientName},</p>
            <p>${invoiceData.addressLine1}</p>
            <p>${invoiceData.addressLine2}</p>
            <p>${invoiceData.addressLine3}</p>
            <p>GST NO: ${invoiceData.recipientGst}</p>
          </div>
          <div class="company-info">
            <p>GST No.: 09AEZFS6432B1ZL</p>
            <p>PAN No.: AEZFS6432B</p>
            <p>HSN Code : 997212</p>
            <p>Ref No ${invoiceData.refNumber} &nbsp;&nbsp;&nbsp; Date: ${invoiceData.invoiceDate}</p>
          </div>
        </div>
        
        <table>
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
              <td>${invoiceData.rentRate}</td>
              <td>${invoiceData.rentAmount}</td>
            </tr>
            <tr>
              <td>SGST</td>
              <td>${invoiceData.sgstRate}%</td>
              <td>${invoiceData.sgstAmount}</td>
            </tr>
            <tr>
              <td>CGST</td>
              <td>${invoiceData.cgstRate}%</td>
              <td>${invoiceData.cgstAmount}</td>
            </tr>
            <tr>
              <td><strong>Grand Total</strong></td>
              <td></td>
              <td><strong>${invoiceData.grandTotal}</strong></td>
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
          <p style="margin-top: 20px;">
            <strong>Declaration :</strong><br>
            *TDS – Under section 194I should be deducted on gross bill value excluding service tax value
            (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)
          </p>
        </div>
        
        <div class="signature">
          <p>Customer's Seal and Signature For</p>
          <p><strong>Sahaya Warehousing Company</strong></p>
          <p>_____________________</p>
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
