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
  
  console.log('Google auth API received code request');
  console.log('OAuth client config:', {
    clientId: process.env.GOOGLE_CLIENT_ID ? 'set' : 'not set',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'not set',
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });

  if (!code) {
    console.error('No code provided in request');
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    console.log('Attempting to exchange code for tokens');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Successfully obtained tokens:', Object.keys(tokens).join(', '));
    
    // Verify the tokens by making a test API call
    try {
      oauth2Client.setCredentials(tokens);
      
      // Try to access user info as a test
      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
      });
      
      const userInfoResponse = await oauth2.userinfo.get();
      console.log('Token validation successful, user email:', userInfoResponse.data.email);
    } catch (verifyError) {
      console.error('Token validation failed:', verifyError);
      // Continue anyway, as we still want to return the tokens
    }
    
    return NextResponse.json({ tokens });
  } catch (error: any) {
    console.error('Error getting tokens:', error);
    
    // Extract detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      response: error.response?.data
    };
    
    console.error('Error details:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json({ 
      error: 'Failed to get tokens', 
      details: errorDetails 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tokens } = await request.json();
    
    if (!tokens) {
      console.error('No tokens provided in request body');
      return NextResponse.json({ error: 'No tokens provided' }, { status: 400 });
    }

    console.log('Setting credentials for token verification/refresh');
    oauth2Client.setCredentials(tokens);
    
    // Check if token is expired
    const { expiry_date } = tokens;
    if (expiry_date && Date.now() >= expiry_date) {
      console.log('Token expired, refreshing');
      const { credentials } = await oauth2Client.refreshAccessToken();
      console.log('Token refreshed successfully');
      return NextResponse.json({ tokens: credentials });
    }
    
    console.log('Token is still valid');
    return NextResponse.json({ tokens });
  } catch (error: any) {
    console.error('Error refreshing tokens:', error);
    return NextResponse.json({ 
      error: 'Failed to refresh tokens',
      details: {
        message: error.message,
        code: error.code
      }
    }, { status: 500 });
  }
} 