import { NextRequest, NextResponse } from 'next/server';
import { companies, invoices, incrementInvoiceId } from '../../../lib/dataStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const companyId = searchParams.get('companyId');


  try {
    if (id) {
      // Get specific invoice by ID
      const invoice = invoices.find(inv => inv.id === id);
      if (!invoice) {
        return NextResponse.json({ error: { message: 'Invoice not found' } }, { status: 404 });
      }
      return NextResponse.json({ invoice });
    } else if (companyId) {
      // Get invoices for specific company
      const companyInvoices = invoices.filter(invoice => invoice.companyId === companyId);
      return NextResponse.json({ invoices: companyInvoices });
    } else {
      // Get all invoices
      return NextResponse.json({ invoices });
    }
  } catch (error) {
    console.error('Error in invoices GET:', error);
    return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract invoice data
    const companyId = formData.get('companyId') as string;
    const refNumber = formData.get('refNumber') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const rentDescription = formData.get('rentDescription') as string;
    const emailRecipient = formData.get('emailRecipient') as string;
    const status = (formData.get('status') as string) || 'DRAFT';
    const invoiceDate = (formData.get('invoiceDate') as string) || new Date().toISOString();

    // Find the company to get company details
    const company = companies.find(c => c.id === companyId);
    if (!company) {
      return NextResponse.json({ error: { message: 'Company not found' } }, { status: 404 });
    }

    const newInvoice = {
      id: `invoice${incrementInvoiceId()}`,
      companyId,
      refNumber,
      amount,
      rentDescription,
      invoiceDate: invoiceDate, // Use the provided invoice date
      status,
      emailRecipient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      company: {
        name: company.name,
        gstNumbers: JSON.stringify(company.gstNumbers)
      }
    };

    invoices.push(newInvoice);

    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error) {
    console.error('Error in invoices POST:', error);
    return NextResponse.json({ error: { message: 'Failed to create invoice' } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: { message: 'Invoice ID is required' } }, { status: 400 });
  }

  try {
    const invoiceData = await request.json();
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return NextResponse.json({ error: { message: 'Invoice not found' } }, { status: 404 });
    }

    invoices[invoiceIndex] = {
      ...invoices[invoiceIndex],
      ...invoiceData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ invoice: invoices[invoiceIndex] });
  } catch (error) {
    console.error('Error in invoices PUT:', error);
    return NextResponse.json({ error: { message: 'Failed to update invoice' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');


  if (!id) {
    return NextResponse.json({ error: { message: 'Invoice ID is required' } }, { status: 400 });
  }

  try {
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);
    
    
    if (invoiceIndex === -1) {
      return NextResponse.json({ error: { message: 'Invoice not found' } }, { status: 404 });
    }

    invoices.splice(invoiceIndex, 1);
    

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error in invoices DELETE:', error);
    return NextResponse.json({ error: { message: 'Failed to delete invoice' } }, { status: 500 });
  }
}
