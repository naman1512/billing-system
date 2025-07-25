import { NextRequest, NextResponse } from 'next/server';
import { invoices } from '../../../../../lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    // Extract companyId from the URL
    const url = request.nextUrl;
    const segments = url.pathname.split('/');
    const idIndex = segments.findIndex(seg => seg === 'companies') + 1;
    const companyId = segments[idIndex];

    // Get all invoices for this company
    const companyInvoices = invoices.filter(invoice => invoice.companyId === companyId);

    return NextResponse.json({ invoices: companyInvoices });
  } catch (error) {
    console.error('Error in company invoices GET:', error);
    return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 });
  }
}
