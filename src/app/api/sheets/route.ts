import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Simple in-memory cache
type CacheEntry = {
  data: any;
  timestamp: number;
};

type ApiCache = {
  [key: string]: CacheEntry;
};

let apiCache: ApiCache = {};

// Cache duration (10 minutes)
const CACHE_DURATION_MS = 10 * 60 * 1000;

// Instead of using setInterval which doesn't work well in serverless functions,
// we'll clean up old cache entries on each request
function cleanupCache() {
  const now = Date.now();
  for (const key in apiCache) {
    if (now - apiCache[key].timestamp > CACHE_DURATION_MS) {
      delete apiCache[key];
    }
  }
}

export async function POST(request: Request) {
  try {
    // Clean up expired cache entries
    cleanupCache();
    
    // Parse request body
    const body = await request.json();
    const { spreadsheetId, sheetName } = body;

    if (!spreadsheetId) {
      console.error('No spreadsheet ID provided');
      return NextResponse.json({ error: 'No spreadsheet ID provided' }, { status: 400 });
    }

    console.log('Processing request for spreadsheet:', spreadsheetId, 'sheet:', sheetName || 'default');

    // Create a cache key based on the spreadsheet ID and sheet name
    const cacheKey = `${spreadsheetId}:${sheetName || 'default'}`;
    const now = Date.now();

    // Check if we have a valid cache entry
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_DURATION_MS)) {
      console.log('Returning cached data for:', cacheKey);
      return NextResponse.json(apiCache[cacheKey].data);
    }

    // Get tokens from cookies
    const cookieStore = cookies();
    const tokensCookie = cookieStore.get('google_tokens');
    
    if (!tokensCookie || !tokensCookie.value) {
      console.error('No Google tokens found in cookies');
      return NextResponse.json({ 
        error: 'Not authenticated with Google',
        status: 'auth_error'
      }, { status: 401 });
    }

    let tokens;
    try {
      tokens = JSON.parse(tokensCookie.value);
      console.log('Retrieved tokens from cookies:', Object.keys(tokens).join(', '));
    } catch (error) {
      console.error('Failed to parse tokens from cookie:', error);
      return NextResponse.json({ 
        error: 'Invalid authentication tokens',
        status: 'auth_error'
      }, { status: 401 });
    }

    // Set up Google Sheets API
    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    // Get spreadsheet details
    console.log('Fetching spreadsheet metadata');
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    // Get sheet list
    const sheetList = spreadsheet.data.sheets?.map(sheet => ({
      sheetId: sheet.properties?.sheetId,
      title: sheet.properties?.title,
    })) || [];

    console.log('Available sheets:', sheetList.map(s => s.title).join(', '));

    // Determine which sheet to use
    let targetSheet = null;
    if (sheetName) {
      targetSheet = sheetList.find(sheet => sheet.title === sheetName);
      if (!targetSheet) {
        console.warn(`Requested sheet "${sheetName}" not found, defaulting to first sheet`);
      }
    }

    // Default to first sheet if target not found or not specified
    if (!targetSheet && sheetList.length > 0) {
      targetSheet = sheetList[0];
      console.log(`Using default sheet: ${targetSheet.title}`);
    }

    if (!targetSheet) {
      return NextResponse.json({ 
        error: 'No sheets found in spreadsheet',
        spreadsheetTitle: spreadsheet.data.properties?.title,
        sheets: []
      }, { status: 404 });
    }

    // Get grid data
    const range = `${targetSheet.title}!A1:Z1000`; // Reasonable limit
    console.log('Fetching grid data for range:', range);
    
    const gridResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = gridResponse.data.values || [];
    
    if (values.length === 0) {
      const responseData = {
        spreadsheetTitle: spreadsheet.data.properties?.title,
        sheets: sheetList,
        currentSheet: targetSheet,
        headers: [],
        types: [],
        values: []
      };
      
      // Cache the response
      apiCache[cacheKey] = {
        data: responseData,
        timestamp: now
      };
      
      return NextResponse.json(responseData);
    }

    // Extract headers and infer types from first row
    const headers = values[0];
    const firstDataRow = values.length > 1 ? values[1] : [];
    
    // Simple type inference
    const types = firstDataRow.map((value, index) => {
      if (value === undefined || value === null || value === '') return 'string';
      if (!isNaN(Number(value))) return 'number';
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)) return 'date';
      if (/^(true|false)$/i.test(value)) return 'boolean';
      return 'string';
    });

    // Fill in missing types with default
    while (types.length < headers.length) {
      types.push('string');
    }

    console.log('Successfully processed spreadsheet data');
    
    // Prepare the response data
    const responseData = {
      spreadsheetTitle: spreadsheet.data.properties?.title,
      sheets: sheetList,
      currentSheet: targetSheet,
      headers,
      types,
      values: values.slice(1, 6) // Return first 5 rows as sample
    };
    
    // Cache the response
    apiCache[cacheKey] = {
      data: responseData,
      timestamp: now
    };
    
    // Return data
    return NextResponse.json(responseData);
    
  } catch (error: any) {
    console.error('Error accessing Google Sheets:', error);
    
    // Check if this is an auth error
    if (error.code === 401 || error.message?.includes('auth')) {
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: error.message,
        status: 'auth_error'
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to access Google Sheets',
      details: error.message,
      status: 'api_error'
    }, { status: 500 });
  }
} 