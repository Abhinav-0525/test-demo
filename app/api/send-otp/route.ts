import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, name } = await request.json();

    if (!email || !otp || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Implement actual email sending
    //Option 1: Use Resend (recommended)
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your ASBL Brochure Download OTP',
      html: getEmailTemplate(name, otp)
    });

    // Option 2: Use SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: email,
    //   from: 'noreply@asbl.com',
    //   subject: 'Your ASBL Brochure Download OTP',
    //   html: getEmailTemplate(name, otp)
    // });

    // For development: Log OTP to console
    console.log(`
      ==========================================
      OTP Email for ${name} (${email})
      OTP Code: ${otp}
      Valid for: 10 minutes
      ==========================================
    `);

    return NextResponse.json({ 
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

function getEmailTemplate(name: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #000 0%, #333 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .otp-box {
          background: white;
          border: 2px solid #000;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #000;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ASBL</h1>
        <p>Building Tomorrow's Infrastructure</p>
      </div>
      
      <div class="content">
        <h2>Hello ${name},</h2>
        <p>Thank you for your interest in ASBL. Your One-Time Password (OTP) for downloading our company brochure is:</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This OTP will expire in <strong>10 minutes</strong></li>
          <li>Do not share this code with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
        
        <p>After verification, you'll have access to download our brochure and won't need to log in again for future downloads.</p>
        
        <p>Best regards,<br>The ASBL Team</p>
      </div>
      
      <div class="footer">
        <p>&copy; 2025 ASBL. All rights reserved.</p>
        <p>This is an automated email. Please do not reply.</p>
      </div>
    </body>
    </html>
  `;
}