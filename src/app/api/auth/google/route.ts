import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json({ error: 'Failed to get tokens' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tokens } = await request.json();
    
    if (!tokens) {
      return NextResponse.json({ error: 'No tokens provided' }, { status: 400 });
    }

    oauth2Client.setCredentials(tokens);
    
    // Check if token is expired
    const { expiry_date } = tokens;
    if (expiry_date && Date.now() >= expiry_date) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return NextResponse.json({ tokens: credentials });
    }
    
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return NextResponse.json({ error: 'Failed to refresh tokens' }, { status: 500 });
  }
} 