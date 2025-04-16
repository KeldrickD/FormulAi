import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleGoogleSheetsError } from "@/lib/utils/error-handling";
import axios from "axios";

export async function POST(req: Request) {
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

    // Get request data
    const { spreadsheetId, sheetName, range, previousData } = await req.json();

    if (!spreadsheetId || !sheetName || !range) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!previousData) {
      return NextResponse.json(
        { error: "No previous data provided to restore" },
        { status: 400 }
      );
    }

    // Construct the range string for the Google Sheets API
    const rangeString = `${sheetName}!${range}`;

    // Prepare the values from the previous data
    // This assumes previousData has a structure with the values to restore
    const values = extractValuesFromPreviousData(previousData);

    if (!values || values.length === 0) {
      return NextResponse.json(
        { error: "Unable to extract values from previous data" },
        { status: 400 }
      );
    }

    // Call the Google Sheets API to restore the values
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${rangeString}?valueInputOption=USER_ENTERED`;
    
    const response = await axios.put(
      endpoint,
      { values },
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Changes undone successfully",
      updatedRange: response.data.updatedRange,
      updatedCells: response.data.updatedCells,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Error restoring previous sheet state:", error);
    
    // Use the error handling utility to format the response
    const { status, message } = handleGoogleSheetsError(error);
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

/**
 * Extract values from the previous data structure
 * This function adapts based on the structure of the data we stored
 */
function extractValuesFromPreviousData(previousData: any): any[][] {
  // If the data is directly in the expected format
  if (previousData.values && Array.isArray(previousData.values)) {
    return previousData.values;
  }
  
  // If we stored the entire API response
  if (previousData.data && previousData.data.values) {
    return previousData.data.values;
  }
  
  // If we have grid data (common format from Google Sheets API)
  if (previousData.gridData && previousData.gridData.rowData) {
    const rowData = previousData.gridData.rowData;
    return rowData.map((row: any) => {
      if (!row.values) return [];
      return row.values.map((cell: any) => cell.formattedValue || "");
    });
  }
  
  // If we have metadata with sample data
  if (previousData.metadata && previousData.metadata.sampleData) {
    const { headers, sampleData } = previousData.metadata;
    
    // Convert the sample data objects back to an array format
    return [
      headers,
      ...sampleData.map((row: any) => headers.map((header: string) => row[header] || ""))
    ];
  }
  
  // Fallback: try to handle any other structure
  try {
    // If it's just a nested object with a data property
    if (typeof previousData === 'object' && previousData !== null) {
      // Look for any property that might contain the values
      for (const key of Object.keys(previousData)) {
        const value = previousData[key];
        if (Array.isArray(value)) {
          return value;
        }
      }
    }
    
    // Last resort: return as a single cell value if it's a primitive
    if (typeof previousData === 'string' || typeof previousData === 'number') {
      return [[previousData.toString()]];
    }
    
    return [[]]; // Empty value as last resort
  } catch (e) {
    console.error("Error extracting values from previous data:", e);
    return [[]];
  }
} 