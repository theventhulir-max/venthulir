import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const filterRole = searchParams.get('role'); // 'all', 'admin', 'customer'

    let query = {};
    if (filterRole === 'admin') {
      query = {
        $or: [
          { isAdmin: true },
          { email: { $in: ['admin@gmail.com', 'admin@venthulir.com', 'thesmgroups@gmail.com', 'mentorixacademy.ma@gmail.com'] } }
        ]
      };
    } else if (filterRole === 'all') {
      query = {};
    } else {
      // Default: ONLY genuine customers (no admin accounts)
      query = {
        isAdmin: { $ne: true },
        email: {
          $nin: [
            'admin@gmail.com',
            'admin@venthulir.com',
            'thesmgroups@gmail.com',
            'mentorixacademy.ma@gmail.com'
          ]
        }
      };
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  } catch (err) {
    console.error('API Admin Get Users Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
