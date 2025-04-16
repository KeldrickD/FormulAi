import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { applyChangesToSheet } from "@/lib/utils/sheets";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request data
    const { spreadsheetId, sheetName, changes } = await req.json();

    if (!spreadsheetId || !sheetName || !changes) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate the changes object
    if (!changes.action || !changes.implementation) {
      return NextResponse.json(
        { error: "Invalid changes format: missing action or implementation" },
        { status: 400 }
      );
    }

    // Apply changes to the sheet
    const result = await applyChangesToSheet(
      spreadsheetId,
      sheetName,
      changes,
      session.accessToken
    );

    // Return success response with result
    return NextResponse.json({
      success: true,
      message: "Changes applied successfully",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error applying changes to spreadsheet:", error);
    
    // Structure the error response based on the type of error
    let status = 500;
    let message = "Failed to apply changes to spreadsheet";
    
    // Handle Google API errors
    if (error.response) {
      status = error.response.status || 500;
      
      // Authentication errors
      if (status === 401) {
        message = "Authentication expired. Please log in again.";
      } 
      // Permission errors
      else if (status === 403) {
        message = "You don't have permission to modify this spreadsheet.";
      } 
      // Not found errors
      else if (status === 404) {
        message = "Spreadsheet or sheet not found.";
      } 
      // Rate limit errors
      else if (status === 429) {
        message = "Too many requests. Please try again later.";
      } 
      // Other Google API errors
      else if (error.response.data?.error) {
        message = error.response.data.error.message || message;
      }
    } 
    // Parse validation errors
    else if (error.message.includes("Invalid")) {
      status = 400;
      message = error.message;
    }
    
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
} 