import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpStore from '@/models/OtpStore';
import { sendEmail } from '@/lib/email';
import { generateOtpEmail } from '@/lib/emailTemplates';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ msg: 'Please provide your email address.' }, { status: 400 });
    }

    let cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin') cleanEmail = 'admin@venthulir.com';

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json({
        msg: 'No account found with this email address. Please verify your email or create a new account.'
      }, { status: 404 });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(6);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Save/Upsert in OtpStore with type 'reset' (15 mins validity)
    await OtpStore.findOneAndUpdate(
      { email: cleanEmail, type: 'reset' },
      { otpHash: hashedOtp, verified: false, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
      { upsert: true, new: true }
    );

    console.log(`[AUTH] Password Reset OTP generated and dispatched for ${cleanEmail}`);

    const emailHtml = generateOtpEmail({
      otp,
      type: 'reset',
      userName: user.name || ''
    });

    // Dispatch Password Reset OTP Email
    await sendEmail({
      to: cleanEmail,
      subject: `Your Venthulir password reset code is ${otp}`,
      html: emailHtml,
      text: `Your Venthulir password reset verification code is: ${otp}\n\nUse this code on the reset password screen. This code will expire in 15 minutes.\nIf you did not request this, please safely ignore this email.`
    });

    return NextResponse.json({
      success: true,
      msg: 'A 6-digit verification code has been sent to your email.'
    });
  } catch (err) {
    console.error('API Forgot Password Error:', err);
    return NextResponse.json({ msg: 'Server error processing password reset request.' }, { status: 500 });
  }
}
