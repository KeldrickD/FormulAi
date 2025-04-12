import { CsvData } from "@/types/csv";

interface ForecastResult {
  originalData: number[];
  predictions: number[];
  labels: string[];
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentChange: number;
  method: string;
}

/**
 * Detect if a column contains time/date values
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
 * Simple moving average calculation
 */
function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data[i]);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < window; j++) {
      sum += data[i - j];
    }
    
    result.push(sum / window);
  }
  
  return result;
}

/**
 * Exponential Smoothing forecast
 */
function exponentialSmoothing(data: number[], alpha: number = 0.3, periods: number = 6): number[] {
  const smoothed: number[] = [data[0]];
  
  // Calculate smoothed values
  for (let i = 1; i < data.length; i++) {
    smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
  }
  
  // Forecast future periods
  const forecast: number[] = [];
  const lastSmoothed = smoothed[smoothed.length - 1];
  
  for (let i = 0; i < periods; i++) {
    forecast.push(lastSmoothed);
  }
  
  return forecast;
}

/**
 * Linear Regression calculation
 */
function linearRegression(xValues: number[], yValues: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = xValues.length;
  
  // Calculate means
  const xMean = xValues.reduce((sum, val) => sum + val, 0) / n;
  const yMean = yValues.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }
  
  const slope = numerator / denominator;
  const intercept = yMean - (slope * xMean);
  
  // Calculate R-squared
  let ssRes = 0;
  let ssTot = 0;
  
  for (let i = 0; i < n; i++) {
    const prediction = slope * xValues[i] + intercept;
    ssRes += Math.pow(yValues[i] - prediction, 2);
    ssTot += Math.pow(yValues[i] - yMean, 2);
  }
  
  const rSquared = 1 - (ssRes / ssTot);
  
  return { slope, intercept, rSquared };
}

/**
 * Generate labels for future periods
 */
function generateFutureLabels(lastLabel: string, periods: number): string[] {
  // Try to detect if it's a date format
  const datePattern = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
  
  if (datePattern.test(lastLabel)) {
    try {
      const date = new Date(lastLabel);
      const labels: string[] = [];
      
      for (let i = 1; i <= periods; i++) {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + i);
        labels.push(newDate.toISOString().split('T')[0]);
      }
      
      return labels;
    } catch (e) {
      // Fall back to numeric if date parsing fails
    }
  }
  
  // Fallback: If it's numeric, increment
  if (!isNaN(Number(lastLabel))) {
    const lastValue = Number(lastLabel);
    return Array.from({ length: periods }, (_, i) => String(lastValue + i + 1));
  }
  
  // Default: Just add "+1", "+2", etc.
  return Array.from({ length: periods }, (_, i) => `${lastLabel}+${i+1}`);
}

/**
 * Forecast future values using linear regression
 */
function forecastWithRegression(
  xValues: number[],
  yValues: number[],
  periods: number
): number[] {
  const { slope, intercept } = linearRegression(xValues, yValues);
  const lastX = xValues[xValues.length - 1];
  
  return Array.from(
    { length: periods },
    (_, i) => slope * (lastX + i + 1) + intercept
  );
}

/**
 * Generate forecasts for suitable numeric columns
 */
export function generateForecasts(
  data: CsvData,
  periods: number = 6
): Record<string, ForecastResult> {
  const results: Record<string, ForecastResult> = {};
  
  // Find time columns
  const timeColumns = data.headers.filter(header => 
    isTimeColumn(header, data.data.map(row => row[header] || ''))
  );
  
  // Helper to get numeric values from a column
  const getNumericValues = (header: string): number[] => {
    return data.data
      .map(row => {
        const val = row[header];
        return val ? parseFloat(val) : NaN;
      })
      .filter(val => !isNaN(val));
  };
  
  // Process each numeric column
  data.headers.forEach(header => {
    const values = getNumericValues(header);
    
    // Skip if not enough numeric values
    if (values.length < 10) return;
    
    // Use time column if available, otherwise use array indices
    const timeCol = timeColumns.length > 0 ? timeColumns[0] : null;
    const xValues = timeCol
      ? data.data.map((row, i) => i) // Just use indices for now
      : Array.from({ length: values.length }, (_, i) => i);
    
    // Calculate regression
    const regression = linearRegression(xValues, values);
    
    // Skip if R² is too low
    if (regression.rSquared < 0.5) return;
    
    // Generate forecasts
    const predictions = forecastWithRegression(xValues, values, periods);
    
    // Calculate trend
    const percentChange = (predictions[predictions.length - 1] - values[values.length - 1]) / 
      values[values.length - 1] * 100;
    
    const trend = percentChange > 5 
      ? 'increasing' 
      : percentChange < -5 
        ? 'decreasing' 
        : 'stable';
    
    // Generate labels
    const labels = timeCol
      ? generateFutureLabels(
          data.data[data.data.length - 1][timeCol] || String(data.data.length),
          periods
        )
      : Array.from({ length: periods }, (_, i) => String(values.length + i + 1));
    
    // Add to results
    results[header] = {
      originalData: values,
      predictions,
      labels,
      confidence: regression.rSquared * 100,
      trend,
      percentChange,
      method: 'Linear Regression'
    };
  });
  
  return results;
} 