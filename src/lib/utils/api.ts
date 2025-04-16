/**
 * API utilities for spreadsheet operations
 */

// Store previous state for undo functionality
let previousStates: Record<string, any> = {};

/**
 * Analyze a spreadsheet with a natural language query
 */
export async function analyzeSpreadsheet(
  prompt: string,
  spreadsheetId: string,
  sheetName?: string
) {
  try {
    const response = await fetch("/api/spreadsheet/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        spreadsheetId,
        sheetName,
      }),
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to analyze spreadsheet");
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing spreadsheet:", error);
    throw error;
  }
}

/**
 * Apply changes to a spreadsheet
 */
export async function applyChanges(
  spreadsheetId: string,
  sheetName: string,
  changes: any
) {
  try {
    // First, backup the current state of the affected range (for undo)
    await backupSheetState(spreadsheetId, sheetName, changes);

    const response = await fetch("/api/spreadsheet/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId,
        sheetName,
        changes,
      }),
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to apply changes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error applying changes:", error);
    throw error;
  }
}

/**
 * Backup the current state of the sheet before making changes (for undo)
 */
async function backupSheetState(
  spreadsheetId: string,
  sheetName: string,
  changes: any
) {
  try {
    // Only backup if we have a valid range to restore
    if (!changes.range) return;

    // Fetch current data in the affected range
    const params = new URLSearchParams();
    params.append("spreadsheetId", spreadsheetId);
    params.append("sheetName", sheetName);
    params.append("range", changes.range);

    const response = await fetch(`/api/spreadsheet/data?${params.toString()}`, {
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      console.error("Failed to backup sheet state");
      return;
    }

    const data = await response.json();
    
    // Create a unique key for this sheet and range
    const stateKey = `${spreadsheetId}:${sheetName}:${changes.range}`;
    
    // Store the previous state
    previousStates[stateKey] = {
      timestamp: new Date().toISOString(),
      data,
      changes,
    };

  } catch (error) {
    console.error("Error backing up sheet state:", error);
    // Continue with the change even if backup fails
  }
}

/**
 * Undo the last change made to a spreadsheet
 */
export async function undoLastChange(
  spreadsheetId: string,
  sheetName: string,
  range?: string
) {
  try {
    // Find the most recent state for this sheet (and range if specified)
    let stateKey: string | null = null;
    let stateToRestore: any = null;

    if (range) {
      // If a specific range is provided, restore just that range
      stateKey = `${spreadsheetId}:${sheetName}:${range}`;
      stateToRestore = previousStates[stateKey];
    } else {
      // Otherwise, find the most recent change for this sheet
      const sheetPrefix = `${spreadsheetId}:${sheetName}:`;
      
      // Get all keys for this sheet and find the most recent
      const relevantKeys = Object.keys(previousStates).filter(key => 
        key.startsWith(sheetPrefix)
      );
      
      if (relevantKeys.length > 0) {
        // Sort by timestamp (most recent first)
        relevantKeys.sort((a, b) => {
          return new Date(previousStates[b].timestamp).getTime() - 
                 new Date(previousStates[a].timestamp).getTime();
        });
        
        stateKey = relevantKeys[0];
        stateToRestore = previousStates[stateKey];
      }
    }

    if (!stateToRestore) {
      throw new Error("No previous state found to restore");
    }

    // Make the API call to restore the previous state
    const response = await fetch("/api/spreadsheet/restore", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId,
        sheetName,
        range: stateToRestore.changes.range,
        previousData: stateToRestore.data,
      }),
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to undo changes");
    }

    // Remove this state from the history after successful restoration
    if (stateKey) {
      delete previousStates[stateKey];
    }

    return await response.json();
  } catch (error) {
    console.error("Error undoing last change:", error);
    throw error;
  }
}

/**
 * Fetch spreadsheet data
 */
export async function fetchSpreadsheetData(
  spreadsheetId: string,
  sheetName?: string,
  range?: string
) {
  try {
    const params = new URLSearchParams();
    params.append("spreadsheetId", spreadsheetId);
    if (sheetName) params.append("sheetName", sheetName);
    if (range) params.append("range", range);

    const response = await fetch(`/api/spreadsheet/data?${params.toString()}`, {
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to fetch spreadsheet data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching spreadsheet data:", error);
    throw error;
  }
}

/**
 * Get user's recent spreadsheets
 */
export async function getRecentSpreadsheets() {
  try {
    const response = await fetch("/api/spreadsheet/recent", {
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || "Failed to fetch recent spreadsheets");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recent spreadsheets:", error);
    throw error;
  }
} 