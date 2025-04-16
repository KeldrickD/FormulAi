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
    
    // Get spreadsheet metadata and structure
    const [spreadsheet, sheetsList] = await Promise.all([
      sheets.spreadsheets.get({ spreadsheetId }),
      sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' })
    ]);

    // Determine which sheet to use
    const targetSheetName = sheetName || sheetsList.data.sheets?.[0]?.properties?.title;
    
    if (!targetSheetName) {
      return NextResponse.json({ error: 'No sheets found in spreadsheet' }, { status: 400 });
    }
    
    // Get actual grid data for the specified sheet
    const range = `${targetSheetName}!A1:Z1000`; // A reasonable range to fetch
    const gridResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });
    
    const gridData = gridResponse.data.values || [];
    const headers = gridData.length > 0 ? gridData[0] : [];
    const rows = gridData.slice(1); // Skip headers
    
    // Infer data types from the first row of data
    const dataTypes = headers.map((header, index) => {
      const sampleValue = rows.length > 0 ? rows[0][index] : '';
      if (!isNaN(Number(sampleValue))) return 'number';
      if (sampleValue === 'true' || sampleValue === 'false') return 'boolean';
      return 'string';
    });
    
    // Sample data for preview (first 5 rows)
    const sampleData = rows.slice(0, 5);

    return NextResponse.json({
      spreadsheetId,
      spreadsheetTitle: spreadsheet.data.properties?.title || 'Untitled',
      sheets: sheetsList.data.sheets?.map(sheet => ({
        sheetId: String(sheet.properties?.sheetId || ''),
        title: sheet.properties?.title || ''
      })),
      sheetName: targetSheetName,
      metadata: {
        sheetTitle: targetSheetName,
        headers,
        dataTypes,
        sampleData
      },
      gridData
    });
  } catch (error: any) {
    console.error('Error fetching spreadsheet:', error);
    
    // More detailed error handling
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || "Unknown Google API error";
      
      return NextResponse.json(
        { error: message },
        { status: status || 500 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to fetch spreadsheet' }, { status: 500 });
  }
} 