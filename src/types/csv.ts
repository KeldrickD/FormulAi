/**
 * CSV data structure
 */
export interface CsvData {
  headers: string[];
  data: Record<string, string>[];
  rowCount: number;
  columnCount: number;
}

/**
 * CSV analysis result
 */
export interface CsvAnalysisResult {
  formulas?: Record<string, string>;
  charts?: any[];
  insights?: string[];
  range?: string;
  changes?: {
    cells: {
      row: number;
      col: number;
      value: any;
      formula?: string;
    }[]
  };
} 