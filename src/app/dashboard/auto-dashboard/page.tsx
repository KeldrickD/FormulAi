"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, FileSpreadsheet, BarChart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useRouter } from "next/navigation";
import { CsvData } from "@/types/csv";
import CsvUploader from "@/components/CsvUploader";
import DashboardSuggestions from "@/components/DashboardSuggestions";
import ChartPreview from "@/components/ChartPreview";
import { ChartSuggestion, generateChartSuggestions } from "@/lib/utils/dashboardGenerator";

export default function AutoDashboard() {
  const router = useRouter();
  const { data, selectedSheet, loadCsvData } = useSpreadsheet();
  
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ChartSuggestion | null>(null);
  const [generatedCharts, setGeneratedCharts] = useState<ChartSuggestion[]>([]);
  
  // Generate suggestions when data changes
  useEffect(() => {
    if (csvData) {
      const newSuggestions = generateChartSuggestions(csvData);
      setSuggestions(newSuggestions);
      
      // Select the first suggestion by default
      if (newSuggestions.length > 0 && !selectedSuggestion) {
        setSelectedSuggestion(newSuggestions[0]);
      }
    }
  }, [csvData]);
  
  // Handle CSV upload
  const handleCsvParsed = (data: CsvData) => {
    setCsvData(data);
    loadCsvData(data, data.headers.join('-') + '.csv');
  };
  
  // Add chart to dashboard
  const handleAddToDashboard = () => {
    if (selectedSuggestion && !generatedCharts.find(c => c.id === selectedSuggestion.id)) {
      setGeneratedCharts([...generatedCharts, selectedSuggestion]);
    }
  };
  
  // Remove chart from dashboard
  const handleRemoveFromDashboard = (id: string) => {
    setGeneratedCharts(generatedCharts.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold text-xl text-gray-900">Auto Dashboard Generator</h1>
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
            
            {/* Dashboard preview */}
            {generatedCharts.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Your Dashboard</h2>
                <div className="space-y-3">
                  {generatedCharts.map(chart => (
                    <div key={chart.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <BarChart className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-sm">{chart.title}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromDashboard(chart.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-medium text-sm"
                    >
                      Generate Full Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main area */}
          <div className="lg:col-span-8 space-y-6">
            {csvData ? (
              <>
                {/* Suggestions */}
                <DashboardSuggestions 
                  suggestions={suggestions}
                  onSelect={setSelectedSuggestion}
                />
                
                {/* Selected Chart Preview */}
                {selectedSuggestion && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">{selectedSuggestion.title}</h2>
                      <button
                        onClick={handleAddToDashboard}
                        disabled={generatedCharts.some(c => c.id === selectedSuggestion.id)}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                      >
                        {generatedCharts.some(c => c.id === selectedSuggestion.id) 
                          ? "Added to Dashboard" 
                          : <>Add to Dashboard <ChevronRight className="ml-1 h-4 w-4" /></>
                        }
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-600 text-sm">{selectedSuggestion.description}</p>
                    </div>
                    
                    <div className="h-80 border rounded-lg overflow-hidden">
                      <ChartPreview 
                        suggestion={selectedSuggestion}
                        data={csvData}
                        height={320}
                        width={700}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="mb-4">
                  <BarChart className="h-12 w-12 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">Create Automatic Dashboards</h3>
                <p className="text-gray-500 mb-6">
                  Upload a CSV file to get automatic chart suggestions based on your data
                </p>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Our AI will analyze your data patterns and recommend the most insightful 
                  visualizations to help you understand your data better.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 