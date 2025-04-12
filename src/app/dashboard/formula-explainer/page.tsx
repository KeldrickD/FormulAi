"use client";

import { useState, useRef } from "react";
import { ArrowLeft, LightbulbIcon, TextQuote, Code, BookOpen, Calculator } from "lucide-react";
import Link from "next/link";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import FormulaExplainer from "@/components/FormulaExplainer";

export default function FormulaExplainerPage() {
  const { data } = useSpreadsheet();
  const [cellSelection, setCellSelection] = useState('');
  const cellInputRef = useRef<HTMLInputElement>(null);
  
  // Handle cell selection form submission
  const handleCellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cellInputRef.current && cellInputRef.current.value) {
      setCellSelection(cellInputRef.current.value);
    }
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
            <h1 className="font-bold text-xl text-gray-900">Formula Explainer</h1>
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
            {/* Formula input */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Select a Cell</h2>
              <form onSubmit={handleCellSubmit} className="mb-4">
                <div className="flex">
                  <input
                    ref={cellInputRef}
                    type="text"
                    placeholder="e.g., A1, B2, etc."
                    className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg font-medium"
                  >
                    Load Cell
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Enter a cell reference to load its formula (not functional in demo)
                </p>
              </form>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-700 text-sm flex items-start">
                <LightbulbIcon className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <div>
                  <p className="font-medium mb-1">Demo Mode</p>
                  <p>
                    In a real integration, this would fetch the actual formula from
                    the selected cell in your spreadsheet.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Benefits */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Benefits</h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <TextQuote className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Plain Language</h3>
                    <p className="text-xs text-gray-500">
                      Understand complex formulas in simple, human terms
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Code className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Formula Breakdown</h3>
                    <p className="text-xs text-gray-500">
                      See each part of a formula explained individually
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Educational</h3>
                    <p className="text-xs text-gray-500">
                      Learn how different spreadsheet functions work
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Debugging</h3>
                    <p className="text-xs text-gray-500">
                      Find and fix errors in complex formulas more easily
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Formula explainer component */}
            <FormulaExplainer formula="" initialOpen={true} />
            
            {/* Common formulas */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Common Formulas</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">VLOOKUP</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Searches for a value in the first column of a table and returns a value in the same row from a specified column.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                    =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])
                  </div>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">INDEX + MATCH</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    A more flexible alternative to VLOOKUP that can look up values in any column.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                    =INDEX(array, MATCH(lookup_value, lookup_array, 0))
                  </div>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">SUMIFS</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Adds cells that meet multiple criteria across different ranges.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                    =SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)
                  </div>
                </div>
                
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 mb-1">IFERROR</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Returns a specified value if a formula results in an error; otherwise returns the formula's result.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                    =IFERROR(value, value_if_error)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 