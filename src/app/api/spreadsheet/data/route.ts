import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getSpreadsheetStructure, extractSheetMetadata } from "@/lib/utils/sheets";

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
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
      session.accessToken
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