/**
 * Google Sheets API utilities
 */
import axios from "axios";

/**
 * Fetch spreadsheet metadata and structure
 */
export async function getSpreadsheetStructure(
  spreadsheetId: string,
  accessToken: string
) {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching spreadsheet structure:", error);
    throw error;
  }
}

/**
 * Extract headers, data types, and sample data from spreadsheet
 */
export function extractSheetMetadata(spreadsheetData: any) {
  if (!spreadsheetData || !spreadsheetData.sheets || !spreadsheetData.sheets.length) {
    throw new Error("Invalid spreadsheet data");
  }

  const firstSheet = spreadsheetData.sheets[0];
  const gridData = firstSheet.data[0];
  
  if (!gridData || !gridData.rowData || !gridData.rowData.length) {
    return {
      sheetTitle: firstSheet.properties.title,
      headers: [],
      dataTypes: [],
      sampleData: [],
    };
  }

  // Extract headers from first row
  const headers = gridData.rowData[0].values.map((cell: any) => 
    cell.formattedValue || ''
  );

  // Get sample data and infer data types
  const sampleData: any[] = [];
  const dataTypes: string[] = new Array(headers.length).fill("unknown");

  // Skip header row, process up to 5 data rows for samples
  for (let i = 1; i < Math.min(gridData.rowData.length, 6); i++) {
    const rowData = gridData.rowData[i];
    if (!rowData.values) continue;

    const row: any = {};
    rowData.values.forEach((cell: any, index: number) => {
      if (index >= headers.length) return;
      
      const header = headers[index];
      const value = cell.formattedValue;
      row[header] = value;

      // Infer data type
      if (value !== undefined && value !== null) {
        if (dataTypes[index] === "unknown") {
          if (!isNaN(Number(value))) {
            dataTypes[index] = "number";
          } else if (
            !isNaN(Date.parse(value)) && 
            /\\d{1,4}[\\/-]\\d{1,2}[\\/-]\\d{1,4}/.test(value)
          ) {
            dataTypes[index] = "date";
          } else if (
            value.toLowerCase() === "true" || 
            value.toLowerCase() === "false"
          ) {
            dataTypes[index] = "boolean";
          } else {
            dataTypes[index] = "string";
          }
        }
      }
    });

    sampleData.push(row);
  }

  return {
    sheetTitle: firstSheet.properties.title,
    headers,
    dataTypes,
    sampleData,
  };
}

/**
 * Apply changes to a spreadsheet
 */
export async function applyChangesToSheet(
  spreadsheetId: string,
  sheetName: string,
  changes: any,
  accessToken: string
) {
  try {
    // Implement based on the type of changes
    if (changes.action === "formula") {
      // Apply formula to specified cells
      return await applyFormula(
        spreadsheetId,
        sheetName,
        changes.implementation,
        changes.range || "A1",
        accessToken
      );
    } else if (changes.action === "chart") {
      // Add chart to the sheet
      return await addChart(
        spreadsheetId,
        sheetName,
        changes.implementation,
        accessToken
      );
    } else {
      throw new Error(`Unsupported action type: ${changes.action}`);
    }
  } catch (error) {
    console.error("Error applying changes to sheet:", error);
    throw error;
  }
}

/**
 * Apply a formula to specified cells
 */
async function applyFormula(
  spreadsheetId: string,
  sheetName: string,
  formula: string,
  range: string,
  accessToken: string
) {
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?valueInputOption=USER_ENTERED`;
  
  const response = await axios.put(
    endpoint,
    {
      values: [[formula]],
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

/**
 * Add a chart to the sheet
 */
async function addChart(
  spreadsheetId: string,
  sheetName: string,
  chartConfig: any,
  accessToken: string
) {
  // Find the sheet ID first
  const spreadsheet = await getSpreadsheetStructure(spreadsheetId, accessToken);
  const sheet = spreadsheet.sheets.find(
    (s: any) => s.properties.title === sheetName
  );

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  const sheetId = sheet.properties.sheetId;

  // Prepare the request
  const request = {
    requests: [
      {
        addChart: {
          chart: {
            spec: {
              title: chartConfig.title || "Chart",
              basicChart: {
                chartType: chartConfig.type.toUpperCase(),
                legendPosition: "RIGHT_LEGEND",
                axis: [
                  {
                    position: "BOTTOM_AXIS",
                    title: chartConfig.xAxisTitle || "",
                  },
                  {
                    position: "LEFT_AXIS",
                    title: chartConfig.yAxisTitle || "",
                  },
                ],
                domains: [
                  {
                    domain: {
                      sourceRange: {
                        sources: [
                          {
                            sheetId: sheetId,
                            startRowIndex: chartConfig.startRow || 0,
                            endRowIndex: chartConfig.endRow || 10,
                            startColumnIndex: chartConfig.domainColumn || 0,
                            endColumnIndex: (chartConfig.domainColumn || 0) + 1,
                          },
                        ],
                      },
                    },
                  },
                ],
                series: chartConfig.series.map((series: any) => ({
                  series: {
                    sourceRange: {
                      sources: [
                        {
                          sheetId: sheetId,
                          startRowIndex: chartConfig.startRow || 0,
                          endRowIndex: chartConfig.endRow || 10,
                          startColumnIndex: series.column,
                          endColumnIndex: series.column + 1,
                        },
                      ],
                    },
                  },
                  targetAxis: "LEFT_AXIS",
                })),
              },
            },
            position: {
              overlayPosition: {
                anchorCell: {
                  sheetId: sheetId,
                  rowIndex: chartConfig.position?.row || 0,
                  columnIndex: chartConfig.position?.column || 3,
                },
              },
            },
          },
        },
      },
    ],
  };

  const response = await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    request,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
} 