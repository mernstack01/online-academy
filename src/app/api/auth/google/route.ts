import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/services/auth.service';
import { UserRole } from '@/types';

type GoogleTokenInfo = {
  aud?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
  sub?: string;
  given_name?: string;
};

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ message: 'Missing Google credential' }, { status: 400 });
    }

    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ message: 'Google OAuth not configured' }, { status: 500 });
    }

    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!tokenInfoRes.ok) {
      return NextResponse.json({ message: 'Invalid Google token' }, { status: 401 });
    }

    const tokenInfo = (await tokenInfoRes.json()) as GoogleTokenInfo;

    if (tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      return NextResponse.json({ message: 'Token audience mismatch' }, { status: 401 });
    }

    const email = String(tokenInfo.email || '').toLowerCase();
    if (!email) {
      return NextResponse.json({ message: 'Google account has no email' }, { status: 400 });
    }

    await dbConnect();

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      if (adminEmail && email === adminEmail) {
        return NextResponse.json({ message: 'Email is reserved' }, { status: 403 });
      }
      user = await User.create({
        name: tokenInfo.name || tokenInfo.given_name || email.split('@')[0],
        email,
        role: UserRole.STUDENT,
        provider: 'google',
        googleId: tokenInfo.sub,
        image: tokenInfo.picture,
      });
    } else {
      const hasChanges =
        (!user.googleId && tokenInfo.sub) || (!user.image && tokenInfo.picture);
      if (!user.googleId && tokenInfo.sub) user.googleId = tokenInfo.sub;
      if (!user.image && tokenInfo.picture) user.image = tokenInfo.picture;
      if (hasChanges) await user.save();
    }

    const token = signToken(user);

    return NextResponse.json({
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        provider: user.provider,
        googleId: user.googleId,
      },
      token,
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
