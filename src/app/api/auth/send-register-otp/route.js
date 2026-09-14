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

    if (!email) {
      return NextResponse.json({ msg: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ msg: 'An account with this email already exists. Please sign in.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(6);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await OtpStore.findOneAndUpdate(
      { email: cleanEmail, type: 'register' },
      { otpHash: hashedOtp, verified: false, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 mins
      { upsert: true, new: true }
    );

    console.log(`[AUTH] Generated Registration OTP for ${cleanEmail}: ${otp}`);

    const emailHtml = generateOtpEmail({
      otp,
      type: 'register'
    });

    const emailRes = await sendEmail({
      to: cleanEmail,
      subject: `Your Venthulir verification code is ${otp}`,
      html: emailHtml,
      text: `Your Venthulir verification code is: ${otp}\n\nEnter this code on the registration screen. This code will expire in 10 minutes.\nIf you did not request this, please disregard this email.`
    });

    if (!emailRes.success) {
      return NextResponse.json({ msg: 'Email dispatch failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ msg: 'Verification code sent successfully.' });
  } catch (err) {
    console.error('OTP Send Error:', err);
    return NextResponse.json({ msg: 'Failed to dispatch verification code.' }, { status: 500 });
  }
}
