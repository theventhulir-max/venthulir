import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpStore from '@/models/OtpStore';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({
        msg: 'Email, verification code, and new password are required.'
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        msg: 'Password must be at least 6 characters long.'
      }, { status: 400 });
    }

    let cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin') cleanEmail = 'admin@venthulir.com';
    const cleanOtp = (otp || '').toString().trim();

    // Verify OTP record in OtpStore
    const record = await OtpStore.findOne({ email: cleanEmail, type: 'reset' });
    if (!record || record.verified || new Date() > record.expiresAt) {
      return NextResponse.json({
        msg: 'Verification code has expired or is invalid. Please request a new code.'
      }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      return NextResponse.json({
        msg: 'Invalid verification code. Please check and try again.'
      }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password in MongoDB
    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
      { password: hashedPassword, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ msg: 'Account not found.' }, { status: 404 });
    }

    // Delete OTP record after successful reset
    await OtpStore.deleteOne({ _id: record._id }).catch(() => {});

    console.log(`[AUTH] Password reset successfully for ${cleanEmail}`);

    // Generate JWT token for immediate sign-in
    const token = signToken(
      { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email },
      '7d'
    );

    return NextResponse.json({
      success: true,
      msg: 'Your password has been reset successfully!',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: Boolean(user.isAdmin),
        isEmailVerified: user.isEmailVerified ?? true,
        deliveryAddress: user.deliveryAddress || { address: '', city: '', state: 'Tamil Nadu', zipCode: '' }
      }
    });
  } catch (err) {
    console.error('API Reset Password Error:', err);
    return NextResponse.json({ msg: 'Server error while resetting password.' }, { status: 500 });
  }
}
