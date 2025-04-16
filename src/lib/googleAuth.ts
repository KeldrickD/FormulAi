// Client-side only functions for Google authentication

// Generate Google OAuth URL
export function getGoogleAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly'
  ].join(' ');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId || '');
  authUrl.searchParams.append('redirect_uri', redirectUri || '');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', scopes);
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');

  return authUrl.toString();
}

// Store tokens in cookie
export function storeGoogleTokens(tokens: any) {
  document.cookie = `google_tokens=${encodeURIComponent(JSON.stringify(tokens))}; path=/; max-age=3600`;
}

// Get tokens from cookie
export function getGoogleTokensFromCookie() {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('google_tokens='));
  if (!tokenCookie) return null;
  
  try {
    return JSON.parse(decodeURIComponent(tokenCookie.split('=')[1]));
  } catch (error) {
    console.error('Error parsing Google tokens:', error);
    return null;
  }
}

// Clear tokens from cookie
export function clearGoogleTokens() {
  document.cookie = 'google_tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
} 