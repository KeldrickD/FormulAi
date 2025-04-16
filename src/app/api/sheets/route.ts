import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { accessToken, spreadsheetId, sheetName } = await request.json();
    
    if (!accessToken || !spreadsheetId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const [spreadsheet, sheetsList] = await Promise.all([
      sheets.spreadsheets.get({ spreadsheetId }),
      sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' })
    ]);

    return NextResponse.json({
      spreadsheetId,
      spreadsheetTitle: spreadsheet.data.properties?.title || 'Untitled',
      sheets: sheetsList.data.sheets?.map(sheet => ({
        sheetId: String(sheet.properties?.sheetId || ''),
        title: sheet.properties?.title || ''
      })),
      sheetName: sheetName || sheetsList.data.sheets?.[0]?.properties?.title || undefined,
      metadata: {
        sheetTitle: sheetName || sheetsList.data.sheets?.[0]?.properties?.title || '',
        headers: [],
        dataTypes: [],
        sampleData: []
      }
    });
  } catch (error) {
    console.error('Error fetching spreadsheet:', error);
    return NextResponse.json({ error: 'Failed to fetch spreadsheet' }, { status: 500 });
  }
} 