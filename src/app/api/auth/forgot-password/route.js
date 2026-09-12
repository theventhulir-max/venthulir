import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ msg: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return 200 to prevent email enumeration
      return NextResponse.json({ msg: 'If an account exists with this email, password reset instructions have been sent.' });
    }

    // Generate link or notification
    return NextResponse.json({
      msg: 'Password reset link has been dispatched to your email address.'
    });
  } catch (err) {
    console.error('API Forgot Password Error:', err);
    return NextResponse.json({ msg: 'Server error processing request' }, { status: 500 });
  }
}
