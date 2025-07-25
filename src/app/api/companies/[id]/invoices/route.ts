import { NextRequest, NextResponse } from 'next/server';
import { invoices } from '../../../../../lib/dataStore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    
    // Get all invoices for this company
    const companyInvoices = invoices.filter(invoice => invoice.companyId === companyId);
    
    return NextResponse.json({ invoices: companyInvoices });
  } catch (error) {
    console.error('Error in company invoices GET:', error);
    return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 });
  }
}
