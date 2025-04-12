interface CsvData {
  headers: string[];
  data: Record<string, string>[];
  rowCount: number;
  columnCount: number;
}

interface SheetMetadata {
  sheetTitle: string;
  headers: string[];
  dataTypes: string[];
  sampleData: any[];
}

/**
 * Detects the data type of a given value
 */
export function detectDataType(value: string): string {
  if (value === '') return 'string';
  
  // Check if it's a number
  if (!isNaN(Number(value))) {
    // Check if it's an integer or float
    return Number.isInteger(Number(value)) ? 'integer' : 'float';
  }
  
  // Check if it's a date
  const dateRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
  if (dateRegex.test(value)) return 'date';
  
  // Check if it's a boolean
  if (['true', 'false', 'yes', 'no'].includes(value.toLowerCase())) {
    return 'boolean';
  }
  
  // Default to string
  return 'string';
}

/**
 * Converts CSV data to the format expected by the spreadsheet hook
 */
export function convertCsvToSheetData(csvData: CsvData, fileName: string): {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: Array<{sheetId: string; title: string}>;
  metadata: SheetMetadata;
} {
  // Generate unique IDs for the spreadsheet and sheet
  const spreadsheetId = `csv-${Date.now()}`;
  const sheetId = `sheet1`;
  const sheetTitle = fileName.replace('.csv', '');
  
  // Detect data types for each column
  const dataTypes = csvData.headers.map(header => {
    // Look at the first 5 rows (or fewer if there are less) to determine the data type
    const sampleSize = Math.min(5, csvData.data.length);
    const samples = Array.from({ length: sampleSize }, (_, i) => 
      csvData.data[i] ? csvData.data[i][header] : ''
    );
    
    // Get the most common data type
    const typeFrequency: Record<string, number> = {};
    samples.forEach(sample => {
      const type = detectDataType(sample);
      typeFrequency[type] = (typeFrequency[type] || 0) + 1;
    });
    
    // Return the most frequent type
    return Object.entries(typeFrequency).reduce(
      (a, b) => (a[1] > b[1] ? a : b)
    )[0];
  });
  
  // Create sample data (first 5 rows)
  const sampleRows = csvData.data.slice(0, 5).map(row => {
    return csvData.headers.map(header => row[header] || '');
  });
  
  return {
    spreadsheetId,
    spreadsheetTitle: fileName,
    sheets: [{
      sheetId,
      title: sheetTitle
    }],
    metadata: {
      sheetTitle,
      headers: csvData.headers,
      dataTypes,
      sampleData: sampleRows
    }
  };
}

/**
 * Converts CSV data to grid format for display in SpreadsheetPreview
 */
export function convertCsvToGridData(csvData: CsvData): any[][] {
  // Create header row
  const grid: any[][] = [csvData.headers];
  
  // Add data rows
  csvData.data.forEach(row => {
    const rowData = csvData.headers.map(header => row[header] || '');
    grid.push(rowData);
  });
  
  return grid;
} 