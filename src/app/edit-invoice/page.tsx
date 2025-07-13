'use client';

import { useState, useEffect, useRef } from 'react';
import { InvoiceData } from '../utils/pdfGenerator-new';

export default function EditInvoice() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
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
    grandTotalInWords: 'Five Lakh Sixty Two Thousand Eight Hundred Sixty Only',
    rentMonth: 'May',
    rentYear: '25'
  });

  // Load data from localStorage when component mounts
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('savedInvoiceData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setInvoiceData(parsedData);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Calculate derived values
  useEffect(() => {
    const rentAmount = (parseInt(invoiceData.rentedArea || '0') * parseInt(invoiceData.rentRate || '0')).toString();
    const sgstAmount = Math.round((parseInt(rentAmount || '0') * parseInt(invoiceData.sgstRate || '0')) / 100).toString();
    const cgstAmount = Math.round((parseInt(rentAmount || '0') * parseInt(invoiceData.cgstRate || '0')) / 100).toString();
    const grandTotal = (
      parseInt(rentAmount || '0') + 
      parseInt(sgstAmount || '0') + 
      parseInt(cgstAmount || '0')
    ).toString();

    const grandTotalInWords = numberToWords(parseInt(grandTotal || '0'));

    setInvoiceData(prev => ({
      ...prev,
      rentAmount,
      sgstAmount,
      cgstAmount,
      grandTotal,
      grandTotalInWords
    }));
  }, [invoiceData.rentedArea, invoiceData.rentRate, invoiceData.sgstRate, invoiceData.cgstRate]);

  // Function to convert number to words
  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertHundreds = (n: number): string => {
      let result = '';
      
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        n = 0;
      }
      
      if (n > 0) {
        result += ones[n] + ' ';
      }
      
      return result;
    };
    
    let result = '';
    
    if (num >= 10000000) {
      result += convertHundreds(Math.floor(num / 10000000)) + 'Crore ';
      num %= 10000000;
    }
    
    if (num >= 100000) {
      result += convertHundreds(Math.floor(num / 100000)) + 'Lakh ';
      num %= 100000;
    }
    
    if (num >= 1000) {
      result += convertHundreds(Math.floor(num / 1000)) + 'Thousand ';
      num %= 1000;
    }
    
    if (num > 0) {
      result += convertHundreds(num);
    }
    
    return result.trim() + ' Only';
  };

  // Draw PDF on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (A4 proportions)
    canvas.width = 595; // A4 width in points
    canvas.height = 842; // A4 height in points

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set font
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';

    // Header
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SAHAYA WAREHOUSING COMPANY', canvas.width / 2, 40);

    ctx.fillStyle = 'black';
    ctx.font = '10px Arial';
    ctx.fillText('Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008', canvas.width / 2, 60);

    ctx.font = 'bold 12px Arial';
    ctx.fillText('TAX INVOICE', canvas.width / 2, 80);

    // Recipient info (left side)
    ctx.textAlign = 'left';
    ctx.font = '10px Arial';
    ctx.fillText('To,', 40, 110);
    ctx.fillText(`${invoiceData.recipientName},`, 40, 125);
    ctx.fillText(invoiceData.addressLine1, 40, 140);
    ctx.fillText(invoiceData.addressLine2, 40, 155);
    ctx.fillText(invoiceData.addressLine3, 40, 170);
    ctx.fillText(`GST NO: ${invoiceData.recipientGst}`, 40, 185);

    // Company info (right side)
    ctx.textAlign = 'right';
    ctx.fillText('GST No.: 09AEZFS6432B1ZL', canvas.width - 40, 110);
    ctx.fillText('PAN No.: AEZFS6432B', canvas.width - 40, 125);
    ctx.fillText('HSN Code : 997212', canvas.width - 40, 140);
    ctx.fillText(`Ref No ${invoiceData.refNumber}     Date: ${invoiceData.invoiceDate}`, canvas.width - 40, 155);

    // Table
    const tableX = 40;
    const tableY = 200;
    const tableWidth = canvas.width - 80;
    const rowHeight = 25;

    // Table header
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX, tableY, tableWidth * 0.6, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.6, tableY, tableWidth * 0.2, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.8, tableY, tableWidth * 0.2, rowHeight);

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(tableX, tableY, tableWidth * 0.6, rowHeight);
    ctx.fillRect(tableX + tableWidth * 0.6, tableY, tableWidth * 0.2, rowHeight);
    ctx.fillRect(tableX + tableWidth * 0.8, tableY, tableWidth * 0.2, rowHeight);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Particulars Area Sqft', tableX + 5, tableY + 15);
    ctx.textAlign = 'center';
    ctx.fillText('Rate', tableX + tableWidth * 0.7, tableY + 15);
    ctx.fillText('Amount', tableX + tableWidth * 0.9, tableY + 15);

    // Table rows
    ctx.font = '10px Arial';
    let currentY = tableY + rowHeight;

    // Row 1: Rented area
    ctx.strokeRect(tableX, currentY, tableWidth * 0.6, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.6, currentY, tableWidth * 0.2, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.8, currentY, tableWidth * 0.2, rowHeight);
    
    ctx.textAlign = 'left';
    ctx.fillText(`Rented for ${invoiceData.rentedArea}`, tableX + 5, currentY + 15);
    ctx.textAlign = 'center';
    ctx.fillText(invoiceData.rentRate, tableX + tableWidth * 0.7, currentY + 15);
    ctx.fillText(invoiceData.rentAmount, tableX + tableWidth * 0.9, currentY + 15);

    // Row 2: SGST
    currentY += rowHeight;
    ctx.strokeRect(tableX, currentY, tableWidth * 0.6, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.6, currentY, tableWidth * 0.2, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.8, currentY, tableWidth * 0.2, rowHeight);
    
    ctx.textAlign = 'left';
    ctx.fillText('SGST', tableX + 5, currentY + 15);
    ctx.textAlign = 'center';
    ctx.fillText(`${invoiceData.sgstRate}%`, tableX + tableWidth * 0.7, currentY + 15);
    ctx.fillText(invoiceData.sgstAmount, tableX + tableWidth * 0.9, currentY + 15);

    // Row 3: CGST
    currentY += rowHeight;
    ctx.strokeRect(tableX, currentY, tableWidth * 0.6, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.6, currentY, tableWidth * 0.2, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.8, currentY, tableWidth * 0.2, rowHeight);
    
    ctx.textAlign = 'left';
    ctx.fillText('CGST', tableX + 5, currentY + 15);
    ctx.textAlign = 'center';
    ctx.fillText(`${invoiceData.cgstRate}%`, tableX + tableWidth * 0.7, currentY + 15);
    ctx.fillText(invoiceData.cgstAmount, tableX + tableWidth * 0.9, currentY + 15);

    // Row 4: Grand Total
    currentY += rowHeight;
    ctx.strokeRect(tableX, currentY, tableWidth * 0.6, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.6, currentY, tableWidth * 0.2, rowHeight);
    ctx.strokeRect(tableX + tableWidth * 0.8, currentY, tableWidth * 0.2, rowHeight);
    
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Grand Total', tableX + 5, currentY + 15);
    ctx.textAlign = 'center';
    ctx.fillText(invoiceData.grandTotal, tableX + tableWidth * 0.9, currentY + 15);

    // Amount in words
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    currentY += 40;
    ctx.fillText(`Amount Chargeable (In Words) : ${invoiceData.grandTotalInWords}`, tableX, currentY);

    // Footer
    currentY += 20;
    ctx.fillText(`Rent for the month of ${invoiceData.rentMonth || 'May'} '${invoiceData.rentYear || '25'}`, tableX, currentY);
    currentY += 15;
    ctx.fillText('Pan No. : AEZFS6432B', tableX, currentY);
    currentY += 15;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('HDFC Bank Account No. : S0200081328200', tableX, currentY);
    currentY += 15;
    ctx.fillText('IFSC Code : HDFC0000078', tableX, currentY);

    // Declaration
    currentY += 25;
    ctx.font = '10px Arial';
    ctx.fillText('Declaration :', tableX, currentY);
    currentY += 15;
    ctx.fillText('*TDS – Under section 194I should be deducted on gross bill value excluding service tax value', tableX, currentY);
    currentY += 15;
    ctx.fillText('(refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)', tableX, currentY);

    // Signature
    currentY += 50;
    ctx.textAlign = 'right';
    ctx.fillText('Customer\'s Seal and Signature For', canvas.width - 40, currentY);
    currentY += 15;
    ctx.font = 'bold 10px Arial';
    ctx.fillText('Sahaya Warehousing Company', canvas.width - 40, currentY);
    currentY += 15;
    ctx.fillText('_____________________', canvas.width - 40, currentY);

  }, [invoiceData]);

  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveToMain = () => {
    try {
      // Save to localStorage so the main page can pick it up
      localStorage.setItem('savedInvoiceData', JSON.stringify(invoiceData));
      alert('Data saved successfully! You can now go to the Main Invoice page to see the updated data.');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Invoice Editor</h1>
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Invoice Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium mb-1">Recipient Name</label>
                <input
                  id="recipientName"
                  type="text"
                  value={invoiceData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter recipient name"
                />
              </div>

              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">Address Line 1</label>
                <input
                  id="addressLine1"
                  type="text"
                  value={invoiceData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address line 1"
                />
              </div>

              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">Address Line 2</label>
                <input
                  id="addressLine2"
                  type="text"
                  value={invoiceData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address line 2"
                />
              </div>

              <div>
                <label htmlFor="addressLine3" className="block text-sm font-medium mb-1">Address Line 3</label>
                <input
                  id="addressLine3"
                  type="text"
                  value={invoiceData.addressLine3}
                  onChange={(e) => handleInputChange('addressLine3', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address line 3"
                />
              </div>

              <div>
                <label htmlFor="recipientGst" className="block text-sm font-medium mb-1">Recipient GST</label>
                <input
                  id="recipientGst"
                  type="text"
                  value={invoiceData.recipientGst}
                  onChange={(e) => handleInputChange('recipientGst', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter GST number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="refNumber" className="block text-sm font-medium mb-1">Reference Number</label>
                  <input
                    id="refNumber"
                    type="text"
                    value={invoiceData.refNumber}
                    onChange={(e) => handleInputChange('refNumber', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reference number"
                  />
                </div>
                <div>
                  <label htmlFor="invoiceDate" className="block text-sm font-medium mb-1">Invoice Date</label>
                  <input
                    id="invoiceDate"
                    type="text"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter invoice date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rentedArea" className="block text-sm font-medium mb-1">Rented Area (Sqft)</label>
                  <input
                    id="rentedArea"
                    type="number"
                    value={invoiceData.rentedArea}
                    onChange={(e) => handleInputChange('rentedArea', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter area in sqft"
                  />
                </div>
                <div>
                  <label htmlFor="rentRate" className="block text-sm font-medium mb-1">Rent Rate</label>
                  <input
                    id="rentRate"
                    type="number"
                    value={invoiceData.rentRate}
                    onChange={(e) => handleInputChange('rentRate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter rent rate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sgstRate" className="block text-sm font-medium mb-1">SGST Rate (%)</label>
                  <input
                    id="sgstRate"
                    type="number"
                    value={invoiceData.sgstRate}
                    onChange={(e) => handleInputChange('sgstRate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter SGST rate"
                  />
                </div>
                <div>
                  <label htmlFor="cgstRate" className="block text-sm font-medium mb-1">CGST Rate (%)</label>
                  <input
                    id="cgstRate"
                    type="number"
                    value={invoiceData.cgstRate}
                    onChange={(e) => handleInputChange('cgstRate', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter CGST rate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rentMonth" className="block text-sm font-medium mb-1">Rent Month</label>
                  <select
                    id="rentMonth"
                    value={invoiceData.rentMonth || 'May'}
                    onChange={(e) => handleInputChange('rentMonth', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rentYear" className="block text-sm font-medium mb-1">Rent Year (Last 2 digits)</label>
                  <input
                    id="rentYear"
                    type="text"
                    value={invoiceData.rentYear || '25'}
                    onChange={(e) => handleInputChange('rentYear', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 25"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium mb-2">Calculated Values:</h3>
                <p>Rent Amount: ₹{invoiceData.rentAmount}</p>
                <p>SGST Amount: ₹{invoiceData.sgstAmount}</p>
                <p>CGST Amount: ₹{invoiceData.cgstAmount}</p>
                <p className="font-bold">Grand Total: ₹{invoiceData.grandTotal}</p>
                <p className="text-sm text-gray-600 mt-2">Amount in Words: {invoiceData.grandTotalInWords}</p>
                <p className="text-sm text-gray-600">Rent for: {invoiceData.rentMonth || 'May'} &apos;{invoiceData.rentYear || '25'}</p>
              </div>

              <button
                onClick={handleSaveToMain}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Save to Main Invoice
              </button>
            </div>
          </div>

          {/* Canvas Preview Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Live PDF Preview</h2>
            <div className="border border-gray-300 rounded overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[800px] object-contain block"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
  );
}
