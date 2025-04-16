import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { storeGoogleTokens } from '@/lib/googleAuth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url));
  }

  try {
    // Exchange code for tokens using our API route
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google?code=${code}`);
    
    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const { tokens } = await response.json();
    
    // Store tokens in cookie
    storeGoogleTokens(tokens);
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect(new URL('/dashboard?error=auth_failed', request.url));
  }
} 