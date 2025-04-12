"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { analyzeSpreadsheet, applyChanges, fetchSpreadsheetData, undoLastChange } from "../lib/utils/api";
import { CsvData } from "../types/csv";

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

  // Function to fetch spreadsheet data
  async function loadSpreadsheet(spreadsheetId: string, sheetName?: string) {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchSpreadsheetData(spreadsheetId, sheetName);
      setData(data);
      
      if (sheetName) {
        setSelectedSheet(sheetName);
      } else if (data.sheets && data.sheets.length > 0) {
        setSelectedSheet(data.sheets[0].title);
      }
      
      return data;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load spreadsheet";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
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
    selectedSheet,
    analysisResult,
    history,
    canUndo,
    lastChangeInfo,
    loadSpreadsheet,
    loadCsvData,
    selectSheet,
    analyzeWithPrompt,
    applyAnalysisResult,
    undoLastAppliedChange,
    clearAnalysisResult,
    clearCurrentData
  };
} 