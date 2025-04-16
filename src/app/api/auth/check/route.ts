import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const tokensCookie = cookieStore.get('google_tokens')?.value;
  
  // Check if tokens exist
  if (!tokensCookie) {
    console.error('Auth check failed: Missing Google tokens');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Parse the tokens
    const tokens = JSON.parse(tokensCookie);
    
    // Check that we have at least an access token
    if (!tokens.access_token) {
      console.error('Auth check failed: Invalid token format');
      return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
    }
    
    // We could verify the token with Google API here if needed
    console.log('Auth check passed: Google tokens found');
    return NextResponse.json({ status: 'authenticated' });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
} 