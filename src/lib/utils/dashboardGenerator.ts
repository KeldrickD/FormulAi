import { CsvData } from "@/types/csv";

export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'scatter' 
  | 'area'
  | 'column'
  | 'heatmap'
  | 'table';

export interface ChartSuggestion {
  id: string;
  title: string;
  description: string;
  chartType: ChartType;
  columns: string[];
  confidence: number; // 0-100 confidence score
  preview?: any; // Optional preview data
}

/**
 * Detects if a column contains time-based data
 */
function isTimeColumn(header: string, values: string[]): boolean {
  // Check column name first
  const timeRelatedTerms = ['date', 'time', 'year', 'month', 'day', 'quarter', 'week'];
  const headerLower = header.toLowerCase();
  
  if (timeRelatedTerms.some(term => headerLower.includes(term))) {
    return true;
  }
  
  // Check data patterns
  const datePattern = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
  const validValues = values.filter(v => v && v.trim());
  if (validValues.length === 0) return false;
  
  const dateMatches = validValues.filter(value => datePattern.test(value));
  return dateMatches.length > validValues.length * 0.7; // 70% threshold
}

/**
 * Detects if a column contains numerical data
 */
function isNumericColumn(values: string[]): boolean {
  const validValues = values.filter(v => v && v.trim());
  if (validValues.length === 0) return false;
  
  const numericMatches = validValues.filter(value => !isNaN(Number(value)));
  return numericMatches.length > validValues.length * 0.7; // 70% threshold
}

/**
 * Detects if a column contains categorical data
 */
function isCategoricalColumn(values: string[]): boolean {
  const validValues = values.filter(v => v && v.trim());
  if (validValues.length === 0) return false;
  
  // Count unique values
  const uniqueValues = new Set(validValues);
  
  // If the number of unique values is less than 30% of total values
  // and absolute number is less than 20, consider it categorical
  return uniqueValues.size < Math.min(20, validValues.length * 0.3);
}

/**
 * Get values for a specific column from CSV data
 */
function getColumnValues(csvData: CsvData, header: string): string[] {
  return csvData.data.map(row => row[header] || '');
}

/**
 * Generate chart suggestions based on data patterns
 */
export function generateChartSuggestions(csvData: CsvData): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];
  
  // Classify columns
  const columnTypes: Record<string, {
    isTime: boolean;
    isNumeric: boolean;
    isCategorical: boolean;
  }> = {};
  
  csvData.headers.forEach(header => {
    const values = getColumnValues(csvData, header);
    columnTypes[header] = {
      isTime: isTimeColumn(header, values),
      isNumeric: isNumericColumn(values),
      isCategorical: isCategoricalColumn(values)
    };
  });
  
  // Find time columns
  const timeColumns = csvData.headers.filter(h => columnTypes[h].isTime);
  
  // Find numeric columns
  const numericColumns = csvData.headers.filter(h => columnTypes[h].isNumeric);
  
  // Find categorical columns
  const categoricalColumns = csvData.headers.filter(h => columnTypes[h].isCategorical);
  
  // Suggest time series charts if time and numeric columns exist
  if (timeColumns.length > 0 && numericColumns.length > 0) {
    timeColumns.forEach(timeCol => {
      numericColumns.forEach((numCol, index) => {
        if (index < 3) { // Limit to 3 suggestions per time column
          suggestions.push({
            id: `timeseries-${timeCol}-${numCol}`,
            title: `${numCol} over time`,
            description: `Line chart showing how ${numCol} changes over ${timeCol}`,
            chartType: 'line',
            columns: [timeCol, numCol],
            confidence: 90
          });
        }
      });
    });
  }
  
  // Suggest bar charts for categorical vs numeric columns
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    categoricalColumns.forEach(catCol => {
      numericColumns.forEach((numCol, index) => {
        if (index < 3) { // Limit to 3 suggestions per categorical column
          suggestions.push({
            id: `bar-${catCol}-${numCol}`,
            title: `${numCol} by ${catCol}`,
            description: `Bar chart comparing ${numCol} across different ${catCol} categories`,
            chartType: 'bar',
            columns: [catCol, numCol],
            confidence: 85
          });
        }
      });
    });
  }
  
  // Suggest pie charts for categorical columns with 2-7 categories
  categoricalColumns.forEach(catCol => {
    const values = getColumnValues(csvData, catCol);
    const uniqueValues = new Set(values.filter(v => v && v.trim()));
    
    if (uniqueValues.size >= 2 && uniqueValues.size <= 7) {
      const numCol = numericColumns[0]; // Use first numeric column if available
      if (numCol) {
        suggestions.push({
          id: `pie-${catCol}-${numCol}`,
          title: `${catCol} distribution`,
          description: `Pie chart showing the distribution of ${numCol} across ${catCol} categories`,
          chartType: 'pie',
          columns: [catCol, numCol],
          confidence: 75
        });
      } else {
        suggestions.push({
          id: `pie-${catCol}`,
          title: `${catCol} distribution`,
          description: `Pie chart showing the distribution of ${catCol} categories`,
          chartType: 'pie',
          columns: [catCol],
          confidence: 70
        });
      }
    }
  });
  
  // Suggest scatter plots for numeric vs numeric columns
  if (numericColumns.length >= 2) {
    for (let i = 0; i < numericColumns.length - 1 && i < 2; i++) {
      for (let j = i + 1; j < numericColumns.length && j < i + 3; j++) {
        suggestions.push({
          id: `scatter-${numericColumns[i]}-${numericColumns[j]}`,
          title: `${numericColumns[i]} vs ${numericColumns[j]}`,
          description: `Scatter plot showing the relationship between ${numericColumns[i]} and ${numericColumns[j]}`,
          chartType: 'scatter',
          columns: [numericColumns[i], numericColumns[j]],
          confidence: 80
        });
      }
    }
  }
  
  // Suggest data table for overview
  suggestions.push({
    id: 'table-overview',
    title: 'Data Overview',
    description: 'Table view of your data with key columns',
    chartType: 'table',
    columns: csvData.headers.slice(0, Math.min(5, csvData.headers.length)),
    confidence: 100
  });
  
  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence);
} 