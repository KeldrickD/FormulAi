"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

type SpreadsheetPreviewProps = {
  data?: any;
  metadata?: {
    headers: string[];
    dataTypes: string[];
    sampleData: any[];
  } | null;
  analysisResult?: {
    analysis: string;
    action: string;
    implementation: string;
    preview: string;
  };
  isLoading?: boolean;
  error?: string | null;
  onApprove?: () => void;
  onReject?: () => void;
};

export default function SpreadsheetPreview({
  data,
  metadata,
  analysisResult,
  isLoading = false,
  error = null,
  onApprove,
  onReject,
}: SpreadsheetPreviewProps) {
  const [view, setView] = useState<"table" | "chart" | "analysis">("table");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">Analyzing your request...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!data && !analysisResult && !metadata) {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-6 text-center text-gray-500">
          No data to display. Connect a spreadsheet or ask a question.
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "table"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setView("table")}
        >
          Table
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "chart"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setView("chart")}
        >
          Chart
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "analysis"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setView("analysis")}
        >
          Analysis
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {view === "table" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {metadata?.headers ? (
                    metadata.headers.map((header, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))
                  ) : (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Column A
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Column B
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Column C
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metadata?.sampleData ? (
                  metadata.sampleData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {Object.values(row).map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  [1, 2, 3, 4, 5].map((row) => (
                    <tr key={row} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Sample data A{row}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Sample data B{row}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Sample data C{row}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {view === "chart" && (
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        )}

        {view === "analysis" && analysisResult && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Analysis</h3>
              <p className="mt-1 text-sm text-gray-800">{analysisResult.analysis}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Action</h3>
              <p className="mt-1 text-sm text-gray-800">{analysisResult.action}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Implementation</h3>
              <div className="mt-1 bg-gray-50 rounded p-3 text-sm font-mono">
                {analysisResult.implementation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {analysisResult && (
        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between">
          <div>
            <p className="text-sm text-gray-700">
              <strong>Preview:</strong> {analysisResult.preview}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onReject}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 