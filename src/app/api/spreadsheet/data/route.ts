import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSpreadsheetStructure, extractSheetMetadata } from "@/lib/utils/sheets";

// Mark this route as dynamic since it uses headers and server-side logic
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Get token from cookies instead of session
    const cookieStore = cookies();
    const googleTokensCookie = cookieStore.get('google_tokens');
    
    if (!googleTokensCookie?.value) {
      console.error("No Google auth tokens found in cookies");
      return NextResponse.json(
        { error: "Authentication required. Please connect to Google Sheets." },
        { status: 401 }
      );
    }
    
    let tokens;
    try {
      tokens = JSON.parse(googleTokensCookie.value);
    } catch (e) {
      console.error("Error parsing Google tokens from cookie:", e);
      return NextResponse.json(
        { error: "Invalid authentication data. Please reconnect to Google Sheets." },
        { status: 401 }
      );
    }
    
    if (!tokens.access_token) {
      console.error("No access token found in Google tokens");
      return NextResponse.json(
        { error: "Missing access token. Please reconnect to Google Sheets." },
        { status: 401 }
      );
    }

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

    // Fetch spreadsheet data
    const spreadsheetData = await getSpreadsheetStructure(
      spreadsheetId,
      tokens.access_token
    );

    // Extract relevant metadata
    const metadata = extractSheetMetadata(spreadsheetData);

    // If a specific sheet was requested, filter to that sheet
    if (sheetName) {
      const sheet = spreadsheetData.sheets.find(
        (s: any) => s.properties.title === sheetName
      );

      if (!sheet) {
        return NextResponse.json(
          { error: `Sheet "${sheetName}" not found` },
          { status: 404 }
        );
      }

      // Return the specific sheet data
      return NextResponse.json({
        spreadsheetId,
        spreadsheetTitle: spreadsheetData.properties.title,
        sheetName,
        metadata: {
          ...metadata,
          sheetTitle: sheet.properties.title,
        },
        // Include grid data if available
        gridData: sheet.data && sheet.data[0] ? sheet.data[0] : null,
      });
    }

    // Return the whole spreadsheet structure with metadata
    return NextResponse.json({
      spreadsheetId,
      spreadsheetTitle: spreadsheetData.properties.title,
      sheets: spreadsheetData.sheets.map((sheet: any) => ({
        sheetId: sheet.properties.sheetId,
        title: sheet.properties.title,
      })),
      metadata,
    });
  } catch (error: any) {
    console.error("Error fetching spreadsheet data:", error);
    
    // Parse Google API errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || "Unknown Google API error";
      
      return NextResponse.json(
        { error: message },
        { status: status || 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch spreadsheet data" },
      { status: 500 }
    );
  }
} 