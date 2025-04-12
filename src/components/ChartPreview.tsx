"use client";

import { useEffect, useRef } from "react";
import { ChartSuggestion } from "@/lib/utils/dashboardGenerator";
import { CsvData } from "@/types/csv";

// Mock lightweight canvas-based charts
// In a real implementation, you would integrate with a proper chart library
// like Chart.js, Recharts, or D3.js

interface ChartPreviewProps {
  suggestion: ChartSuggestion;
  data: CsvData;
  height?: number;
  width?: number;
}

export default function ChartPreview({
  suggestion,
  data,
  height = 300,
  width = 500
}: ChartPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Get values from a specific column
  const getColumnValues = (header: string): string[] => {
    return data.data.map(row => row[header] || '');
  };

  // Convert values to numbers if possible
  const getNumericValues = (header: string): number[] => {
    return getColumnValues(header)
      .map(val => parseFloat(val))
      .filter(val => !isNaN(val));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set basic styles
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw based on chart type
    switch (suggestion.chartType) {
      case 'bar':
        drawBarChart(ctx, canvas.width, canvas.height);
        break;
      case 'line':
        drawLineChart(ctx, canvas.width, canvas.height);
        break;
      case 'pie':
        drawPieChart(ctx, canvas.width, canvas.height);
        break;
      case 'scatter':
        drawScatterChart(ctx, canvas.width, canvas.height);
        break;
      case 'table':
        drawTable(ctx, canvas.width, canvas.height);
        break;
      default:
        // Default to bar chart
        drawBarChart(ctx, canvas.width, canvas.height);
    }
  }, [suggestion, data]);

  // Draw a simple bar chart
  const drawBarChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (suggestion.columns.length < 2) return;

    const categoryCol = suggestion.columns[0];
    const valueCol = suggestion.columns[1];
    
    const categories = getColumnValues(categoryCol);
    const values = getNumericValues(valueCol);
    
    // Limit to top 10 items
    const limit = Math.min(categories.length, values.length, 10);
    
    // Find max value for scaling
    const maxValue = Math.max(...values.slice(0, limit));
    
    // Calculate bar width
    const barWidth = (width - 60) / limit;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    
    // Draw bars
    for (let i = 0; i < limit; i++) {
      const barHeight = ((values[i] / maxValue) * (height - 80));
      
      // Bar
      ctx.fillStyle = `hsl(${200 + (i * 20) % 160}, 70%, 60%)`;
      ctx.fillRect(
        40 + (i * barWidth), 
        height - 40 - barHeight,
        barWidth - 5,
        barHeight
      );
      
      // Label
      ctx.fillStyle = '#333';
      ctx.fillText(
        categories[i].substring(0, 10),
        40 + (i * barWidth) + (barWidth / 2) - 2,
        height - 25
      );
    }
    
    // Title
    ctx.fillStyle = '#555';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(suggestion.title, width / 2, 15);
  };
  
  // Draw a simple line chart
  const drawLineChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (suggestion.columns.length < 2) return;
    
    const xCol = suggestion.columns[0];
    const yCol = suggestion.columns[1];
    
    const xLabels = getColumnValues(xCol);
    const yValues = getNumericValues(yCol);
    
    // Limit to top 20 points
    const limit = Math.min(xLabels.length, yValues.length, 20);
    
    // Find max value for scaling
    const maxValue = Math.max(...yValues.slice(0, limit));
    
    // Calculate point spacing
    const pointSpacing = (width - 60) / (limit - 1);
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    
    // Draw line
    ctx.beginPath();
    for (let i = 0; i < limit; i++) {
      const x = 40 + (i * pointSpacing);
      const y = height - 40 - ((yValues[i] / maxValue) * (height - 80));
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Draw points
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw x-axis labels (every nth label to avoid crowding)
    const labelInterval = Math.ceil(limit / 5);
    for (let i = 0; i < limit; i += labelInterval) {
      const x = 40 + (i * pointSpacing);
      
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        xLabels[i].substring(0, 10),
        x,
        height - 25
      );
    }
    
    // Title
    ctx.fillStyle = '#555';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(suggestion.title, width / 2, 15);
  };
  
  // Draw a simple pie chart
  const drawPieChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (suggestion.columns.length < 1) return;
    
    const categoryCol = suggestion.columns[0];
    const valueCol = suggestion.columns.length > 1 ? suggestion.columns[1] : categoryCol;
    
    const categories = getColumnValues(categoryCol);
    let values = suggestion.columns.length > 1 
      ? getNumericValues(valueCol)
      : categories.map(() => 1); // Equal weight if no value column
    
    // Count occurrences if using the same column for both
    if (categoryCol === valueCol) {
      const counts: Record<string, number> = {};
      categories.forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
      
      // Recreate arrays with unique categories
      const uniqueCategories = Object.keys(counts);
      values = uniqueCategories.map(cat => counts[cat]);
      
      // Limit to top 7 categories
      if (uniqueCategories.length > 7) {
        const sortedIndices = values
          .map((v, i) => ({ value: v, index: i }))
          .sort((a, b) => b.value - a.value)
          .map(item => item.index)
          .slice(0, 6);
        
        // Add "Other" category
        const otherValue = values
          .filter((_, i) => !sortedIndices.includes(i))
          .reduce((sum, v) => sum + v, 0);
        
        // Recreate arrays
        const filteredCategories = sortedIndices.map(i => uniqueCategories[i]);
        const filteredValues = sortedIndices.map(i => values[i]);
        
        filteredCategories.push('Other');
        filteredValues.push(otherValue);
        
        // Replace arrays
        categories.length = 0;
        values.length = 0;
        categories.push(...filteredCategories);
        values.push(...filteredValues);
      }
    } else {
      // Limit to top 7 items
      const limit = Math.min(categories.length, values.length, 7);
      categories.length = limit;
      values.length = limit;
    }
    
    // Calculate total for percentages
    const total = values.reduce((sum, val) => sum + val, 0);
    
    // Draw pie
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    let startAngle = 0;
    for (let i = 0; i < categories.length; i++) {
      const sliceAngle = (values[i] / total) * (Math.PI * 2);
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = `hsl(${200 + (i * 40) % 360}, 70%, 60%)`;
      ctx.fill();
      
      // Draw label line and text
      const middleAngle = startAngle + (sliceAngle / 2);
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(middleAngle) * labelRadius;
      const labelY = centerY + Math.sin(middleAngle) * labelRadius;
      
      // Only draw labels for slices that are large enough
      if (sliceAngle > 0.2) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `${Math.round((values[i] / total) * 100)}%`,
          labelX,
          labelY
        );
      }
      
      startAngle += sliceAngle;
    }
    
    // Title
    ctx.fillStyle = '#555';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(suggestion.title, width / 2, 15);
    
    // Legend
    const legendY = height - categories.length * 20;
    for (let i = 0; i < categories.length; i++) {
      const y = legendY + (i * 20);
      
      // Color box
      ctx.fillStyle = `hsl(${200 + (i * 40) % 360}, 70%, 60%)`;
      ctx.fillRect(width - 120, y, 12, 12);
      
      // Label
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        categories[i].substring(0, 15),
        width - 100,
        y + 6
      );
    }
  };
  
  // Draw a simple scatter chart
  const drawScatterChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (suggestion.columns.length < 2) return;
    
    const xCol = suggestion.columns[0];
    const yCol = suggestion.columns[1];
    
    const xValues = getNumericValues(xCol);
    const yValues = getNumericValues(yCol);
    
    // Limit to 100 points
    const limit = Math.min(xValues.length, yValues.length, 100);
    
    // Find max values for scaling
    const maxX = Math.max(...xValues.slice(0, limit));
    const maxY = Math.max(...yValues.slice(0, limit));
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    
    // Draw points
    for (let i = 0; i < limit; i++) {
      const x = 40 + ((xValues[i] / maxX) * (width - 80));
      const y = height - 40 - ((yValues[i] / maxY) * (height - 80));
      
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Axis labels
    ctx.fillStyle = '#555';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(xCol, width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(yCol, 0, 0);
    ctx.restore();
    
    // Title
    ctx.fillStyle = '#555';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(suggestion.title, width / 2, 15);
  };
  
  // Draw a simple table preview
  const drawTable = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const columns = suggestion.columns;
    
    // Calculate cell dimensions
    const headerHeight = 30;
    const rowHeight = (height - headerHeight - 20) / 5; // Show 5 rows max
    const colWidth = (width - 40) / columns.length;
    
    // Draw table header
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(20, 30, width - 40, headerHeight);
    
    // Draw header cells
    for (let i = 0; i < columns.length; i++) {
      const x = 20 + (i * colWidth);
      
      // Header text
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        columns[i].substring(0, Math.floor(colWidth / 8)),
        x + (colWidth / 2),
        30 + (headerHeight / 2)
      );
      
      // Vertical line
      if (i < columns.length - 1) {
        ctx.beginPath();
        ctx.moveTo(x + colWidth, 30);
        ctx.lineTo(x + colWidth, height - 10);
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();
      }
    }
    
    // Draw data rows
    for (let row = 0; row < Math.min(data.data.length, 5); row++) {
      const y = 30 + headerHeight + (row * rowHeight);
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.strokeStyle = '#e5e7eb';
      ctx.stroke();
      
      // Cell values
      for (let col = 0; col < columns.length; col++) {
        const x = 20 + (col * colWidth);
        const value = data.data[row][columns[col]] || '';
        
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          value.substring(0, Math.floor(colWidth / 8)),
          x + (colWidth / 2),
          y + (rowHeight / 2)
        );
      }
    }
    
    // Draw table border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 30, width - 40, height - 40);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full"
      />
    </div>
  );
}