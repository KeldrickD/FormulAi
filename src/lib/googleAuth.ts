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

// Check if token needs refresh
export function isTokenExpired(tokens: any) {
  if (!tokens || !tokens.expiry_date) return true;
  
  // Add a 5-minute buffer to refresh tokens before they expire
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= (tokens.expiry_date - bufferTime);
}

// Refresh tokens if needed
export async function refreshTokensIfNeeded() {
  const tokens = getGoogleTokensFromCookie();
  
  if (!tokens) return null;
  
  // If token is not expired, return existing tokens
  if (!isTokenExpired(tokens)) {
    return tokens;
  }
  
  // Token is expired, try to refresh
  try {
    console.log('Token expired, attempting refresh');
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokens }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const refreshedTokens = await response.json();
    
    // Store refreshed tokens
    if (refreshedTokens.tokens) {
      storeGoogleTokens(refreshedTokens.tokens);
      return refreshedTokens.tokens;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    clearGoogleTokens();
    return null;
  }
}

// Clear tokens from cookie
export function clearGoogleTokens() {
  document.cookie = 'google_tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
} 