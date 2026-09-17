import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    let settings = await Settings.findOne({ key: 'global_settings' }).lean();
    if (!settings) {
      settings = await Settings.create({ key: 'global_settings' });
    }
    return NextResponse.json(settings);
  } catch (err) {
    console.error('API Get Settings Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const body = await request.json();

    const settings = await Settings.findOneAndUpdate(
      { key: 'global_settings' },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ msg: 'Settings updated successfully', settings });
  } catch (err) {
    console.error('API Update Settings Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export const PUT = POST;
