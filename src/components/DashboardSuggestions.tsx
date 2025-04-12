"use client";

import { useState } from "react";
import { ChartSuggestion, ChartType } from "@/lib/utils/dashboardGenerator";
import { BarChart, LineChart, PieChart, ScatterChart, Table } from "lucide-react";

interface DashboardSuggestionsProps {
  suggestions: ChartSuggestion[];
  onSelect: (suggestion: ChartSuggestion) => void;
}

export default function DashboardSuggestions({ 
  suggestions, 
  onSelect 
}: DashboardSuggestionsProps) {
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const getChartIcon = (chartType: ChartType) => {
    switch (chartType) {
      case 'line':
        return <LineChart className="h-5 w-5" />;
      case 'bar':
      case 'column':
        return <BarChart className="h-5 w-5" />;
      case 'pie':
        return <PieChart className="h-5 w-5" />;
      case 'scatter':
        return <ScatterChart className="h-5 w-5" />;
      case 'table':
        return <Table className="h-5 w-5" />;
      default:
        return <BarChart className="h-5 w-5" />;
    }
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800";
    if (confidence >= 70) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  // Filter suggestions based on selected tab
  const filteredSuggestions = selectedTab === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.chartType === selectedTab);

  // Group chart types for tab filtering
  const chartTypes = Array.from(new Set(suggestions.map(s => s.chartType)));

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b">
        <div className="flex overflow-x-auto p-2 space-x-2">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              selectedTab === 'all'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Suggestions
          </button>
          
          {chartTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedTab(type)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                selectedTab === type
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{getChartIcon(type)}</span>
              <span className="capitalize">{type} Charts</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          {selectedTab === 'all' ? 'Recommended Visualizations' : `${selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Chart Suggestions`}
        </h3>
        
        {filteredSuggestions.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No suggestions available for the selected type
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuggestions.map(suggestion => (
              <div 
                key={suggestion.id}
                className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelect(suggestion)}
              >
                <div className="p-4 border-b bg-gray-50 rounded-t-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-2 text-blue-600">
                      {getChartIcon(suggestion.chartType)}
                    </div>
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceBadgeColor(suggestion.confidence)}`}>
                    {suggestion.confidence}%
                  </span>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  <div className="text-xs text-gray-500">
                    <span>Columns: </span>
                    {suggestion.columns.map((col, idx) => (
                      <span key={col}>
                        <span className="font-medium">{col}</span>
                        {idx < suggestion.columns.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 