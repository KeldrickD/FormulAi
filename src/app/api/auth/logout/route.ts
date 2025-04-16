import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST() {
  try {
    // Get Google tokens from cookie
    const cookieStore = cookies();
    const tokensCookie = cookieStore.get('google_tokens');
    
    // If we have tokens, try to revoke them
    if (tokensCookie && tokensCookie.value) {
      try {
        const tokens = JSON.parse(tokensCookie.value);
        
        // If we have an access token, revoke it
        if (tokens.access_token) {
          await oauth2Client.revokeToken(tokens.access_token);
          console.log('Successfully revoked access token');
        }
        
        // If we have a refresh token, revoke it as well
        if (tokens.refresh_token) {
          await oauth2Client.revokeToken(tokens.refresh_token);
          console.log('Successfully revoked refresh token');
        }
      } catch (revokeError) {
        // Just log the error but continue with cookie deletion
        console.error('Failed to revoke tokens:', revokeError);
      }
    }
    
    // Clear Google tokens cookie
    cookieStore.delete('google_tokens');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
} 