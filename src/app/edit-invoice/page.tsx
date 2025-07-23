'use client';

import { useState, useEffect, useRef } from 'react';
import { InvoiceData } from '../utils/pdfGenerator-new';
import toast from 'react-hot-toast';
import { getTemplateById } from '../utils/companyTemplates';

export default function EditInvoice() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize with empty state first
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    recipientName: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    recipientGst: '',
    refNumber: '',
    invoiceDate: '1 May 2025',
    rentedArea: '',
    rentRate: '',
    rentAmount: '',
    sgstRate: '',
    sgstAmount: '',
    cgstRate: '',
    cgstAmount: '',
    grandTotal: '',
    grandTotalInWords: '',
    rentMonth: 'May',
    rentYear: '25'
  });

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

  // Load data from localStorage when component mounts, or use template defaults
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('savedInvoiceData');
      const selectedCompanyId = localStorage.getItem('selectedCompanyId') || 'company1';
      
      console.log('Live Editor - Selected Company ID:', selectedCompanyId);
      console.log('Live Editor - Has saved data:', !!savedData);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Live Editor - Loading saved data:', parsedData.recipientName);
        setInvoiceData(parsedData);
      } else {
        // No saved data, check what company is selected in main page or default to company1
        const defaultTemplate = getTemplateById(selectedCompanyId)!;
        console.log('Live Editor - Using template:', defaultTemplate.recipientDetails.name);
        
        // Use template values with proper calculations
        const rentAmount = (parseInt(defaultTemplate.billDetails.rentedArea) * parseInt(defaultTemplate.billDetails.rentRate)).toString();
        const sgstAmount = Math.round((parseInt(rentAmount) * parseInt(defaultTemplate.billDetails.sgstRate)) / 100).toString();
        const cgstAmount = Math.round((parseInt(rentAmount) * parseInt(defaultTemplate.billDetails.cgstRate)) / 100).toString();
        const grandTotal = (parseInt(rentAmount) + parseInt(sgstAmount) + parseInt(cgstAmount)).toString();
        const grandTotalInWords = numberToWords(parseInt(grandTotal));
        
        setInvoiceData({
          recipientName: defaultTemplate.recipientDetails.name,
          addressLine1: defaultTemplate.recipientDetails.addressLine1,
          addressLine2: defaultTemplate.recipientDetails.addressLine2,
          addressLine3: defaultTemplate.recipientDetails.addressLine3,
          recipientGst: defaultTemplate.recipientDetails.gstNumber,
          refNumber: defaultTemplate.defaultRefNumberPrefix + '/10',
          invoiceDate: '1 May 2025',
          rentedArea: defaultTemplate.billDetails.rentedArea,
          rentRate: defaultTemplate.billDetails.rentRate,
          rentAmount,
          sgstRate: defaultTemplate.billDetails.sgstRate,
          sgstAmount,
          cgstRate: defaultTemplate.billDetails.cgstRate,
          cgstAmount,
          grandTotal,
          grandTotalInWords,
          rentMonth: 'May',
          rentYear: '25'
        });
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

  // Draw PDF on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (A4 proportions with extra height for signature)
    canvas.width = 595; // A4 width in points
    canvas.height = 900; // Increased height to accommodate signature

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
    
    // Draw the signature line first
    ctx.fillText('_____________________', canvas.width - 40, currentY);
    
    // Load and draw signature image AFTER the line
    const signImg = new Image();
    signImg.onload = () => {
      // Draw signature image below the line, right-aligned
      const imgWidth = 100;
      const imgHeight = 40;
      ctx.drawImage(signImg, canvas.width - 40 - imgWidth, currentY + 10, imgWidth, imgHeight);
    };
    signImg.src = '/sign.png';

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
      toast.success('Data saved successfully! You can now go to the Main Invoice page to see the updated data.', {
        icon: '💾',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Error saving data', {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleClearSavedData = () => {
    try {
      localStorage.removeItem('savedInvoiceData');
      toast.success('Saved data cleared! Reloading with fresh template data...', {
        icon: '🗑️',
        duration: 3000,
      });
      
      // Reload the page to get fresh template data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Error clearing data', {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const handleSendAndDownload = () => {
    try {
      // First save to localStorage
      localStorage.setItem('savedInvoiceData', JSON.stringify(invoiceData));
      
      // Generate and download PDF
      downloadPDF();
      
      toast.success('Data saved and PDF downloaded successfully!', {
        icon: '📄',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error in send and download:', error);
      toast.error('Error processing request', {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  const downloadPDF = () => {
    // Create a temporary canvas for PDF generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (A4 proportions with extra height for signature)
    canvas.width = 595; // A4 width in points
    canvas.height = 900; // Increased height to accommodate signature

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
    
    // Draw the signature line first
    ctx.fillText('_____________________', canvas.width - 40, currentY);
    
    // Load and draw signature image AFTER the line
    const signImg = new Image();
    signImg.onload = () => {
      // Draw signature image below the line, right-aligned
      const imgWidth = 100;
      const imgHeight = 40;
      ctx.drawImage(signImg, canvas.width - 40 - imgWidth, currentY + 10, imgWidth, imgHeight);
      
      // After image is loaded, trigger the download
      const link = document.createElement('a');
      link.download = `Invoice_${invoiceData.refNumber?.replace('/', '_') || 'generated'}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    signImg.src = '/sign.png';
    
    // Fallback behavior if image doesn't load - still trigger download
    signImg.onerror = () => {
      const link = document.createElement('a');
      link.download = `Invoice_${invoiceData.refNumber?.replace('/', '_') || 'generated'}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Live Invoice Editor</h1>
        
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-6 rounded-xl border border-gray-600 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Edit Invoice Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium mb-1 text-gray-300">Recipient Name</label>
                <input
                  id="recipientName"
                  type="text"
                  value={invoiceData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                  placeholder="Enter recipient name"
                />
              </div>

              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium mb-1 text-gray-300">Address Line 1</label>
                <input
                  id="addressLine1"
                  type="text"
                  value={invoiceData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                  placeholder="Enter address line 1"
                />
              </div>

              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium mb-1 text-gray-300">Address Line 2</label>
                <input
                  id="addressLine2"
                  type="text"
                  value={invoiceData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                  placeholder="Enter address line 2"
                />
              </div>

              <div>
                <label htmlFor="addressLine3" className="block text-sm font-medium mb-1 text-gray-300">Address Line 3</label>
                <input
                  id="addressLine3"
                  type="text"
                  value={invoiceData.addressLine3}
                  onChange={(e) => handleInputChange('addressLine3', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                  placeholder="Enter address line 3"
                />
              </div>

              <div>
                <label htmlFor="recipientGst" className="block text-sm font-medium mb-1 text-gray-300">Recipient GST</label>
                <input
                  id="recipientGst"
                  type="text"
                  value={invoiceData.recipientGst}
                  onChange={(e) => handleInputChange('recipientGst', e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                  placeholder="Enter GST number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="refNumber" className="block text-sm font-medium mb-1 text-gray-300">Reference Number</label>
                  <input
                    id="refNumber"
                    type="text"
                    value={invoiceData.refNumber}
                    onChange={(e) => handleInputChange('refNumber', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter reference number"
                  />
                </div>
                <div>
                  <label htmlFor="invoiceDate" className="block text-sm font-medium mb-1 text-gray-300">Invoice Date</label>
                  <input
                    id="invoiceDate"
                    type="text"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter invoice date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rentedArea" className="block text-sm font-medium mb-1 text-gray-300">Rented Area (Sqft)</label>
                  <input
                    id="rentedArea"
                    type="number"
                    value={invoiceData.rentedArea}
                    onChange={(e) => handleInputChange('rentedArea', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter area in sqft"
                  />
                </div>
                <div>
                  <label htmlFor="rentRate" className="block text-sm font-medium mb-1 text-gray-300">Rent Rate</label>
                  <input
                    id="rentRate"
                    type="number"
                    value={invoiceData.rentRate}
                    onChange={(e) => handleInputChange('rentRate', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter rent rate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sgstRate" className="block text-sm font-medium mb-1 text-gray-300">SGST Rate (%)</label>
                  <input
                    id="sgstRate"
                    type="number"
                    value={invoiceData.sgstRate}
                    onChange={(e) => handleInputChange('sgstRate', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter SGST rate"
                  />
                </div>
                <div>
                  <label htmlFor="cgstRate" className="block text-sm font-medium mb-1 text-gray-300">CGST Rate (%)</label>
                  <input
                    id="cgstRate"
                    type="number"
                    value={invoiceData.cgstRate}
                    onChange={(e) => handleInputChange('cgstRate', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="Enter CGST rate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rentMonth" className="block text-sm font-medium mb-1 text-gray-300">Rent Month</label>
                  <select
                    id="rentMonth"
                    value={invoiceData.rentMonth || 'May'}
                    onChange={(e) => handleInputChange('rentMonth', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                  >
                    <option value="January" className="bg-gray-800">January</option>
                    <option value="February" className="bg-gray-800">February</option>
                    <option value="March" className="bg-gray-800">March</option>
                    <option value="April" className="bg-gray-800">April</option>
                    <option value="May" className="bg-gray-800">May</option>
                    <option value="June" className="bg-gray-800">June</option>
                    <option value="July" className="bg-gray-800">July</option>
                    <option value="August" className="bg-gray-800">August</option>
                    <option value="September" className="bg-gray-800">September</option>
                    <option value="October" className="bg-gray-800">October</option>
                    <option value="November" className="bg-gray-800">November</option>
                    <option value="December" className="bg-gray-800">December</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="rentYear" className="block text-sm font-medium mb-1 text-gray-300">Rent Year (Last 2 digits)</label>
                  <input
                    id="rentYear"
                    type="text"
                    value={invoiceData.rentYear || '25'}
                    onChange={(e) => handleInputChange('rentYear', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
                    placeholder="e.g., 25"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <h3 className="font-medium mb-2 text-white">Calculated Values:</h3>
                <p className="text-gray-300">Rent Amount: <span className="text-green-400 font-medium">₹{invoiceData.rentAmount}</span></p>
                <p className="text-gray-300">SGST Amount: <span className="text-blue-400 font-medium">₹{invoiceData.sgstAmount}</span></p>
                <p className="text-gray-300">CGST Amount: <span className="text-blue-400 font-medium">₹{invoiceData.cgstAmount}</span></p>
                <p className="font-bold text-white">Grand Total: <span className="text-yellow-400">₹{invoiceData.grandTotal}</span></p>
                <p className="text-sm text-gray-400 mt-2">Amount in Words: <span className="text-gray-300">{invoiceData.grandTotalInWords}</span></p>
                <p className="text-sm text-gray-400">Rent for: <span className="text-gray-300">{invoiceData.rentMonth || 'May'} &apos;{invoiceData.rentYear || '25'}</span></p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleSaveToMain}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save</span>
                  </div>
                </button>

                <button
                  onClick={handleSendAndDownload}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Send & Download</span>
                  </div>
                </button>

                <button
                  onClick={handleClearSavedData}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Preview Section */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-6 rounded-xl border border-gray-600 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Live PDF Preview</h2>
            <div className="border border-gray-600 rounded-lg overflow-auto bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
  );
}
