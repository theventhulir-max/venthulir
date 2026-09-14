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

    let cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin') cleanEmail = 'admin@venthulir.com';

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({
        msg: 'No account found with this email. Please click "Create Account" tab above to register.'
      }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(6);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await OtpStore.findOneAndUpdate(
      { email: cleanEmail, type: 'login' },
      { otpHash: hashedOtp, verified: false, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 minutes validity
      { upsert: true, new: true }
    );

    console.log(`[AUTH] Generated Login OTP for ${cleanEmail}: ${otp}`);

    const emailHtml = generateOtpEmail({
      otp,
      type: 'login',
      userName: user.name || ''
    });

    // Dispatch Login OTP Email directly with authentic Google SPF/DKIM headers to land in Primary Inbox
    await sendEmail({
      to: cleanEmail,
      subject: `Your Venthulir verification code is ${otp}`,
      html: emailHtml,
      text: `Your Venthulir verification code is: ${otp}\n\nEnter this code on the sign-in screen. This code will expire in 10 minutes.\nIf you did not request this code, please ignore this message.`
    });

    return NextResponse.json({ msg: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('API Send Login OTP Error:', err);
    return NextResponse.json({ msg: 'Server error processing login request.' }, { status: 500 });
  }
}
