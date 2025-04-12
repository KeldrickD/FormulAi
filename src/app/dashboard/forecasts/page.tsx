"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, FileSpreadsheet, Gauge, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { CsvData } from "@/types/csv";
import CsvUploader from "@/components/CsvUploader";
import ForecastChart from "@/components/ForecastChart";
import { generateForecasts } from "@/lib/utils/forecasting";

export default function Forecasts() {
  const { data, loadCsvData } = useSpreadsheet();
  
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [forecasts, setForecasts] = useState<Record<string, any>>({});
  const [forecastPeriods, setForecastPeriods] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Handle CSV upload
  const handleCsvParsed = (data: CsvData) => {
    setCsvData(data);
    loadCsvData(data, data.headers.join('-') + '.csv');
  };
  
  // Generate forecasts
  const handleGenerateForecasts = () => {
    if (!csvData) return;
    
    setIsGenerating(true);
    
    // Use setTimeout to prevent UI freezing for large datasets
    setTimeout(() => {
      const results = generateForecasts(csvData, forecastPeriods);
      setForecasts(results);
      setIsGenerating(false);
    }, 100);
  };
  
  // Auto-generate forecasts when data is loaded
  useEffect(() => {
    if (csvData) {
      handleGenerateForecasts();
    }
  }, [csvData, forecastPeriods]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold text-xl text-gray-900">Predictive Insights</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {data?.spreadsheetTitle ? (
                <span className="font-medium">{data.spreadsheetTitle}</span>
              ) : (
                <span>Not connected</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upload section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Upload Data</h2>
              {csvData ? (
                <div>
                  <div className="flex items-center mb-3">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">{data?.spreadsheetTitle || "Data loaded"}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {csvData.rowCount} rows × {csvData.columnCount} columns
                  </div>
                  <button 
                    onClick={() => setCsvData(null)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Upload different file
                  </button>
                </div>
              ) : (
                <CsvUploader onParsed={handleCsvParsed} onCancel={() => {}} />
              )}
            </div>
            
            {/* Forecast controls */}
            {csvData && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Forecast Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prediction Periods
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={forecastPeriods}
                        onChange={(e) => setForecastPeriods(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="ml-2 text-gray-700 font-medium">{forecastPeriods}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      How many periods to forecast into the future
                    </p>
                  </div>
                  
                  <button
                    onClick={handleGenerateForecasts}
                    disabled={isGenerating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Update Forecasts
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Feature highlights */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Feature Highlights</h2>
              
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Time-Series Forecasting</h3>
                    <p className="text-xs text-gray-500">
                      Predict future values based on historical patterns
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Confidence Scoring</h3>
                    <p className="text-xs text-gray-500">
                      Statistical confidence measures for each prediction
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Multiple Time Horizons</h3>
                    <p className="text-xs text-gray-500">
                      Adjust forecast length from 1 to 24 periods ahead
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className="lg:col-span-8 space-y-6">
            {Object.keys(forecasts).length > 0 ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-2">Forecast Results</h2>
                  <p className="text-sm text-gray-600">
                    Showing predictions for {forecastPeriods} periods ahead for {Object.keys(forecasts).length} metrics
                  </p>
                </div>
                
                <div className="space-y-6">
                  {Object.entries(forecasts)
                    .sort((a, b) => b[1].confidence - a[1].confidence)
                    .map(([column, forecast]) => (
                      <ForecastChart
                        key={column}
                        columnName={column}
                        originalData={forecast.originalData}
                        predictions={forecast.predictions}
                        labels={forecast.labels}
                        trend={forecast.trend}
                        percentChange={forecast.percentChange}
                        confidence={forecast.confidence}
                      />
                    ))}
                </div>
              </>
            ) : csvData ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="mb-4">
                  {isGenerating ? (
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  ) : (
                    <TrendingUp className="h-12 w-12 text-blue-500 mx-auto" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {isGenerating 
                    ? "Generating Forecasts..." 
                    : "No Forecastable Metrics Found"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isGenerating 
                    ? "Analyzing data patterns and generating predictions" 
                    : "Try uploading data with numerical values and time series"}
                </p>
                {!isGenerating && (
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    For best results, upload data with sequential time periods 
                    (dates, months, quarters) and numeric values to forecast.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="mb-4">
                  <TrendingUp className="h-12 w-12 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">Generate Predictive Insights</h3>
                <p className="text-gray-500 mb-6">
                  Upload your time-series data to forecast future trends
                </p>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Our forecasting engine uses machine learning algorithms to detect patterns 
                  in your data and provide accurate predictions for future periods.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 