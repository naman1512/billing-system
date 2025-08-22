'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PdfOverlay from '../components/PdfOverlay/PdfOverlay';
import { generatePDF, InvoiceData, formatInvoiceDate } from '../utils/pdfGenerator-new';
import { getTemplateById, getTemplateOptions, } from '../utils/companyTemplates';
import { companiesAPI, invoicesAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function CreateBill() {
  // Company template selection state
  const [selectedCompanyId, setSelectedCompanyId] = useState('company1');
  
  const [rentedArea, setRentedArea] = useState('');
  const [rentRate, setRentRate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [sgstRate, setSgstRate] = useState('');
  const [sgstAmount, setSgstAmount] = useState('');
  const [cgstRate, setCgstRate] = useState('');
  const [cgstAmount, setCgstAmount] = useState('');
  
  // Ref to track if toast has been shown to prevent duplicates
  const toastShownRef = useRef(false);
  
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
  const [recipientName, setRecipientName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressLine3, setAddressLine3] = useState('');
  const [recipientGst, setRecipientGst] = useState('');
  
  // Invoice details states
  const [refNumber, setRefNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]); // Store in YYYY-MM-DD format
  
  // Rent month/year states
  const [rentMonth, setRentMonth] = useState(new Date().toLocaleDateString('en-GB', { month: 'long' }));
  const [rentYear, setRentYear] = useState(new Date().getFullYear().toString().slice(-2));
  const [rentDescription, setRentDescription] = useState('');

  // Sync rent month/year with invoice date
  useEffect(() => {
    try {
      const date = new Date(invoiceDate);
      if (!isNaN(date.getTime())) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[date.getMonth()];
        const year = date.getFullYear().toString().slice(-2);
        setRentMonth(month);
        setRentYear(year);
      }
    } catch {
    }
  }, [invoiceDate]);
  
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
  const [isRentMonthDialog, setIsRentMonthDialog] = useState(false);
  const [tempRentMonth, setTempRentMonth] = useState('');
  const [tempRentYear, setTempRentYear] = useState('');
  const [tempRentDescription, setTempRentDescription] = useState('');
  
  // PDF overlay state
  const [isPdfOverlayOpen, setIsPdfOverlayOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    // Load saved company selection or default to company1
    const savedCompanyId = localStorage.getItem('selectedCompanyId') || 'company1';
    setSelectedCompanyId(savedCompanyId);
    
    // Get default template based on saved company selection
    const defaultTemplate = getTemplateById(savedCompanyId)!;
    
    try {
      const savedData = localStorage.getItem('savedInvoiceData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Migration: Update old hardcoded dates to current dates if they match the old values
        if (parsedData.invoiceDate && parsedData.invoiceDate.includes('May 2025')) {
          parsedData.invoiceDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        if (parsedData.rentMonth === 'May') {
          parsedData.rentMonth = new Date().toLocaleDateString('en-GB', { month: 'long' });
        }
        if (parsedData.rentYear === '25') {
          parsedData.rentYear = new Date().getFullYear().toString().slice(-2);
        }
        
        // Update all the state variables with saved data
        setRecipientName(parsedData.recipientName || defaultTemplate.recipientDetails.name);
        setAddressLine1(parsedData.addressLine1 || defaultTemplate.recipientDetails.addressLine1);
        setAddressLine2(parsedData.addressLine2 || defaultTemplate.recipientDetails.addressLine2);
        setAddressLine3(parsedData.addressLine3 || defaultTemplate.recipientDetails.addressLine3);
        setRecipientGst(parsedData.recipientGst || defaultTemplate.recipientDetails.gstNumber);
        setRefNumber(parsedData.refNumber || defaultTemplate.defaultRefNumberPrefix + '/10');
        setInvoiceDate(parsedData.invoiceDate || new Date().toISOString().split('T')[0]);
        setRentedArea(parsedData.rentedArea || defaultTemplate.billDetails.rentedArea);
        setRentRate(parsedData.rentRate || defaultTemplate.billDetails.rentRate);
        setRentAmount(parsedData.rentAmount || (parseInt(defaultTemplate.billDetails.rentedArea || '0') * parseInt(defaultTemplate.billDetails.rentRate || '0')).toString());
        setSgstRate(parsedData.sgstRate || defaultTemplate.billDetails.sgstRate);
        setCgstRate(parsedData.cgstRate || defaultTemplate.billDetails.cgstRate);
        
        // Update rent month/year if provided
        if (parsedData.rentMonth) setRentMonth(parsedData.rentMonth);
        if (parsedData.rentYear) setRentYear(parsedData.rentYear);
        if (parsedData.rentDescription) setRentDescription(parsedData.rentDescription);
        
        // Show a brief confirmation that data was loaded
        const hasChanges = 
          parsedData.recipientName !== defaultTemplate.recipientDetails.name ||
          parsedData.addressLine1 !== defaultTemplate.recipientDetails.addressLine1 ||
          parsedData.refNumber !== defaultTemplate.defaultRefNumberPrefix + '/10';
        
        if (hasChanges && !toastShownRef.current) {
          toastShownRef.current = true;
          setTimeout(() => {
            toast.success('Data loaded from Live Editor!', {
              icon: '📝',
              duration: 3000,
            });
          }, 500);
        }
      } else {
        // No saved data, use default template values
        setRecipientName(defaultTemplate.recipientDetails.name);
        setAddressLine1(defaultTemplate.recipientDetails.addressLine1);
        setAddressLine2(defaultTemplate.recipientDetails.addressLine2);
        setAddressLine3(defaultTemplate.recipientDetails.addressLine3);
        setRecipientGst(defaultTemplate.recipientDetails.gstNumber);
        setRefNumber(defaultTemplate.defaultRefNumberPrefix + '/10');
        setRentedArea(defaultTemplate.billDetails.rentedArea);
        setRentRate(defaultTemplate.billDetails.rentRate);
        setRentAmount((parseInt(defaultTemplate.billDetails.rentedArea || '0') * parseInt(defaultTemplate.billDetails.rentRate || '0')).toString());
        setSgstRate(defaultTemplate.billDetails.sgstRate);
        setCgstRate(defaultTemplate.billDetails.cgstRate);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Auto-calculate rent amount when area or rate changes
  useEffect(() => {
    // Parse values with parseFloat to handle decimal points if needed
    const area = parseFloat(rentedArea || '0');
    const rate = parseFloat(rentRate || '0');
    
    // Calculate with floating point precision
    const calculatedRent = area * rate;
    
    // Round to nearest integer
    const roundedRent = Math.round(calculatedRent);
    
    setRentAmount(roundedRent.toString());
  }, [rentedArea, rentRate]);

  // Auto-calculate SGST and CGST amounts based on rent amount and rates
  useEffect(() => {
    // Parse values with parseFloat for better decimal handling
    const rent = parseFloat(rentAmount || '0');
    const sgstRateValue = parseFloat(sgstRate || '0');
    const cgstRateValue = parseFloat(cgstRate || '0');
    
    // Calculate GST amounts with floating point precision
    const calculatedSgstAmount = Math.round((rent * sgstRateValue) / 100);
    const calculatedCgstAmount = Math.round((rent * cgstRateValue) / 100);
    
    setSgstAmount(calculatedSgstAmount.toString());
    setCgstAmount(calculatedCgstAmount.toString());
  }, [rentAmount, sgstRate, cgstRate]);

  // Function to handle PDF conversion
  const handleConvertAndSend = async () => {
    try {
      // Clear previous PDF URL to force refresh
      setPdfUrl('');
      
      // Add a small delay to ensure state update
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
        grandTotalInWords,
        rentMonth,
        rentYear,
        rentDescription
      };

      const url = await generatePDF(invoiceData);
      setPdfUrl(url);
      setIsPdfOverlayOpen(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', {
        icon: '❌',
        duration: 4000,
      });
    }
  };

  // Make the function available globally so navbar can access it
  if (typeof window !== 'undefined') {
    (window as typeof window & { handleConvertAndSend: () => Promise<void> }).handleConvertAndSend = handleConvertAndSend;
  }

  // Save to Directory function
  const handleSaveToDirectory = async () => {
    try {
      // Check if user is authenticated with simple localStorage check
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        toast.error('Please log in first to save invoices', {
          icon: '🔒',
          duration: 4000,
        });
        return;
      }

      // Validate required fields
      if (!recipientName || !rentedArea || !rentRate || !refNumber) {
        toast.error('Please fill in all required fields before saving', {
          icon: '⚠️',
          duration: 4000,
        });
        return;
      }

      toast.loading('Saving invoice to directory...', { id: 'saving' });

      // First, get all companies to check if one already exists
      const companiesResponse = await companiesAPI.getAll();
      const companiesData = companiesResponse as { companies: { name: string; id: string }[] };
      const companiesList = companiesData.companies;
      let company = companiesList.find((c) => c.name === recipientName);

      // If company doesn't exist, create it
      if (!company) {
        const template = getTemplateById(selectedCompanyId);
        if (!template) {
          toast.error('Please select a valid company template', {
            icon: '⚠️',
            duration: 4000,
          });
          return;
        }

        // Create company data
        const companyData = {
          name: recipientName,
          addressLine1: addressLine1,
          addressLine2: addressLine2,
          addressLine3: addressLine3,
          gstNumbers: [recipientGst],
          rentedArea: parseInt(rentedArea),
          rentRate: parseFloat(rentRate),
          sgstRate: parseFloat(sgstRate) || 9,
          cgstRate: parseFloat(cgstRate) || 9,
          refNumberPrefix: template.defaultRefNumberPrefix
        };

        const response = await companiesAPI.create(companyData);
        company = (response as { company: { id: string; name: string } }).company;
      }

      // Generate PDF
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
        grandTotalInWords,
        rentMonth,
        rentYear,
        rentDescription
      };

      const pdfUrl = await generatePDF(invoiceData);
      
      // Convert PDF URL to File object for upload
      const pdfResponse = await fetch(pdfUrl);
      const pdfBlob = await pdfResponse.blob();
      const pdfFile = new File([pdfBlob], `invoice-${refNumber}.pdf`, { type: 'application/pdf' });

      // Create invoice in database
      const invoicePayload = {
        companyId: company.id,
        refNumber: refNumber,
        amount: parseFloat(grandTotal),
        invoiceDate: invoiceDate, // Pass the invoice date from the form
        rentDescription: rentDescription || (rentMonth && rentYear ? `Rent for the month of ${rentMonth} '${rentYear}` : undefined),
        emailRecipient: '', // Can be filled later when sending email
        status: 'DRAFT', // Mark as draft since it's just saved, not sent
        invoiceData: invoiceData // Store complete invoice data for historical accuracy
      };

      await invoicesAPI.create(invoicePayload, pdfFile);

      toast.success('Invoice saved to directory successfully!', {
        id: 'saving',
        icon: '💾',
        duration: 4000,
      });

      // Show the PDF overlay to confirm the saved invoice
      setPdfUrl(pdfUrl);
      setIsPdfOverlayOpen(true);

      // Log success for debugging

    } catch (error: unknown) {
      console.error('Error saving to directory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save invoice to directory';
      toast.error(errorMessage, {
        id: 'saving',
        icon: '❌',
        duration: 4000,
      });
    }
  };

  // Make the save function available globally so navbar can access it
  if (typeof window !== 'undefined') {
    (window as typeof window & { 
      handleConvertAndSend: () => Promise<void>;
      handleSaveToDirectory: () => Promise<void>;
    }).handleSaveToDirectory = handleSaveToDirectory;
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

  const openRentMonthDialog = () => {
    setTempRentMonth(rentMonth);
    setTempRentYear(rentYear);
    setTempRentDescription(rentDescription);
    setIsRentMonthDialog(true);
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
      case 'rentAmount':
        setRentAmount(dialogValue);
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

  // Function to handle company template selection
  const handleCompanyTemplateChange = (companyId: string) => {
    const template = getTemplateById(companyId);
    if (template) {
      setSelectedCompanyId(companyId);
      
      // Save selected company to localStorage so live editor can use it
      localStorage.setItem('selectedCompanyId', companyId);
      
      // Update recipient details
      setRecipientName(template.recipientDetails.name);
      setAddressLine1(template.recipientDetails.addressLine1);
      setAddressLine2(template.recipientDetails.addressLine2);
      setAddressLine3(template.recipientDetails.addressLine3);
      setRecipientGst(template.recipientDetails.gstNumber);
      
      // Update bill details
      setRentedArea(template.billDetails.rentedArea);
      setRentRate(template.billDetails.rentRate);
      setRentAmount((parseInt(template.billDetails.rentedArea || '0') * parseInt(template.billDetails.rentRate || '0')).toString());
      setSgstRate(template.billDetails.sgstRate);
      setCgstRate(template.billDetails.cgstRate);
      
      // Update reference number with template prefix
      const refCount = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0');
      setRefNumber(`${template.defaultRefNumberPrefix}/${refCount}`);
      
      toast.success(`Switched to ${template.name}`, {
        icon: '🏢',
        duration: 2000,
      });
    }
  };

  const handleAddressSave = () => {
    setAddressLine1(addressDialogValues.line1);
    setAddressLine2(addressDialogValues.line2);
    setAddressLine3(addressDialogValues.line3);
    setIsAddressDialog(false);
  };

  const handleDateSave = () => {
    setInvoiceDate(selectedDate); // Store ISO format date
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

  const handleRentMonthSave = () => {
    setRentMonth(tempRentMonth);
    setRentYear(tempRentYear);
    setRentDescription(tempRentDescription);
    setIsRentMonthDialog(false);
  };

  const handleRentMonthCancel = () => {
    setIsRentMonthDialog(false);
    setTempRentMonth('');
    setTempRentYear('');
    setTempRentDescription('');
  };

  const PencilIcon = () => (
    <svg className="w-3 h-3 text-gray-400 hover:text-blue-400 cursor-pointer ml-1 transition-all duration-300 hover:scale-125 hover:rotate-12 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-2 sm:p-4 lg:p-6 w-full overflow-x-hidden animate-pulse-slow">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link href="/">
            <button className="group flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-blue-500">
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </button>
          </Link>
        </div>
        
        <main className={`${isPdfOverlayOpen ? 'w-full' : 'max-w-3xl mx-auto'} p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white border-2 border-gray-600 shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/20 hover:border-blue-500/50 hover:scale-[1.01] animate-fade-in-up backdrop-blur-sm rounded-xl`}>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">
              SAHAYA WAREHOUSING COMPANY
            </h1>
            <p className="text-sm opacity-80">
              Plot No 562 Village Natkur Bhandari Farm Sarojini Nagar Lucknow – 226008
            </p>
            <h2 className="font-semibold mt-2">TAX INVOICE</h2>
          </div>

          {/* Company Template Selection */}
          <div className="mt-6 mb-4 animate-fade-in-up">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Company Template:
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => handleCompanyTemplateChange(e.target.value)}
                title="Select Company Template"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-400"
              >
                {getTemplateOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Choose a company template to auto-fill recipient details and billing information
              </p>
            </div>
          </div>

      <div className="flex justify-between text-sm mt-4 animate-slide-in-left">
        <div className="space-y-1">
          <p className="hover:text-blue-400 transition-colors duration-300">To,</p>
          <p className="flex items-center hover:bg-gray-700/50 p-1 rounded transition-all duration-300 hover:scale-105">
            {recipientName},
            <button onClick={() => openDialog('recipientName', recipientName, 'Edit Recipient Name')} aria-label="Edit recipient name" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300">
              <PencilIcon />
            </button>
          </p>
          <div className="hover:bg-gray-700/50 p-1 rounded transition-all duration-300 hover:scale-105 group">
            <p className="flex items-center">
              {addressLine1}
              <button onClick={() => openAddressDialog()} aria-label="Edit address" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300">
                <PencilIcon />
              </button>
            </p>
            <p className="group-hover:text-gray-300 transition-colors duration-300">{addressLine2}</p>
            <p className="group-hover:text-gray-300 transition-colors duration-300">{addressLine3}</p>
          </div>
          <p className="flex items-center hover:bg-gray-700/50 p-1 rounded transition-all duration-300 hover:scale-105">
            GST NO: {recipientGst}
            <button onClick={() => openDialog('recipientGst', recipientGst, 'Edit GST Number')} aria-label="Edit GST number" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300">
              <PencilIcon />
            </button>
          </p>
        </div>
        <div className="text-right space-y-1 animate-slide-in-right">
          <p className="hover:text-green-400 transition-colors duration-300">GST No.: 09AEZFS6432B1ZL</p>
          <p className="hover:text-green-400 transition-colors duration-300">PAN No.: AEZFS6432B</p>
          <p className="hover:text-green-400 transition-colors duration-300">HSN Code : 997212</p>
          <p className="flex items-center justify-end hover:bg-gray-700/50 p-1 rounded transition-all duration-300 hover:scale-105">
            Ref No {refNumber}
            <button onClick={() => openDialog('refNumber', refNumber, 'Edit Reference Number')} aria-label="Edit reference number" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300">
              <PencilIcon />
            </button>
            <span className="mx-2"></span>
            Date: {formatInvoiceDate(invoiceDate)}
            <button onClick={() => openDateDialog()} aria-label="Edit date" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300">
              <PencilIcon />
            </button>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-6 animate-fade-in-up">
        <table className="min-w-full border border-gray-600 text-sm bg-gradient-to-br from-gray-700 via-gray-800 to-gray-700 rounded-lg overflow-hidden shadow-2xl">
          <thead>
            <tr className="border-b border-gray-600 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 transition-all duration-300">
              <th className="p-3 border-r border-gray-600 text-white hover:text-blue-300 transition-colors duration-300 hover:scale-105">Particulars Area Sqft</th>
              <th className="p-3 border-r border-gray-600 text-white hover:text-blue-300 transition-colors duration-300 hover:scale-105">Rate</th>
              <th className="p-3 text-white hover:text-blue-300 transition-colors duration-300 hover:scale-105">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-600 hover:bg-gradient-to-r hover:from-gray-650 hover:to-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <td className="p-3 border-r border-gray-600">
                <div className="flex items-center group">
                  <span className="group-hover:text-blue-300 transition-colors duration-300">Rented for {rentedArea}</span>
                  <button onClick={() => openDialog('rentedArea', rentedArea, 'Edit Rented Area')} aria-label="Edit rented area" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-3 border-r border-gray-600">
                <div className="flex items-center justify-center group">
                  <span className="group-hover:text-green-300 transition-colors duration-300">{rentRate}</span>
                  <button onClick={() => openDialog('rentRate', rentRate, 'Edit Rent Rate')} aria-label="Edit rent rate" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-center group">
                  <span className="group-hover:text-yellow-300 transition-colors duration-300 font-semibold">{rentAmount}</span>
                  <button onClick={() => openDialog('rentAmount', rentAmount, 'Edit Rent Amount')} aria-label="Edit rent amount" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12">
                    <PencilIcon />
                  </button>
                </div>
              </td>
            </tr>
            <tr className="border-b border-gray-600 hover:bg-gradient-to-r hover:from-gray-650 hover:to-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <td className="p-3 border-r border-gray-600 hover:text-blue-300 transition-colors duration-300">SGST</td>
              <td className="p-3 border-r border-gray-600">
                <div className="flex items-center justify-center group">
                  <span className="group-hover:text-green-300 transition-colors duration-300">{sgstRate}%</span>
                  <button onClick={() => openDialog('sgstRate', sgstRate, 'Edit SGST Rate')} aria-label="Edit SGST rate" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-center group">
                  <span className="group-hover:text-yellow-300 transition-colors duration-300 font-semibold">{sgstAmount}</span>
                  <button onClick={() => openDialog('sgstAmount', sgstAmount, 'Edit SGST Amount')} aria-label="Edit SGST amount" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12">
                    <PencilIcon />
                  </button>
                </div>
              </td>
            </tr>
            <tr className="border-b border-gray-600 hover:bg-gradient-to-r hover:from-gray-650 hover:to-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <td className="p-3 border-r border-gray-600 hover:text-blue-300 transition-colors duration-300">CGST</td>
              <td className="p-3 border-r border-gray-600">
                <div className="flex items-center justify-center group">
                  <span className="group-hover:text-green-300 transition-colors duration-300">{cgstRate}%</span>
                  <button onClick={() => openDialog('cgstRate', cgstRate, 'Edit CGST Rate')} aria-label="Edit CGST rate" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12">
                    <PencilIcon />
                  </button>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-center group">
                  <span className="group-hover:text-yellow-300 transition-colors duration-300 font-semibold">{cgstAmount}</span>
                  <button onClick={() => openDialog('cgstAmount', cgstAmount, 'Edit CGST Amount')} aria-label="Edit CGST amount" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12">
                    <PencilIcon />
                  </button>
                </div>
              </td>
            </tr>
            <tr className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
              <td className="p-3 border-r border-gray-600 font-semibold hover:text-blue-300 transition-colors duration-300">Grand Total</td>
              <td className="p-3 border-r border-gray-600"></td>
              <td className="p-3 font-bold text-center text-lg hover:text-yellow-300 transition-all duration-300 hover:scale-110">
                {grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm space-y-2 animate-fade-in-up">
        <p className="hover:text-blue-300 transition-colors duration-300 hover:scale-105 transform">
          Amount Chargeable (In Words) : <strong className="text-yellow-300">{grandTotalInWords}</strong>
        </p>
        <p className="flex items-center hover:text-green-300 transition-colors duration-300">
          <span>{rentDescription || `Rent for the month of ${rentMonth} '${rentYear}`}</span>
          <button onClick={() => openRentMonthDialog()} aria-label="Edit rent description" className="hover:bg-blue-500/20 p-1 rounded-full transition-all duration-300 hover:rotate-12 ml-1">
            <PencilIcon />
          </button>
        </p>
        <p className="hover:text-green-400 transition-colors duration-300 mt-2">Pan No. : AEZFS6432B</p>
        <p className="hover:text-blue-400 transition-colors duration-300">
          <strong>HDFC Bank Account No.</strong> : S0200081328200
        </p>
        <p className="hover:text-blue-400 transition-colors duration-300">
          <strong>IFSC Code</strong> : HDFC0000078
        </p>
        <p className="mt-4 hover:text-yellow-300 transition-colors duration-300 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 hover:border-yellow-500/50 hover:bg-gray-700/50">
          Declaration :<br />
          *TDS – Under section 194I should be deducted on gross bill value excluding service tax value
          (refer circular no. 1/2014, dated 13.01.2014 of income tax act 1961)
        </p>
       <div className="mt-6 flex flex-col items-end space-y-2 p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg border border-gray-600/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg animate-slide-in-right">
  <p className="hover:text-blue-300 transition-colors duration-300">Customer&#39;s Seal and Signature For</p>
  <p className="font-bold mt-2 hover:text-red-400 transition-colors duration-300 hover:scale-105">Sahaya Warehousing Company</p>
  <p className="mt-1 hover:text-gray-300 transition-colors duration-300">_____________________</p>
  <div className="flex justify-end mt-2 hover:scale-105 transition-transform duration-300">
    <Image 
      src="/sign.png" 
      alt="Company Signature" 
      width={150} 
      height={75}
      className="object-contain hover:drop-shadow-lg transition-all duration-300"
    />
  </div>
</div>
      </div>

      {/* Dialog Box */}
      {isDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-6 w-96 max-w-md mx-4 relative border border-gray-600 shadow-2xl transform transition-all duration-500 scale-100 animate-slide-up hover:shadow-blue-500/20">
            {/* Close button */}
            <button 
              onClick={handleCancel}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl transition-all duration-300 hover:scale-125 hover:rotate-90 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center"
              aria-label="Close dialog"
            >
              ×
            </button>
            
            {/* Dialog content */}
            <h3 className="text-lg font-semibold mb-4 text-white hover:text-blue-300 transition-colors duration-300">{dialogTitle}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-blue-300 transition-colors duration-300">
                Enter Value:
              </label>
              <input
                type="text"
                value={dialogValue}
                onChange={(e) => setDialogValue(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-blue-500/30 focus:scale-105"
                placeholder="Enter value"
                autoFocus
              />
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-3 text-gray-300 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-300 border border-gray-600 hover:border-gray-500 hover:scale-105 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-blue-500/30"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Dialog Box */}
      {isAddressDialog && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-6 w-96 max-w-md mx-4 relative border border-gray-600 shadow-2xl transform transition-all duration-500 scale-100 animate-slide-up hover:shadow-purple-500/20">
            {/* Close button */}
            <button 
              onClick={handleAddressCancel}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl transition-all duration-300 hover:scale-125 hover:rotate-90 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center"
              aria-label="Close address dialog"
            >
              ×
            </button>
            
            {/* Dialog content */}
            <h3 className="text-lg font-semibold mb-4 text-white hover:text-purple-300 transition-colors duration-300">Edit Address</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-purple-300 transition-colors duration-300">
                Address Line 1:
              </label>
              <input
                type="text"
                value={addressDialogValues.line1}
                onChange={(e) => setAddressDialogValues({...addressDialogValues, line1: e.target.value})}
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-purple-500/30 focus:scale-105"
                placeholder="Enter address line 1"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-purple-300 transition-colors duration-300">
                Address Line 2:
              </label>
              <input
                type="text"
                value={addressDialogValues.line2}
                onChange={(e) => setAddressDialogValues({...addressDialogValues, line2: e.target.value})}
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-purple-500/30 focus:scale-105"
                placeholder="Enter address line 2"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-purple-300 transition-colors duration-300">
                Address Line 3:
              </label>
              <input
                type="text"
                value={addressDialogValues.line3}
                onChange={(e) => setAddressDialogValues({...addressDialogValues, line3: e.target.value})}
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-purple-500/30 focus:scale-105"
                placeholder="Enter address line 3"
              />
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleAddressCancel}
                className="px-6 py-3 text-gray-300 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-300 border border-gray-600 hover:border-gray-500 hover:scale-105 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddressSave}
                className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-purple-500/30"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Dialog Box */}
      {isDateDialog && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-6 w-96 max-w-md mx-4 relative border border-gray-600 shadow-2xl transform transition-all duration-500 scale-100 animate-slide-up hover:shadow-green-500/20">
            {/* Close button */}
            <button 
              onClick={handleDateCancel}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-400 text-2xl transition-all duration-300 hover:scale-125 hover:rotate-90 hover:bg-red-500/20 rounded-full w-8 h-8 flex items-center justify-center"
              aria-label="Close date dialog"
            >
              ×
            </button>
            
            {/* Dialog content */}
            <h3 className="text-lg font-semibold mb-4 text-white hover:text-green-300 transition-colors duration-300">Select Date</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-green-300 transition-colors duration-300">
                Choose Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-green-500/30 focus:scale-105"
                aria-label="Select date"
              />
            </div>
            
            {/* Preview */}
            {selectedDate && (
              <div className="mb-4 p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600 hover:border-green-500/50 transition-all duration-300 hover:bg-gradient-to-r hover:from-green-900/20 hover:to-gray-700/50">
                <p className="text-sm text-gray-300 hover:text-green-300 transition-colors duration-300">Preview:</p>
                <p className="font-medium text-white hover:text-green-200 transition-colors duration-300">{formatDate(selectedDate)}</p>
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDateCancel}
                className="px-6 py-3 text-gray-300 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-300 border border-gray-600 hover:border-gray-500 hover:scale-105 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDateSave}
                className="px-6 py-3 text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:from-green-500 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!selectedDate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rent Month/Year Dialog */}
      {isRentMonthDialog && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-600 shadow-2xl transform transition-all duration-500 scale-100 animate-slide-up hover:shadow-yellow-500/20">
            <h3 className="text-lg font-semibold mb-4 text-white hover:text-yellow-300 transition-colors duration-300">Edit Rent Description</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-yellow-300 transition-colors duration-300">
                Month
              </label>
              <select
                value={tempRentMonth}
                onChange={(e) => setTempRentMonth(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-yellow-500/30 focus:scale-105 [&>option]:bg-gray-800 [&>option]:text-white [&>option]:border-gray-600"
                aria-label="Select month"
              >
                <option value="" className="bg-gray-800 text-gray-300">Select Month</option>
                <option value="January" className="bg-gray-800 text-white">January</option>
                <option value="February" className="bg-gray-800 text-white">February</option>
                <option value="March" className="bg-gray-800 text-white">March</option>
                <option value="April" className="bg-gray-800 text-white">April</option>
                <option value="May" className="bg-gray-800 text-white">May</option>
                <option value="June" className="bg-gray-800 text-white">June</option>
                <option value="July" className="bg-gray-800 text-white">July</option>
                <option value="August" className="bg-gray-800 text-white">August</option>
                <option value="September" className="bg-gray-800 text-white">September</option>
                <option value="October" className="bg-gray-800 text-white">October</option>
                <option value="November" className="bg-gray-800 text-white">November</option>
                <option value="December" className="bg-gray-800 text-white">December</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-yellow-300 transition-colors duration-300">
                Year (Last 2 digits)
              </label>
              <input
                type="text"
                value={tempRentYear}
                onChange={(e) => setTempRentYear(e.target.value)}
                placeholder="e.g., 25"
                maxLength={2}
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-yellow-500/30 focus:scale-105"
                aria-label="Enter year"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 hover:text-yellow-300 transition-colors duration-300">
                Custom Description (Optional - for partial billing like &quot;for 15 days&quot;)
              </label>
              <input
                type="text"
                value={tempRentDescription}
                onChange={(e) => setTempRentDescription(e.target.value)}
                placeholder="e.g., Rent for the month of June '25 for 15 days"
                className="w-full px-4 py-3 border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:shadow-lg focus:shadow-yellow-500/30 focus:scale-105"
                aria-label="Enter custom rent description"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to use default format: &quot;Rent for the month of [Month] &#39;[Year]&quot;</p>
            </div>
            
            {/* Preview */}
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg border border-gray-600 hover:border-yellow-500/50 transition-all duration-300 hover:bg-gradient-to-r hover:from-yellow-900/20 hover:to-gray-700/50">
              <p className="text-sm text-gray-300 hover:text-yellow-300 transition-colors duration-300">Edit Preview:</p>
              <p className="font-medium text-white hover:text-yellow-200 transition-colors duration-300">
                {tempRentDescription || (tempRentMonth && tempRentYear ? `Rent for the month of ${tempRentMonth} '${tempRentYear}` : 'Enter month and year above')}
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRentMonthCancel}
                className="px-6 py-3 text-gray-300 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-300 border border-gray-600 hover:border-gray-500 hover:scale-105 hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRentMonthSave}
                className="px-6 py-3 text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!tempRentDescription && (!tempRentMonth || !tempRentYear)}
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
          grandTotalInWords,
          rentMonth,
          rentYear,
          rentDescription
        }}
      />
    </main>
    </div>
  );
}
