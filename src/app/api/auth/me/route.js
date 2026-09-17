import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = requireAuth(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const user = await User.findById(auth.user.id).select('-password -otp -otpExpires').lean();
    if (!user) {
      return NextResponse.json({ msg: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('API Get Me Error:', err);
    return NextResponse.json({ msg: 'Server Error' }, { status: 500 });
  }
}
