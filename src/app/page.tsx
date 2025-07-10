

'use client';

import { useState } from 'react';
import PdfOverlay from './components/PdfOverlay/PdfOverlay';
import { generatePDF, InvoiceData } from './utils/pdfGenerator';

export default function Home() {
  const [rentedArea, setRentedArea] = useState('26500');
  const [rentRate, setRentRate] = useState('18');
  const [sgstRate, setSgstRate] = useState('9');
  const [sgstAmount, setSgstAmount] = useState('42930');
  const [cgstRate, setCgstRate] = useState('9');
  const [cgstAmount, setCgstAmount] = useState('42930');
  
  // Calculate rent amount automatically
  const rentAmount = (parseInt(rentedArea || '0') * parseInt(rentRate || '0')).toString();
  
  // Calculate grand total automatically
  const grandTotal = (
    parseInt(rentAmount || '0') + 
    parseInt(sgstAmount || '0') + 
    parseInt(cgstAmount || '0')
  ).toString();

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
    
    if (num >= 10000000) { // Crore
      const crores = Math.floor(num / 10000000);
      const remainder = num % 10000000;
      return convertHundreds(crores).trim() + ' Crore ' + numberToWords(remainder);
    } else if (num >= 100000) { // Lakh
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      return convertHundreds(lakhs).trim() + ' Lakh ' + numberToWords(remainder);
    } else if (num >= 1000) { // Thousand
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      return convertHundreds(thousands).trim() + ' Thousand ' + numberToWords(remainder);
    } else {
      return convertHundreds(num).trim();
    }
  };

  // Convert grand total to words
  const grandTotalInWords = numberToWords(parseInt(grandTotal || '0')) + ' Only';
  
  // Recipient information states
  const [recipientName, setRecipientName] = useState('Rackup');
  const [addressLine1, setAddressLine1] = useState('Plot No 552, Chandani Warehouse');
  const [addressLine2, setAddressLine2] = useState('Village Parvar Poorab, Sarojini Nagar,');
  const [addressLine3, setAddressLine3] = useState('Lucknow, Uttar Pradesh 226008');
  const [recipientGst, setRecipientGst] = useState('09CVWPG8839A2Z0');
  
  // Invoice details states
  const [refNumber, setRefNumber] = useState('SWC/25-26/10');
  const [invoiceDate, setInvoiceDate] = useState('1 May 2025');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogField, setDialogField] = useState('');
  const [dialogValue, setDialogValue] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [isAddressDialog, setIsAddressDialog] = useState(false);
  const [addressDialogValues, setAddressDialogValues] = useState({
    line1: '',
    line2: '',
    line3: ''
  });
  const [isDateDialog, setIsDateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  
  // PDF overlay state
  const [isPdfOverlayOpen, setIsPdfOverlayOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  // Function to handle PDF conversion
  const handleConvertAndSend = async () => {
    try {
      const invoiceData: InvoiceData = {
        recipientName,
        addressLine1,
        addressLine2,
        addressLine3,
        recipientGst,
        refNumber,
        invoiceDate,
        rentedArea,
        rentRate,
        rentAmount,
        sgstRate,
        sgstAmount,
        cgstRate,
        cgstAmount,
        grandTotal,
        grandTotalInWords
      };

      const url = await generatePDF(invoiceData);
      setPdfUrl(url);
      setIsPdfOverlayOpen(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Make the function available globally so navbar can access it
  if (typeof window !== 'undefined') {
    (window as typeof window & { handleConvertAndSend: () => Promise<void> }).handleConvertAndSend = handleConvertAndSend;
  }

  const openDialog = (field: string, currentValue: string, title: string) => {
    setDialogField(field);
    setDialogValue(currentValue);
    setDialogTitle(title);
    setIsDialogOpen(true);
  };

  const openAddressDialog = () => {
    setAddressDialogValues({
      line1: addressLine1,
      line2: addressLine2,
      line3: addressLine3
    });
    setIsAddressDialog(true);
  };

  const openDateDialog = () => {
    // Convert current date to YYYY-MM-DD format for input
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
    setIsDateDialog(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const handleSave = () => {
    switch (dialogField) {
      case 'rentedArea':
        setRentedArea(dialogValue);
        break;
      case 'rentRate':
        setRentRate(dialogValue);
        break;
      case 'sgstRate':
        setSgstRate(dialogValue);
        break;
      case 'sgstAmount':
        setSgstAmount(dialogValue);
        break;
      case 'cgstRate':
        setCgstRate(dialogValue);
        break;
      case 'cgstAmount':
        setCgstAmount(dialogValue);
        break;
      case 'recipientName':
        setRecipientName(dialogValue);
        break;
      case 'recipientGst':
        setRecipientGst(dialogValue);
        break;
      case 'refNumber':
        setRefNumber(dialogValue);
        break;
    }
    setIsDialogOpen(false);
  };

  const handleAddressSave = () => {
    setAddressLine1(addressDialogValues.line1);
    setAddressLine2(addressDialogValues.line2);
    setAddressLine3(addressDialogValues.line3);
    setIsAddressDialog(false);
  };

  const handleDateSave = () => {
    setInvoiceDate(formatDate(selectedDate));
    setIsDateDialog(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setDialogValue('');
  };

  const handleAddressCancel = () => {
    setIsAddressDialog(false);
    setAddressDialogValues({
      line1: '',
      line2: '',
      line3: ''
    });
  };

  const handleDateCancel = () => {
    setIsDateDialog(false);
    setSelectedDate('');
  };

  const PencilIcon = () => (
    <svg className="w-3 h-3 text-gray-600 hover:text-blue-600 cursor-pointer ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 lg:p-6 w-full overflow-x-hidden">
       <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 bg-white text-black border-2 border-gray-300 shadow-lg w-full overflow-x-auto">
      <h1 className="text-2xl font-bold text-center text-red-600">
        SAHAYA WAREHOUSING COMPANY
      </h1>
      <p className="text-center text-sm">
        Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008
      </p>
      <h2 className="text-center font-semibold mt-2">TAX INVOICE</h2>

      <div className="flex justify-between text-sm mt-4">
        <div>
          <p>To,</p>
          <p className="flex items-center">
            {recipientName},
            <button onClick={() => openDialog('recipientName', recipientName, 'Edit Recipient Name')} aria-label="Edit recipient name">
              <PencilIcon />
            </button>
          </p>
          <p className="flex items-center">
            {addressLine1}
            <button onClick={() => openAddressDialog()} aria-label="Edit address">
              <PencilIcon />
            </button>
          </p>
          <p>{addressLine2}</p>
          <p>{addressLine3}</p>
          <p className="flex items-center">
            GST NO: {recipientGst}
            <button onClick={() => openDialog('recipientGst', recipientGst, 'Edit GST Number')} aria-label="Edit GST number">
              <PencilIcon />
            </button>
          </p>
        </div>
        <div className="text-right">
          <p>GST No.: 09AEZFS6432B1ZL</p>
          <p>PAN No.: AEZFS6432B</p>
          <p>HSN Code : 997212</p>
          <p className="flex items-center justify-end">
            Ref No {refNumber}
            <button onClick={() => openDialog('refNumber', refNumber, 'Edit Reference Number')} aria-label="Edit reference number">
              <PencilIcon />
            </button>
            <span className="mx-2"></span>
            Date: {invoiceDate}
            <button onClick={() => openDateDialog()} aria-label="Edit date">
              <PencilIcon />
            </button>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="min-w-full border border-black text-sm">
          <thead>
            <tr className="border-b border-black">
              <th className="p-2 border-r border-black">Particulars Area Sqft</th>
              <th className="p-2 border-r border-black">Rate</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black">
                <div className="flex items-center">
                  Rented for {rentedArea}
                  <button onClick={() => openDialog('rentedArea', rentedArea, 'Edit Rented Area')} aria-label="Edit rented area">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-2 border-r border-black">
                <div className="flex items-center justify-center">
                  {rentRate}
                  <button onClick={() => openDialog('rentRate', rentRate, 'Edit Rent Rate')} aria-label="Edit rent rate">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-2">
                <div className="flex items-center justify-center">
                  {rentAmount}
                </div>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black">SGST</td>
              <td className="p-2 border-r border-black">
                <div className="flex items-center justify-center">
                  {sgstRate}%
                  <button onClick={() => openDialog('sgstRate', sgstRate, 'Edit SGST Rate')} aria-label="Edit SGST rate">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-2">
                <div className="flex items-center justify-center">
                  {sgstAmount}
                  <button onClick={() => openDialog('sgstAmount', sgstAmount, 'Edit SGST Amount')} aria-label="Edit SGST amount">
                    <PencilIcon />
                  </button>
                </div>
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-2 border-r border-black">CGST</td>
              <td className="p-2 border-r border-black">
                <div className="flex items-center justify-center">
                  {cgstRate}%
                  <button onClick={() => openDialog('cgstRate', cgstRate, 'Edit CGST Rate')} aria-label="Edit CGST rate">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-2">
                <div className="flex items-center justify-center">
                  {cgstAmount}
                  <button onClick={() => openDialog('cgstAmount', cgstAmount, 'Edit CGST Amount')} aria-label="Edit CGST amount">
                    <PencilIcon />
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td className="p-2 border-r border-black font-semibold">Grand Total</td>
              <td className="p-2 border-r border-black"></td>
              <td className="p-2 font-semibold text-center">
                {grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm">
        <p>
          Amount Chargeable (In Words) : <strong>{grandTotalInWords}</strong>
        </p>
        <p>Rent for the month of May &#39;25</p>
        <p className="mt-2">Pan No. : AEZFS6432B</p>
        <p>
          <strong>HDFC Bank Account No.</strong> : S0200081328200
        </p>
        <p>
          <strong>IFSC Code</strong> : HDFC0000078
        </p>
        <p className="mt-4">
          Declaration :<br />
          *TDS – Under section 194I should be deducted on gross bill value excluding service tax value
          (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)
        </p>
       <div className="mt-6 flex flex-col items-end">
  <p>Customer’s Seal and Signature For</p>
  <p className="font-bold mt-2">Sahaya Warehousing Company</p>
  <p className="mt-1">_____________________</p>
</div>
      </div>

      {/* Dialog Box */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 relative">
            {/* Close button */}
            <button 
              onClick={handleCancel}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              aria-label="Close dialog"
            >
              ×
            </button>
            
            {/* Dialog content */}
            <h3 className="text-lg font-semibold mb-4">{dialogTitle}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Value:
              </label>
              <input
                type="text"
                value={dialogValue}
                onChange={(e) => setDialogValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter value"
                autoFocus
              />
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Dialog Box */}
      {isAddressDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 relative">
            {/* Close button */}
            <button 
              onClick={handleAddressCancel}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              aria-label="Close address dialog"
            >
              ×
            </button>
            
            {/* Dialog content */}
            <h3 className="text-lg font-semibold mb-4">Edit Address</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1:
              </label>
              <input
                type="text"
                value={addressDialogValues.line1}
                onChange={(e) => setAddressDialogValues({...addressDialogValues, line1: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address line 1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2:
              </label>
              <input
                type="text"
                value={addressDialogValues.line2}
                onChange={(e) => setAddressDialogValues({...addressDialogValues, line2: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address line 2"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 3:
              </label>
              <input
                type="text"
                value={addressDialogValues.line3}
                onChange={(e) => setAddressDialogValues({...addressDialogValues, line3: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address line 3"
              />
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddressCancel}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddressSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Dialog Box */}
      {isDateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4 relative">
            {/* Close button */}
            <button 
              onClick={handleDateCancel}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              aria-label="Close date dialog"
            >
              ×
            </button>
            
            {/* Dialog content */}
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select date"
              />
            </div>
            
            {/* Preview */}
            {selectedDate && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">Preview:</p>
                <p className="font-medium">{formatDate(selectedDate)}</p>
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDateCancel}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDateSave}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                disabled={!selectedDate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Overlay */}
      <PdfOverlay 
        isOpen={isPdfOverlayOpen}
        onClose={() => setIsPdfOverlayOpen(false)}
        pdfUrl={pdfUrl}
        invoiceData={{
          recipientName,
          addressLine1,
          addressLine2,
          addressLine3,
          recipientGst,
          refNumber,
          invoiceDate,
          rentedArea,
          rentRate,
          rentAmount,
          sgstRate,
          sgstAmount,
          cgstRate,
          cgstAmount,
          grandTotal,
          grandTotalInWords
        }}
      />
    </main>
    </div>
  );
}
