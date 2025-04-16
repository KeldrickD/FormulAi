"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { analyzeSpreadsheet, applyChanges, fetchSpreadsheetData, undoLastChange } from "../lib/utils/api";
import { CsvData } from "../types/csv";
import { getGoogleAuthUrl, refreshTokensIfNeeded } from "../lib/googleAuth";

interface SpreadsheetHistory {
  id: string;
  query: string;
  timestamp: string;
  result?: any;
}

interface SheetData {
  spreadsheetId: string;
  spreadsheetTitle: string;
  isLocalCsv?: boolean;
  sheets?: Array<{
    sheetId: string;
    title: string;
  }>;
  sheetName?: string;
  metadata?: {
    sheetTitle: string;
    headers: string[];
    dataTypes: string[];
    sampleData: any[];
  };
  gridData?: any;
}

export function useSpreadsheet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SheetData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [history, setHistory] = useState<SpreadsheetHistory[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [lastChangeInfo, setLastChangeInfo] = useState<{
    spreadsheetId: string;
    sheetName: string;
    range?: string;
    timestamp: string;
  } | null>(null);
  const [isGAuth, setIsGAuth] = useState<boolean>(false);
  
  // Add cache for spreadsheet data
  const [apiCallCache, setApiCallCache] = useState<{
    [key: string]: {
      data: SheetData;
      timestamp: number;
    }
  }>({});
  
  // Cache expiration time (10 minutes)
  const CACHE_EXPIRATION_MS = 10 * 60 * 1000;
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('google_auth_status');
      setIsGAuth(authStatus === 'authenticated');
    }
  }, []);

  // Function to fetch spreadsheet data
  async function loadSpreadsheet(spreadsheetId: string, sheetName?: string) {
    // Generate a cache key based on spreadsheet ID and sheet name
    const cacheKey = `${spreadsheetId}:${sheetName || 'default'}`;
    
    // Check if we have cached data that isn't expired
    const cachedData = apiCallCache[cacheKey];
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRATION_MS) {
      console.log("Using cached spreadsheet data for:", spreadsheetId);
      setData(cachedData.data);
      if (sheetName) {
        setSelectedSheet(sheetName);
      } else if (cachedData.data.metadata?.sheetTitle) {
        setSelectedSheet(cachedData.data.metadata.sheetTitle);
      }
      return cachedData.data;
    }
    
    // If not cached or expired, proceed with API call
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Loading spreadsheet:", spreadsheetId, sheetName);
      
      // First ensure tokens are refreshed if needed
      await refreshTokensIfNeeded();
      
      // Fetch spreadsheet data using the API route
      const sheetsResponse = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId,
          sheetName,
        }),
        credentials: 'include' // Include cookies in the request
      });

      if (!sheetsResponse.ok) {
        const errorData = await sheetsResponse.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.error || 'Failed to fetch spreadsheet');
      }

      const sheetData = await sheetsResponse.json();
      console.log("Spreadsheet data loaded:", sheetData.spreadsheetTitle);
      console.log("Received data structure:", {
        hasSheets: !!sheetData.sheets,
        sheetCount: sheetData.sheets?.length || 0,
        headers: sheetData.headers?.length || 0
      });
      
      // Process the received data into the proper shape
      const processedData: SheetData = {
        spreadsheetId,
        spreadsheetTitle: sheetData.spreadsheetTitle || 'Unnamed Spreadsheet',
        sheets: sheetData.sheets || [],
        metadata: {
          sheetTitle: sheetName || sheetData.currentSheet?.title || 'Sheet1',
          headers: sheetData.headers || [],
          dataTypes: sheetData.types || [],
          sampleData: sheetData.values || []
        }
      };
      
      // Store in cache
      setApiCallCache(prevCache => ({
        ...prevCache,
        [cacheKey]: {
          data: processedData,
          timestamp: now
        }
      }));
      
      // Set the data state
      setData(processedData);
      console.log("State updated with sheet data:", processedData.spreadsheetTitle);
      
      // Set selected sheet
      if (sheetName) {
        setSelectedSheet(sheetName);
      } else if (sheetData.currentSheet?.title) {
        setSelectedSheet(sheetData.currentSheet.title);
      } else if (sheetData.sheets && sheetData.sheets.length > 0) {
        setSelectedSheet(sheetData.sheets[0].title);
      }
      
      // Set auth status flag in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('google_auth_status', 'authenticated');
        setIsGAuth(true);
      }
      
      return processedData;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load spreadsheet";
      console.error("Spreadsheet load error:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Function to clear cached data
  function clearCache() {
    setApiCallCache({});
  }

  // Function to check if user is authenticated with Google
  async function checkGoogleAuth(): Promise<boolean> {
    // Check for server-side rendering
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      // Make a direct API call to check auth status
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        // If authenticated, update localStorage
        localStorage.setItem('google_auth_status', 'authenticated');
        // Update state
        setIsGAuth(true);
        return true;
      } else {
        // If not authenticated, clear localStorage
        localStorage.removeItem('google_auth_status');
        // Update state
        setIsGAuth(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Function to check if user is authenticated with Google
  function isGoogleAuthenticated() {
    // Check for server-side rendering
    if (typeof window === 'undefined') {
      console.log('isGoogleAuthenticated called on server side');
      return false;
    }
    
    // First check our state
    if (isGAuth) {
      return true;
    }
    
    // Then check localStorage - this is now just a UI optimization
    // to avoid flickering while we check the actual auth status
    const authStatus = localStorage.getItem('google_auth_status');
    
    // Trigger an auth check in the background to verify
    if (authStatus === 'authenticated') {
      // Don't await this - let it happen in the background
      checkGoogleAuth();
    }
    
    return authStatus === 'authenticated';
  }

  // Function to get Google authentication URL
  function getAuthUrl() {
    return getGoogleAuthUrl();
  }

  // Function to change the selected sheet
  function selectSheet(sheetName: string) {
    setSelectedSheet(sheetName);
    
    if (data && data.spreadsheetId) {
      loadSpreadsheet(data.spreadsheetId, sheetName);
    }
  }

  // Function to analyze spreadsheet with natural language
  async function analyzeWithPrompt(
    prompt: string,
    spreadsheetId: string,
    sheetName?: string
  ) {
    if (!prompt.trim()) {
      toast.error("Please enter a query");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      // First ensure tokens are refreshed if needed
      await refreshTokensIfNeeded();
      
      const result = await analyzeSpreadsheet(prompt, spreadsheetId, sheetName || selectedSheet || undefined);
      setAnalysisResult(result);
      
      // Add to history
      const newHistoryItem: SpreadsheetHistory = {
        id: Date.now().toString(),
        query: prompt,
        timestamp: new Date().toISOString(),
        result,
      };
      
      setHistory((prevHistory) => [newHistoryItem, ...prevHistory]);
      
      // Show a toast notification
      toast.success("Analysis complete");
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to analyze spreadsheet";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Function to apply changes to spreadsheet
  async function applyAnalysisResult(
    spreadsheetId: string,
    sheetName: string = selectedSheet || ""
  ) {
    if (!analysisResult) {
      toast.error("No analysis result to apply");
      return null;
    }
    
    if (!sheetName) {
      toast.error("No sheet selected");
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // First ensure tokens are refreshed if needed
      await refreshTokensIfNeeded();
      
      const result = await applyChanges(spreadsheetId, sheetName, analysisResult);
      
      // Store information about this change for potential undo
      setLastChangeInfo({
        spreadsheetId,
        sheetName,
        range: analysisResult.range,
        timestamp: new Date().toISOString(),
      });
      
      // Show success message
      toast.success("Changes applied successfully");
      
      // Refresh data after changes
      await loadSpreadsheet(spreadsheetId, sheetName);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to apply changes";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Function to undo the last applied change
  async function undoLastAppliedChange() {
    if (!lastChangeInfo) {
      toast.error("No previous changes to undo");
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // First ensure tokens are refreshed if needed
      await refreshTokensIfNeeded();
      
      const { spreadsheetId, sheetName, range } = lastChangeInfo;
      
      const result = await undoLastChange(spreadsheetId, sheetName, range);
      
      // Clear the last change info since we've undone it
      setLastChangeInfo(null);
      
      // Show success message
      toast.success("Changes undone successfully");
      
      // Refresh the data to show the restored state
      await loadSpreadsheet(spreadsheetId, sheetName);
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to undo changes";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  // Clear current analysis result
  function clearAnalysisResult() {
    setAnalysisResult(null);
  }

  // Clear error state
  function clearError() {
    setError(null);
  }

  // Check if an undo operation is available
  const canUndo = !!lastChangeInfo;

  // Function to load CSV data
  function loadCsvData(csvData: CsvData, fileName: string) {
    try {
      // Create a local sheet data structure
      const sheetData: SheetData = {
        spreadsheetId: `csv-${Date.now()}`,
        spreadsheetTitle: fileName,
        isLocalCsv: true,
        sheets: [
          {
            sheetId: 'sheet1',
            title: fileName.replace('.csv', '')
          }
        ],
        sheetName: fileName.replace('.csv', ''),
        metadata: {
          sheetTitle: fileName.replace('.csv', ''),
          headers: csvData.headers,
          dataTypes: csvData.headers.map(() => 'string'), // Default data types
          sampleData: csvData.data.slice(0, 5).map(row => 
            csvData.headers.map(header => row[header] || '')
          )
        },
        gridData: [
          csvData.headers,
          ...csvData.data.map(row => csvData.headers.map(header => row[header] || ''))
        ]
      };

      setData(sheetData);
      setSelectedSheet(sheetData.sheetName || '');
      toast.success(`Loaded CSV: ${fileName}`);
      return sheetData;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load CSV data";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }

  // Function to clear current data
  function clearCurrentData() {
    setData(null);
    setSelectedSheet(null);
    setAnalysisResult(null);
    setError(null);
  }

  return {
    isLoading,
    error,
    data,
    analysisResult,
    history,
    selectedSheet,
    isGAuth,
    lastChangeInfo,
    loadSpreadsheet,
    checkGoogleAuth,
    isGoogleAuthenticated,
    getAuthUrl,
    selectSheet,
    analyzeWithPrompt,
    applyAnalysisResult,
    undoLastAppliedChange,
    clearAnalysisResult,
    clearError,
    loadCsvData,
    clearCurrentData,
    clearCache
  };
} 