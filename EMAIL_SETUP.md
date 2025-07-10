# Sahaya Warehousing Company - Billing System

A responsive billing system web application for Sahaya Warehousing Company with invoice generation and email functionality.

## Features

- ✅ **Editable Invoice Fields**: All invoice fields can be edited with intuitive dialog boxes
- ✅ **Auto-calculations**: Rent amount, grand total, and amount-in-words are calculated automatically
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **PDF Generation**: Convert invoices to PDF format using jsPDF
- ✅ **Email Functionality**: Send invoices via email with PDF attachment
- ✅ **Professional UI**: Clean, modern interface with print-ready invoice layout

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Email Configuration

Create a `.env.local` file in the root directory and configure your email settings:

```env
# Gmail Configuration (example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### For Gmail:

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" from your Google Account settings
3. Use the app password (not your regular password) in `EMAIL_PASS`

#### For other email providers:

You may need to modify the email configuration in `src/app/api/send-email/route.ts`

### 3. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Editing Invoice Fields

- Click the pencil icon (✏️) next to any field to edit it
- Fields include: recipient name, address, GST number, reference number, date, area, rates, and tax amounts
- Rent amount and grand total are calculated automatically

### Converting and Sending Invoice

1. Click the "Convert and Send" button in the navbar
2. The PDF overlay will open showing:
   - Left side: PDF preview of the invoice
   - Right side: Email form with recipient email and editable message
3. Enter recipient email address
4. Modify the email message if needed
5. Click "Send Email" to send the invoice via email

### Email Features

- Professional HTML email template
- PDF attachment with invoice
- Customizable email message
- Success/error notifications

## Technical Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **PDF Generation**: jsPDF, html2canvas
- **Email**: Nodemailer
- **Responsive Design**: Mobile-first approach with desktop optimization

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── send-email/
│   │       └── route.ts          # Email API endpoint
│   ├── components/
│   │   ├── Navbar/
│   │   │   └── Navbar.tsx        # Responsive navigation
│   │   └── PdfOverlay/
│   │       └── PdfOverlay.tsx    # PDF preview and email form
│   ├── utils/
│   │   └── pdfGenerator.ts       # PDF generation utilities
│   ├── layout.tsx                # Global layout
│   └── page.tsx                  # Main invoice page
```

## Environment Variables

| Variable     | Description                           | Required |
| ------------ | ------------------------------------- | -------- |
| `EMAIL_USER` | Email address for sending invoices    | Yes      |
| `EMAIL_PASS` | App password for email authentication | Yes      |

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Troubleshooting

### Email Not Sending

1. Verify your email credentials in `.env.local`
2. Check console for error messages
3. Ensure 2FA is enabled and app password is used (for Gmail)
4. Check spam folder for test emails

### PDF Generation Issues

1. Clear browser cache
2. Check browser console for JavaScript errors
3. Ensure all required packages are installed

### Build Issues

```bash
# Clean install
rm -rf node_modules
rm package-lock.json
npm install
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Sahaya Warehousing Company.
