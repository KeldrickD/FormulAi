"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface ForecastChartProps {
  columnName: string;
  originalData: number[];
  predictions: number[];
  labels: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
  percentChange: number;
  confidence: number;
  height?: number;
  width?: number;
}

export default function ForecastChart({
  columnName,
  originalData,
  predictions,
  labels,
  trend,
  percentChange,
  confidence,
  height = 300,
  width = 600
}: ForecastChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set dimensions
    const chartHeight = height - 60;
    const chartWidth = width - 60;

    // Find min and max values for scaling
    const allValues = [...originalData, ...predictions];
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;
    const valueRange = maxValue - minValue;

    // Calculate scales
    const xScale = chartWidth / (originalData.length + predictions.length - 1);
    const yScale = chartHeight / valueRange;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();

    // Draw grid lines
    const gridLineCount = 5;
    ctx.strokeStyle = '#f0f0f0';
    ctx.beginPath();
    for (let i = 1; i < gridLineCount; i++) {
      const y = height - 40 - (i * chartHeight / gridLineCount);
      ctx.moveTo(40, y);
      ctx.lineTo(width - 20, y);
    }
    ctx.stroke();

    // Draw labels on y-axis
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= gridLineCount; i++) {
      const y = height - 40 - (i * chartHeight / gridLineCount);
      const value = minValue + (i * valueRange / gridLineCount);
      ctx.fillText(value.toLocaleString(undefined, { maximumFractionDigits: 1 }), 35, y);
    }

    // Draw original data line
    ctx.beginPath();
    for (let i = 0; i < originalData.length; i++) {
      const x = 40 + (i * xScale);
      const y = height - 40 - ((originalData[i] - minValue) * yScale);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Draw points
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw predicted data line (dashed)
    ctx.beginPath();
    const startX = 40 + ((originalData.length - 1) * xScale);
    const startY = height - 40 - ((originalData[originalData.length - 1] - minValue) * yScale);
    ctx.moveTo(startX, startY);
    
    for (let i = 0; i < predictions.length; i++) {
      const x = 40 + ((originalData.length - 1 + i) * xScale);
      const y = height - 40 - ((predictions[i] - minValue) * yScale);
      ctx.lineTo(x, y);
      
      // Draw points
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw vertical separator line
    ctx.beginPath();
    ctx.moveTo(startX, 20);
    ctx.lineTo(startX, height - 40);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the "Forecast" label
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Forecast', startX + (predictions.length * xScale) / 2, 35);
    
    // Draw x-axis labels (every nth label to avoid crowding)
    const allLabels = [...originalData.map((_, i) => String(i + 1)), ...labels];
    const labelInterval = Math.ceil(allLabels.length / 10);
    
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i < allLabels.length; i += labelInterval) {
      const x = 40 + (i * xScale);
      ctx.fillText(allLabels[i].substring(0, 10), x, height - 35);
    }
    
    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${columnName} Forecast`, width / 2, 5);
  }, [columnName, originalData, predictions, labels, height, width]);

  // Determine trend icon and color
  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{columnName} Forecast</h3>
          <div className="text-sm text-gray-500">
            Based on {originalData.length} data points
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end">
            {getTrendIcon()}
            <span className={`ml-1 font-medium ${getTrendColor()}`}>
              {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Confidence: {confidence.toFixed(0)}%
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <canvas 
          ref={canvasRef}
          width={width}
          height={height}
          className="max-w-full"
        />
      </div>
      
      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
          <span>Historical Data</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
          <span>Predicted Values</span>
        </div>
      </div>
    </div>
  );
} 