import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generatePDFBuffer } from '../../utils/pdfGenerator-new';

export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, emailMessage, invoiceData } = await request.json();

    // Validate required fields
    if (!recipientEmail || !emailMessage || !invoiceData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = await generatePDFBuffer(invoiceData);

    // Create transporter (using Gmail as example - you'll need to configure with actual email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your app password
      },
    });

    // Alternative: Test with Ethereal (development only)
    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.ethereal.email',
    //   port: 587,
    //   auth: {
    //     user: 'ethereal.user@ethereal.email',
    //     pass: 'ethereal.pass'
    //   }
    // });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Invoice ${invoiceData.refNumber} - Sahaya Warehousing Company`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Sahaya Warehousing Company</h2>
          <p>Dear ${invoiceData.recipientName},</p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${emailMessage.replace(/\n/g, '<br>')}
          </div>
          <p>Please find the attached invoice for your reference.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated email from Sahaya Warehousing Company billing system.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceData.refNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
