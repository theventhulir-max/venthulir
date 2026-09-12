import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ msg: 'Email and password are required' }, { status: 400 });
    }

    let cleanEmail = (email || '').toLowerCase().trim();
    if (cleanEmail === 'admin') cleanEmail = 'admin@venthulir.com';

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json({ msg: 'No account found with this email address.' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ msg: 'Invalid password. Please verify your credentials.' }, { status: 400 });
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
        isAdmin: user.isAdmin,
        deliveryAddress: user.deliveryAddress
      }
    });
  } catch (err) {
    console.error('API Login Error:', err);
    return NextResponse.json({ msg: 'An unexpected error occurred during login. Please try again.' }, { status: 500 });
  }
}
