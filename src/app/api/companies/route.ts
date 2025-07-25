import { NextRequest, NextResponse } from 'next/server';
import { companies, invoices, incrementCompanyId } from '../../../lib/dataStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Get specific company by ID
      const company = companies.find(c => c.id === id);
      if (!company) {
        return NextResponse.json({ error: { message: 'Company not found' } }, { status: 404 });
      }
      return NextResponse.json({ company });
    } else {
      // Get all companies
      return NextResponse.json({ companies });
    }
  } catch (error) {
    console.error('Error in companies GET:', error);
    return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyData = await request.json();
    
    const newCompany = {
      id: `company${incrementCompanyId()}`,
      ...companyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    companies.push(newCompany);
    
    return NextResponse.json({ company: newCompany }, { status: 201 });
  } catch (error) {
    console.error('Error in companies POST:', error);
    return NextResponse.json({ error: { message: 'Failed to create company' } }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: { message: 'Company ID is required' } }, { status: 400 });
  }

  try {
    const companyData = await request.json();
    const companyIndex = companies.findIndex(c => c.id === id);
    
    if (companyIndex === -1) {
      return NextResponse.json({ error: { message: 'Company not found' } }, { status: 404 });
    }

    companies[companyIndex] = {
      ...companies[companyIndex],
      ...companyData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ company: companies[companyIndex] });
  } catch (error) {
    console.error('Error in companies PUT:', error);
    return NextResponse.json({ error: { message: 'Failed to update company' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: { message: 'Company ID is required' } }, { status: 400 });
  }

  try {
    const companyIndex = companies.findIndex(c => c.id === id);
    
    if (companyIndex === -1) {
      return NextResponse.json({ error: { message: 'Company not found' } }, { status: 404 });
    }

    companies.splice(companyIndex, 1);
    
    // Also delete all invoices for this company
    for (let i = invoices.length - 1; i >= 0; i--) {
      if (invoices[i].companyId === id) {
        invoices.splice(i, 1);
      }
    }

    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error in companies DELETE:', error);
    return NextResponse.json({ error: { message: 'Failed to delete company' } }, { status: 500 });
  }
}
