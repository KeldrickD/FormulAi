import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getSpreadsheetStructure, extractSheetMetadata } from "@/lib/utils/sheets";

// Mark this route as dynamic since it uses server-side logic
export const dynamic = 'force-dynamic';

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set");
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    // Get request data
    const { prompt, spreadsheetId, sheetName } = await req.json();

    if (!prompt || !spreadsheetId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
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
    
    // Get OpenAI client
    const openai = getOpenAIClient();
    
    // Check if OpenAI client is initialized
    if (!openai) {
      return NextResponse.json(
        { error: "AI service is not configured. Please set the OPENAI_API_KEY environment variable." },
        { status: 503 }
      );
    }

    // Fetch spreadsheet data using the Google Sheets API
    try {
      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetResponse = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: true,
      });
      
      const spreadsheetData = spreadsheetResponse.data;
      
      // Extract metadata (headers, data types, sample data)
      const metadata = extractSheetMetadata(spreadsheetData);

      // Create a JSON representation of the spreadsheet structure for the AI
      const sheetStructureJson = JSON.stringify({
        title: spreadsheetData.properties?.title,
        sheets: spreadsheetData.sheets?.map((sheet: any) => ({
          title: sheet.properties?.title,
          gridProperties: sheet.properties?.gridProperties,
        })),
        currentSheet: sheetName || metadata.sheetTitle,
        headers: metadata.headers,
        dataTypes: metadata.dataTypes,
        sampleData: metadata.sampleData.slice(0, 3), // Limit to 3 rows for context
      }, null, 2);

      // Enhanced system prompt with detailed context
      const systemPrompt = `
        You are FormulAi, an advanced AI assistant specialized in spreadsheet analysis and formula generation for Google Sheets.
        
        SPREADSHEET STRUCTURE:
        ${sheetStructureJson}
        
        Your task is to analyze the user's request and generate appropriate actions for their Google Sheet.
        
        IMPORTANT GUIDELINES:
        1. For formulas, use valid Google Sheets syntax
        2. For charts, specify the chart type and data range
        3. Consider the data types when suggesting formulas
        4. For any cell references, use A1 notation
        5. If you need to create a pivot table, specify the source data range and pivot fields
        6. If suggesting data filtering, specify the column and filter criteria
        
        Output a JSON object with these fields:
        - "analysis": A concise explanation of what you understood from the request
        - "action": The type of action to take (one of: "formula", "chart", "pivot", "filter", "formatting")
        - "implementation": The specific formula, chart configuration, or other settings (provide complete Google Sheets syntax)
        - "preview": A description of what the result will look like
        - "range": The target cell or range where this should be applied (in A1 notation)
        - "additionalSteps": [Optional] Array of follow-up steps if this is a multi-step process
        
        For charts, include these additional fields in implementation:
        - "type": The chart type (e.g., "BAR", "PIE", "LINE")
        - "dataRange": The data range for the chart
        - "title": Chart title
        - "options": Any additional chart options
        
        BE PRECISE: Users will directly apply your suggestions to their spreadsheets.
      `;

      // Send to OpenAI for analysis
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `I'm working with the sheet "${sheetName || metadata.sheetTitle}" and I want to: ${prompt}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = completion.choices[0].message.content;
      
      // Validate the response format
      try {
        const parsedResult = JSON.parse(result || "{}");
        
        // Check for required fields
        if (!parsedResult.analysis || !parsedResult.action || !parsedResult.implementation || !parsedResult.preview) {
          throw new Error("Incomplete response from AI");
        }
        
        return NextResponse.json(parsedResult);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        return NextResponse.json(
          { error: "Failed to generate a valid response" },
          { status: 500 }
        );
      }
    } catch (sheetsError: any) {
      console.error("Error fetching spreadsheet data:", sheetsError);
      return NextResponse.json(
        { error: sheetsError.message || "Failed to fetch spreadsheet data" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error analyzing spreadsheet:", error);
    
    // Handle various error types
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: "Authentication expired. Please log in again." },
        { status: 401 }
      );
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: "You don't have permission to access this spreadsheet." },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to analyze spreadsheet" },
      { status: 500 }
    );
  }
} 