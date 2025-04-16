import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const requestUrl = request.url;
  
  console.log('Google callback received with URL:', requestUrl);
  
  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url));
  }

  try {
    // Log environment variables for debugging
    console.log('Using APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    
    // Exchange code for tokens using our API route
    const tokenUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google?code=${code}`;
    console.log('Requesting tokens from:', tokenUrl);
    
    const response = await fetch(tokenUrl);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token exchange failed:', response.status, errorData);
      throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorData}`);
    }

    const responseData = await response.json();
    console.log('Token response received:', Object.keys(responseData));
    
    if (!responseData.tokens) {
      console.error('No tokens in response:', responseData);
      throw new Error('No tokens in response');
    }
    
    // Store tokens in cookie using Next.js cookies API
    const cookieStore = cookies();
    cookieStore.set({
      name: 'google_tokens',
      value: JSON.stringify(responseData.tokens),
      path: '/',
      maxAge: 3600, // 1 hour
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    });
    
    console.log('Stored tokens in cookie and redirecting to dashboard');
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error: any) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect(new URL(`/dashboard?error=auth_failed&message=${encodeURIComponent(error.message || 'Unknown error')}`, request.url));
  }
} 