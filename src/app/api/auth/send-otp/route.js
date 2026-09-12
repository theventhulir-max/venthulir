import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import OtpStore from '@/models/OtpStore';
import { sendEmail } from '@/lib/email';

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

    // Dispatch Login OTP Email directly with authentic Google SPF/DKIM headers to land in Primary Inbox
    await sendEmail({
      to: cleanEmail,
      subject: `Your Venthulir verification code is ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #0f3d2a; padding: 24px; text-align: center;">
            <h1 style="color: #d4af37; margin: 0; letter-spacing: 2px; font-size: 22px; font-family: Georgia, serif;">VENTHULIR</h1>
            <p style="color: #a7f3d0; font-size: 11px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">100% Certified Organic Harvest</p>
          </div>
          <div style="padding: 30px 24px; text-align: center;">
            <h2 style="color: #0f3d2a; margin-top: 0; font-size: 18px;">Sign In Verification</h2>
            <p style="color: #4a5e52; font-size: 14.5px; line-height: 1.5; margin-bottom: 20px;">
              Hello ${user.name || 'Valued Patron'}, enter the 6-digit verification code below to sign in to your Venthulir account:
            </p>
            <div style="margin: 24px auto; display: inline-block;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f3d2a; background: #f4f0e6; padding: 12px 24px; border-radius: 10px; border: 1.5px solid #d4af37; display: block; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 12px 0 0;">
              This verification code is valid for <strong>10 minutes</strong>.
            </p>
          </div>
          <div style="background: #faf8f5; border-top: 1px solid #eee7dc; padding: 14px 20px; text-align: center; font-size: 12px; color: #788c81;">
            <p style="margin: 0;">If you did not request this login code, please ignore this email or reach out to our farm support.</p>
          </div>
        </div>
      `,
      text: `Your Venthulir verification code is: ${otp}\n\nEnter this code on the sign-in screen. This code will expire in 10 minutes.\nIf you did not request this code, please ignore this message.`
    });

    return NextResponse.json({ msg: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('API Send Login OTP Error:', err);
    return NextResponse.json({ msg: 'Server error processing login request.' }, { status: 500 });
  }
}
