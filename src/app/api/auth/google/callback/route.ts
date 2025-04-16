import { NextResponse } from 'next/server';
import { getGoogleTokens } from '@/lib/googleAuth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=auth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url));
  }

  try {
    const tokens = await getGoogleTokens(code);
    
    // Store tokens in HTTP-only cookie
    cookies().set('google_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.redirect(new URL('/dashboard?error=token_error', request.url));
  }
} 