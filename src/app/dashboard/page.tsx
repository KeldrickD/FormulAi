"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Upload, FileSpreadsheet, PlusCircle, History, BarChart, TrendingUp, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import SpreadsheetPreview from "@/components/SpreadsheetPreview";
import { useRouter, useSearchParams } from "next/navigation";
import CsvUploader from "@/components/CsvUploader";
import { CsvData } from "@/types/csv";
import FormulaExplainer from "@/components/FormulaExplainer";
import { ShareIntegration } from "@/components/ShareIntegration";
import TeamCollaboration from "@/components/TeamCollaboration";
import { Toaster, showToast } from "@/components/Toast";
import WhatsNew from "@/components/WhatsNew";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const { 
    isLoading, 
    error, 
    data, 
    selectedSheet,
    analysisResult,
    history,
    loadSpreadsheet,
    loadCsvData,
    selectSheet,
    analyzeWithPrompt,
    applyAnalysisResult,
    clearAnalysisResult
  } = useSpreadsheet();
  const [showCsvUploader, setShowCsvUploader] = useState(false);
  
  // Mock data for demonstration - will be replaced with real API data
  const recentSheets = [
    { id: "sheet1", name: "Q1 2023 Financial Report", lastModified: "2 days ago" },
    { id: "sheet2", name: "Marketing Budget", lastModified: "1 week ago" },
    { id: "sheet3", name: "Product Sales Analysis", lastModified: "3 weeks ago" },
  ];

  // Load spreadsheet from URL params on initial load
  useEffect(() => {
    const spreadsheetId = searchParams.get("spreadsheetId");
    const sheetName = searchParams.get("sheetName");
    
    if (spreadsheetId) {
      loadSpreadsheet(spreadsheetId, sheetName || undefined);
    }
  }, [searchParams]);

  // Update URL when selecting a sheet
  const handleSelectSheet = (sheetId: string) => {
    const sheet = recentSheets.find(s => s.id === sheetId);
    if (sheet) {
      if (data) {
        // In real app, we'd navigate to the actual sheet
        router.push(`/dashboard?spreadsheetId=${sheetId}&sheetName=${sheet.name}`);
        selectSheet(sheet.name);
      } else {
        loadSpreadsheet(sheetId);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedSheet || !query.trim()) {
      showToast({ message: "Please select a sheet and enter a query", type: "error" });
      return;
    }
    
    try {
      const spreadsheetId = data?.spreadsheetId || recentSheets.find(s => s.name === selectedSheet)?.id;
      if (!spreadsheetId) {
        showToast({ message: "Unable to determine spreadsheet ID", type: "error" });
        return;
      }
      await analyzeWithPrompt(query, spreadsheetId, selectedSheet);
    } catch (err) {
      showToast({ message: "Failed to analyze spreadsheet", type: "error" });
    }
  };

  const handleApprove = async () => {
    if (!selectedSheet || !data?.spreadsheetId) {
      showToast({ message: "No spreadsheet selected", type: "error" });
      return;
    }
    
    try {
      await applyAnalysisResult(data.spreadsheetId, selectedSheet);
    } catch (err) {
      showToast({ message: "Failed to apply changes", type: "error" });
    }
  };

  const handleReject = () => {
    clearAnalysisResult();
    showToast({ message: "Changes rejected", type: "success" });
  };

  // Get sheet metadata from data if available
  const getSheetMetadata = () => {
    if (!data || !data.metadata) return null;
    return {
      headers: data.metadata.headers,
      dataTypes: data.metadata.dataTypes,
      sampleData: data.metadata.sampleData
    };
  };

  // Handle CSV upload
  const handleCsvParsed = (csvData: CsvData) => {
    loadCsvData(csvData, csvData.headers.join('-') + '.csv');
    setShowCsvUploader(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <Link href="/" className="font-bold text-2xl text-blue-600 mb-4 sm:mb-0">FormulAi</Link>
          <div className="flex items-center gap-4">
            <WhatsNew />
            <div className="text-sm text-gray-600">
              {data?.spreadsheetTitle ? (
                <span className="font-medium">{data.spreadsheetTitle}</span>
              ) : (
                <span>Not connected</span>
              )}
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm">
              Account
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500">Analyze and visualize your data</p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {data && <ShareIntegration content={{ 
              title: data.spreadsheetTitle || "Spreadsheet", 
              description: "Dashboard analysis",
              spreadsheetLink: data.spreadsheetId ? `https://example.com/sheet/${data.spreadsheetId}` : undefined
            }} />}
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Connect section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Connect</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm">
                  <span className="flex items-center">
                    <FileSpreadsheet className="mr-2 h-5 w-5" /> Google Sheets
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button 
                  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm"
                  onClick={() => setShowCsvUploader(true)}
                >
                  <span className="flex items-center">
                    <Upload className="mr-2 h-5 w-5" /> Upload CSV
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/dashboard/auto-dashboard"
                  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm"
                >
                  <span className="flex items-center">
                    <BarChart className="mr-2 h-5 w-5" /> Auto Dashboard
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/forecasts"
                  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm"
                >
                  <span className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" /> Forecasting
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/formula-explainer"
                  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm"
                >
                  <span className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" /> Formula Explainer
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm">
                  <span className="flex items-center">
                    <PlusCircle className="mr-2 h-5 w-5" /> New Sheet
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Recent sheets */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Recent Sheets</h2>
              <div className="space-y-3">
                {/* Show actual sheets if available, otherwise show demo sheets */}
                {data?.sheets ? (
                  data.sheets.map((sheet) => (
                    <button
                      key={sheet.sheetId}
                      className={`w-full text-left p-3 rounded-lg text-sm ${
                        selectedSheet === sheet.title
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => selectSheet(sheet.title)}
                    >
                      <div className="font-medium">{sheet.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        From {data.spreadsheetTitle}
                      </div>
                    </button>
                  ))
                ) : (
                  recentSheets.map((sheet) => (
                    <button
                      key={sheet.id}
                      className={`w-full text-left p-3 rounded-lg text-sm ${
                        selectedSheet === sheet.name
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => handleSelectSheet(sheet.id)}
                    >
                      <div className="font-medium">{sheet.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Modified {sheet.lastModified}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className="lg:col-span-3 space-y-6">
            {showCsvUploader ? (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Upload CSV File</h2>
                  <button 
                    onClick={() => setShowCsvUploader(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <CsvUploader onCsvParsed={handleCsvParsed} />
              </div>
            ) : selectedSheet ? (
              <>
                {/* Query input */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Ask anything about your data</h2>
                  <div className="flex">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., Show me monthly sales for the last quarter"
                      className="flex-grow p-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                      onClick={handleAnalyze}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg font-semibold transition-colors disabled:bg-blue-400 relative"
                    >
                      {isLoading ? (
                        <>
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        </>
                      ) : "Generate"}
                    </button>
                  </div>
                  
                  {/* Query suggestions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500">Try asking:</span>
                    {["Show monthly revenue trend", "Calculate profit margin by product", "Create a sales dashboard", "Forecast next quarter revenue"].map((suggestion, index) => (
                      <button 
                        key={index}
                        onClick={() => setQuery(suggestion)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  )}
                </div>

                {/* Spreadsheet preview */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      {data?.sheetName || selectedSheet}
                    </h2>
                    {data?.spreadsheetId && (
                      <a 
                        href={`https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Open in Google Sheets
                      </a>
                    )}
                  </div>
                  <SpreadsheetPreview 
                    data={getSheetMetadata()}
                    analysisResult={analysisResult}
                    isLoading={isLoading}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </div>

                {/* Query history */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <History className="h-5 w-5 mr-2 text-blue-500" /> Query History
                    </h2>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">{history.length} queries</span>
                      <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {history.length > 0 ? (
                      history.map((item) => (
                        <div 
                          key={item.id} 
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                          onClick={() => setQuery(item.query)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-sm">{item.query}</div>
                            <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </div>
                          </div>
                          {item.result && (
                            <div className="mt-2 text-xs text-gray-500 hidden group-hover:block">
                              {item.result.action && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  {item.result.action}
                                </span>
                              )}
                              {item.result.timestamp && (
                                <span>
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 bg-gray-50 rounded-lg text-center flex flex-col items-center justify-center">
                        <div className="mb-3 p-3 bg-blue-100 rounded-full">
                          <History className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-gray-500 mb-1">No history yet.</p>
                        <p className="text-sm text-gray-400">Start by asking a question above.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Display the spreadsheet data when loaded */}
                {data && data.gridData && (
                  <div className="space-y-6">
                    <SpreadsheetPreview 
                      data={data.gridData} 
                      analysisResult={analysisResult}
                      isLoading={isLoading}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  
                    {/* Formula Explainer */}
                    <FormulaExplainer initialOpen={false} />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="mb-4">
                  <FileSpreadsheet className="h-12 w-12 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Spreadsheet Selected</h3>
                <p className="text-gray-500 mb-6">Please connect to Google Sheets or upload a CSV file to get started</p>
                <div className="flex justify-center space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
                    Connect to Google Sheets
                  </button>
                  <button 
                    className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium text-sm"
                    onClick={() => setShowCsvUploader(true)}
                  >
                    Upload CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster />
      
      {/* Team Collaboration Component */}
      <TeamCollaboration spreadsheetId={data?.spreadsheetId} />
      
    </div>
  );
} 