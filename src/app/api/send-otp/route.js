import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  const { email, otp } = await request.json();

  // Setup transporter with Mailtrap SMTP
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',   // Replace with your host from Mailtrap
    port: 587,
    auth: {
      user: process.env.MAILTRAP_USER,  // Use env variables for security
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const mailOptions = {
    from: '"YourApp" <yourapp@example.com>', // Can be anything
    to: email,
    subject: 'Your OTP Code',
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Mail sent:', info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Mail error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
