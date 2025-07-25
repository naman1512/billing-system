// Shared in-memory data store for development
// In production, this would be replaced with a real database

export interface Company {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  gstNumbers: string[];
  rentedArea: number;
  rentRate: number;
  sgstRate?: number;
  cgstRate?: number;
  refNumberPrefix?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  refNumber: string;
  amount: number;
  rentDescription?: string;
  invoiceDate: string;
  dueDate?: string;
  status: string;
  pdfUrl?: string;
  emailSentAt?: string;
  emailRecipient?: string;
  createdAt: string;
  updatedAt: string;
  company: {
    name: string;
    gstNumbers: string;
  };
}

// Global data stores
export const companies: Company[] = [];
export const invoices: Invoice[] = [];

// Counters for IDs
export let companyIdCounter = 1;
export let invoiceIdCounter = 1;

export const incrementCompanyId = () => companyIdCounter++;
export const incrementInvoiceId = () => invoiceIdCounter++;
