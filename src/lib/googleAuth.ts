import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate Google OAuth URL
export function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
}

// Exchange code for tokens
export async function getGoogleTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Create Google Sheets client with user's tokens
export function createGoogleSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth });
}

// Create Google Drive client with user's tokens
export function createGoogleDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

// Verify and refresh tokens if needed
export async function verifyAndRefreshTokens(tokens: any) {
  oauth2Client.setCredentials(tokens);
  
  try {
    // Check if token is expired
    const { expiry_date } = tokens;
    if (expiry_date && Date.now() >= expiry_date) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    }
    return tokens;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
} 