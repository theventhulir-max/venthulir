import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpStore from '@/models/OtpStore';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp, rememberMe } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ msg: 'Email and verification code are required.' }, { status: 400 });
    }

    let cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin') cleanEmail = 'admin@venthulir.com';

    const cleanOtp = (otp || '').toString().trim();

    const record = await OtpStore.findOne({ email: cleanEmail, type: 'login' });
    if (!record || record.verified || new Date() > record.expiresAt) {
      return NextResponse.json({ msg: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      return NextResponse.json({ msg: 'Invalid verification code. Please check and try again.' }, { status: 400 });
    }

    // Delete OTP record on successful verification
    await OtpStore.deleteOne({ _id: record._id }).catch(() => {});

    // Find the user
    const user = await User.findOne({
      $or: [
        { email: cleanEmail },
        { email: 'admin@venthulir.com' }
      ]
    });
    if (!user) {
      return NextResponse.json({ msg: 'Customer profile not found.' }, { status: 404 });
    }

    const expiresIn = rememberMe ? '30d' : '7d';
    const token = signToken(
      { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
      expiresIn
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: Boolean(user.isAdmin),
        isEmailVerified: user.isEmailVerified ?? true,
        deliveryAddress: user.deliveryAddress || { address: '', city: '', state: 'Tamil Nadu', zipCode: '' },
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('API Verify Login OTP Error:', err);
    return NextResponse.json({ msg: 'Failed to verify login code.' }, { status: 500 });
  }
}
