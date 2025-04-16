"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Upload, FileSpreadsheet, PlusCircle, History, BarChart, TrendingUp, BookOpen, Check } from "lucide-react";
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
import { Suspense } from "react";

// Main dashboard content that uses useSearchParams
function DashboardContent() {
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
    clearAnalysisResult,
    isGoogleAuthenticated,
    getGoogleAuthUrl,
    clearCurrentData
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
    <>
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
              {isGoogleAuthenticated() ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="flex items-center text-green-700">
                      <Check className="mr-2 h-5 w-5" />
                      Connected to Google
                    </span>
                    <button 
                      onClick={() => {
                        // Clear Google tokens
                        document.cookie = 'google_tokens=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                        clearCurrentData();
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Disconnect
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const spreadsheetId = prompt('Enter Google Sheets URL or ID:');
                      if (spreadsheetId) {
                        loadSpreadsheet(spreadsheetId);
                      }
                    }}
                    className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm"
                  >
                    <span className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-5 w-5" />
                      Open Google Sheet
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <a
                  href={getGoogleAuthUrl()}
                  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm"
                >
                  <span className="flex items-center">
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Connect Google Sheets
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              <button 
                className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg font-medium text-sm"
                onClick={() => setShowCsvUploader(true)}
              >
                <span className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload CSV
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
                      Last modified {sheet.lastModified}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* CSV uploader modal */}
          {showCsvUploader && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <h2 className="text-xl font-bold mb-4">Upload CSV File</h2>
                <CsvUploader onParsed={handleCsvParsed} onCancel={() => setShowCsvUploader(false)} />
              </div>
            </div>
          )}

          {/* Query input */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Ask FormulAi</h2>
              <p className="text-sm text-gray-500">
                Describe what you want to do with your spreadsheet data
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Create a pie chart of total sales by region"
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {/* Preview current sheet */}
          {data && selectedSheet && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedSheet}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    from {data.spreadsheetTitle}
                  </span>
                </h2>
              </div>
              
              <SpreadsheetPreview
                metadata={getSheetMetadata()}
                isLoading={isLoading}
                error={error}
              />
            </div>
          )}

          {/* Analysis result */}
          {analysisResult && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Analysis Result</h2>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700">Understanding:</h3>
                <p className="text-gray-600">{analysisResult.analysis}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700">Suggested Action:</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {analysisResult.action?.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      Target: {analysisResult.range}
                    </span>
                  </div>
                  <pre className="text-sm bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                    {typeof analysisResult.implementation === 'string' 
                      ? analysisResult.implementation 
                      : JSON.stringify(analysisResult.implementation, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-700">Preview:</h3>
                <p className="text-gray-600">{analysisResult.preview}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Apply Changes
                </button>
                <button
                  onClick={handleReject}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">History</h2>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <div className="font-medium">{item.query}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {item.result?.analysis}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <Link href="/" className="font-bold text-2xl text-blue-600 mb-4 sm:mb-0">FormulAi</Link>
          <div className="flex items-center gap-4">
            <WhatsNew />
            <div className="text-sm text-gray-600">
              <span>User account</span>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm">
              Account
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center p-10">Loading dashboard data...</div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
} 