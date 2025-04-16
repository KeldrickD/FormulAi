import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Mark this route as dynamic since it uses headers and server-side logic
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const spreadsheetId = url.searchParams.get("spreadsheetId");
    const sheetName = url.searchParams.get("sheetName");
    const range = url.searchParams.get("range");

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID is required" },
        { status: 400 }
      );
    }

    // Get tokens from cookies
    const cookieStore = cookies();
    const googleTokensCookie = cookieStore.get('google_tokens');
    
    if (!googleTokensCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated with Google' }, { status: 401 });
    }
    
    let tokens;
    try {
      tokens = JSON.parse(googleTokensCookie.value);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Google token format' }, { status: 401 });
    }
    
    // Set up Google auth with tokens from cookie
    const auth = new OAuth2Client();
    auth.setCredentials(tokens);

    // Fetch spreadsheet data using Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth });
    
    try {
      const spreadsheetResponse = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: true,
      });
      
      const spreadsheetData = spreadsheetResponse.data;
      
      // Extract sheet data
      let extractedSheetData = spreadsheetData;
      let targetSheet = null;
      
      // If a specific sheet was requested, filter to that sheet
      if (sheetName) {
        targetSheet = spreadsheetData.sheets?.find(
          (s: any) => s.properties?.title === sheetName
        );

        if (!targetSheet) {
          return NextResponse.json(
            { error: `Sheet "${sheetName}" not found` },
            { status: 404 }
          );
        }
      }
      
      // Extract metadata (headers, data types, sample data)
      const metadata = extractSheetMetadata(spreadsheetData, sheetName);

      // If a specific sheet was requested
      if (sheetName) {
        // Return the specific sheet data
        return NextResponse.json({
          spreadsheetId,
          spreadsheetTitle: spreadsheetData.properties?.title,
          sheetName,
          metadata: {
            ...metadata,
            sheetTitle: targetSheet?.properties?.title || sheetName,
          },
          // Include grid data if available
          gridData: targetSheet?.data && targetSheet.data[0]?.rowData ? 
            extractGridData(targetSheet.data[0].rowData) : null,
        });
      }

      // Return the whole spreadsheet structure with metadata
      return NextResponse.json({
        spreadsheetId,
        spreadsheetTitle: spreadsheetData.properties?.title,
        sheets: spreadsheetData.sheets?.map((sheet: any) => ({
          sheetId: sheet.properties?.sheetId,
          title: sheet.properties?.title,
        })),
        metadata,
      });
    } catch (error: any) {
      console.error("Error fetching spreadsheet data:", error);
      
      return NextResponse.json(
        { error: error.message || "Failed to fetch spreadsheet data" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in spreadsheet data API:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch spreadsheet data" },
      { status: 500 }
    );
  }
}

// Helper function to extract metadata from spreadsheet
function extractSheetMetadata(spreadsheetData: any, targetSheetName?: string | null) {
  // Get the target sheet
  let targetSheet = null;
  
  if (targetSheetName && spreadsheetData.sheets) {
    targetSheet = spreadsheetData.sheets.find(
      (sheet: any) => sheet.properties?.title === targetSheetName
    );
  } else if (spreadsheetData.sheets && spreadsheetData.sheets.length > 0) {
    // Use the first sheet if no specific sheet requested
    targetSheet = spreadsheetData.sheets[0];
  }
  
  if (!targetSheet || !targetSheet.data || !targetSheet.data[0]?.rowData) {
    return {
      sheetTitle: targetSheet?.properties?.title || "Sheet1",
      headers: [],
      dataTypes: [],
      sampleData: []
    };
  }
  
  // Extract data from the sheet
  const rowData = targetSheet.data[0].rowData;
  if (!rowData || rowData.length === 0) {
    return {
      sheetTitle: targetSheet.properties?.title || "Sheet1",
      headers: [],
      dataTypes: [],
      sampleData: []
    };
  }
  
  // Extract headers (first row)
  const headers = rowData[0]?.values?.map((cell: any, index: number) => 
    cell.formattedValue || `Column${index + 1}`
  ) || [];
  
  // Extract data rows (skip header)
  const dataRows = rowData.slice(1);
  
  // Parse data for the first few rows as sample
  const sampleData = dataRows.slice(0, 5).map((row: any) => {
    const rowObj: Record<string, any> = {};
    
    // Map cell values to header names
    row.values?.forEach((cell: any, index: number) => {
      if (index < headers.length) {
        rowObj[headers[index]] = cell.formattedValue || '';
      }
    });
    
    return rowObj;
  });
  
  // Determine data types from the first data row
  const dataTypes = headers.map((header: string, index: number) => {
    if (dataRows.length === 0) return "string";
    
    const firstRowValue = dataRows[0]?.values?.[index]?.formattedValue;
    
    if (firstRowValue === undefined || firstRowValue === null) return "string";
    if (!isNaN(Number(firstRowValue))) return "number";
    if (firstRowValue === "TRUE" || firstRowValue === "FALSE") return "boolean";
    
    // Check date format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(firstRowValue)) return "date";
    
    return "string";
  });
  
  return {
    sheetTitle: targetSheet.properties?.title || "Sheet1",
    headers,
    dataTypes,
    sampleData
  };
}

// Helper function to extract grid data in a format ready for the frontend
function extractGridData(rowData: any) {
  if (!rowData || rowData.length === 0) return [];
  
  return rowData.map((row: any) => 
    row.values?.map((cell: any) => cell.formattedValue || '') || []
  );
} 