# Billing System - Enhanced with Backend Integration

A comprehensive billing system for Sahaya Warehousing Company with full-stack functionality.

## 🚀 Features Implemented

### ✅ Backend Requirements Completed

1. **Invoice Data Storage**: When you send an invoice, the data is automatically saved in the backend with the invoice date mentioned in the invoice.

2. **Dashboard Integration**: When you open the dashboard and navigate to a specific company, you can see all invoices sent for that company.

3. **Save to Directory**: When you click "Save to directory", the invoice data is saved under the company section in the dashboard.

4. **Recent Invoices**: The dashboard shows maximum 3 recent bills in the recent invoices section.

### 🏗️ Architecture

#### Frontend (Next.js 13+ App Router)

- **Create Bill Page**: Enhanced form with company templates and invoice generation
- **Dashboard**: Shows companies and recent invoices (max 3)
- **Company Detail Page**: Individual company view with all their invoices
- **PDF Generation**: Client-side PDF generation with signature support
- **Email Integration**: Send invoices via email with PDF attachments

#### Backend (Node.js + Express + Prisma + SQLite)

- **Company Management**: Full CRUD operations
- **Invoice Management**: Create, track, and manage invoices
- **File Storage**: PDF upload and serving
- **Status Tracking**: DRAFT → SENT → PAID workflow
- **Recent Data**: API endpoint for recent invoices

### 📊 Database Schema

#### Companies Table

```sql
- id (String, Primary Key)
- name (String, Unique)
- addressLine1, addressLine2, addressLine3 (String)
- gstNumbers (JSON Array)
- rentedArea (Int)
- rentRate (Float)
- sgstRate, cgstRate (Float, default 9.0)
- refNumberPrefix (String)
- createdAt, updatedAt (DateTime)
```

#### Invoices Table

```sql
- id (String, Primary Key)
- refNumber (String, Unique)
- amount (Float)
- invoiceDate (DateTime) -- Date shown on invoice
- rentDescription (String, Optional)
- status (String) -- DRAFT, SENT, PAID, etc.
- companyId (String, Foreign Key)
- emailRecipient (String, Optional)
- emailSentAt (DateTime, Optional)
- pdfUrl (String, Optional)
- invoiceData (JSON) -- Complete invoice data
- createdAt, updatedAt (DateTime)
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup database:

   ```bash
   npm run prisma:migrate
   ```

4. Start backend server:
   ```bash
   npm run dev
   ```
   Backend runs on http://localhost:5000

### Frontend Setup

1. Navigate to root directory:

   ```bash
   cd ../
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start frontend:
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

## 📱 Usage Flow

### Creating and Sending Invoices

1. **Create Bill**:

   - Go to "Create Bill" page
   - Select company template or create new
   - Fill invoice details
   - Click "Convert & Send" to generate PDF and send email
   - Invoice automatically saved with status "SENT"

2. **Save to Directory**:

   - Click "Save to Directory" to save invoice without sending
   - Invoice saved with status "DRAFT"
   - Can be sent later from dashboard

3. **Dashboard View**:

   - See all companies and their total rented areas
   - View recent 3 invoices across all companies
   - Click on company to see all their invoices

4. **Company Detail View**:
   - See all invoices for a specific company
   - View, send, or delete individual invoices
   - Track invoice statuses

## 🔧 API Endpoints

### Companies

- `GET /api/companies` - List all companies
- `POST /api/companies` - Create new company
- `GET /api/companies/:id` - Get company details
- `GET /api/companies/:id/invoices` - Get company invoices

### Invoices

- `GET /api/invoices` - List all invoices
- `GET /api/invoices/recent?limit=3` - Get recent invoices
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `PATCH /api/invoices/:id/status` - Update invoice status
- `DELETE /api/invoices/:id` - Delete invoice

## 📋 Invoice Status Flow

1. **DRAFT** - Saved to directory but not sent
2. **SENT** - Emailed to recipient
3. **PAID** - Payment received (manual update)
4. **OVERDUE** - Past due date (manual update)
5. **CANCELLED** - Cancelled invoice (manual update)

## 🎯 Key Improvements Made

1. **Enhanced Database Schema**: Proper company-invoice relationships
2. **Invoice Date Storage**: Stores the actual invoice date from the form
3. **Complete Invoice Data**: Stores full invoice details for historical accuracy
4. **Status Tracking**: Proper workflow from draft to sent
5. **Recent Invoices Limit**: Dashboard shows exactly 3 recent invoices
6. **Company Integration**: Invoice data properly linked to companies
7. **Signature Support**: Fixed signature functionality in PDFs and emails

## 🔍 Testing the Setup

1. **Backend Health Check**:

   ```bash
   curl http://localhost:5000/health
   ```

2. **Create a Company**:

   ```bash
   curl -X POST http://localhost:5000/api/companies \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Company","addressLine1":"123 Test St","gstNumbers":["123456789"],"rentedArea":1000,"rentRate":50}'
   ```

3. **Create an Invoice**:

   ```bash
   curl -X POST http://localhost:5000/api/invoices \
     -H "Content-Type: application/json" \
     -d '{"companyId":"[company_id]","refNumber":"TEST/001","amount":59500,"invoiceDate":"2025-08-01"}'
   ```

4. **Get Recent Invoices**:
   ```bash
   curl http://localhost:5000/api/invoices/recent
   ```

The backend is now fully functional and meets all your requirements! 🎉
