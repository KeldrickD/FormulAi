"use client";

import { useState } from "react";
import { HelpCircle, BookOpen, Code, Terminal, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { explainFormula } from "@/lib/utils/formulaExplainer";

interface FormulaExplainerProps {
  formula?: string;
  initialOpen?: boolean;
}

export default function FormulaExplainer({ 
  formula = '',
  initialOpen = false
}: FormulaExplainerProps) {
  const [userFormula, setUserFormula] = useState(formula);
  const [explanation, setExplanation] = useState<any>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isOpen, setIsOpen] = useState(initialOpen);
  
  // Handle explaining the formula
  const handleExplain = () => {
    if (!userFormula.trim()) return;
    
    setIsExplaining(true);
    
    // Use setTimeout to prevent UI freezing for complex formulas
    setTimeout(() => {
      try {
        const result = explainFormula(userFormula);
        setExplanation(result);
      } catch (err) {
        console.error('Error explaining formula:', err);
      } finally {
        setIsExplaining(false);
      }
    }, 100);
  };
  
  // Handle example formulas
  const handleExampleClick = (example: string) => {
    setUserFormula(example);
    setTimeout(() => handleExplain(), 100);
  };
  
  // Get complexity badge color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'complex':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Example formulas
  const examples = [
    '=SUM(A1:A10)',
    '=AVERAGE(B1:B20)',
    '=IF(C1>100,"High","Low")',
    '=VLOOKUP(A2,B2:D20,2,FALSE)',
    '=CONCATENATE(A1," ",B1)',
    '=SUM(IF(A1:A10>5,A1:A10,0))'
  ];

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-medium text-blue-900">Formula Explainer</h3>
        </div>
        <div>
          <svg 
            className={`h-5 w-5 text-blue-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter a spreadsheet formula
            </label>
            <div className="flex">
              <input
                type="text"
                value={userFormula}
                onChange={(e) => setUserFormula(e.target.value)}
                placeholder="e.g., =SUM(A1:A10)"
                className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleExplain}
                disabled={isExplaining || !userFormula.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-r-lg font-medium transition-colors"
              >
                {isExplaining ? 'Analyzing...' : 'Explain'}
              </button>
            </div>
          </div>
          
          {/* Common formula examples */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Try these examples:
            </h4>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(ex)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-md font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
          
          {/* Explanation results */}
          {explanation && (
            <div className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                <div className="font-medium font-mono text-gray-700">
                  {explanation.original}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getComplexityColor(explanation.complexity)}`}>
                  {explanation.complexity.charAt(0).toUpperCase() + explanation.complexity.slice(1)}
                </div>
              </div>
              
              {/* Plain language explanation */}
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Info className="h-4 w-4 text-blue-500 mr-1" />
                  In Plain Language
                </h4>
                <p className="text-gray-600">
                  {explanation.plainLanguage}
                </p>
              </div>
              
              {/* Formula breakdown */}
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Code className="h-4 w-4 text-blue-500 mr-1" />
                  Formula Breakdown
                </h4>
                <div className="space-y-2">
                  {explanation.parts.map((part: any, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono text-sm">
                        {part.snippet}
                      </div>
                      <div className="ml-3 text-sm text-gray-600">
                        {part.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Examples */}
              {explanation.examples && explanation.examples.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Terminal className="h-4 w-4 text-blue-500 mr-1" />
                    Examples
                  </h4>
                  <div className="space-y-3">
                    {explanation.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span className="text-xs font-medium text-gray-500 mr-2">
                            Input:
                          </span>
                          <div className="font-mono text-sm">
                            {JSON.stringify(ex.input)}
                          </div>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="text-xs font-medium text-gray-500 mr-2">
                            Output:
                          </span>
                          <div className="font-mono text-sm">
                            {JSON.stringify(ex.output)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {ex.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Help text when no formula is entered */}
          {!explanation && !isExplaining && (
            <div className="bg-blue-50 p-4 rounded-lg text-blue-700 flex items-start">
              <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">How to use Formula Explainer</p>
                <p className="text-sm">
                  Enter any Excel or Google Sheets formula, and the Formula Explainer will
                  break it down in plain language. You can enter simple formulas like 
                  =SUM(A1:A10) or complex ones with nested functions.
                </p>
              </div>
            </div>
          )}
          
          {/* Loading state */}
          {isExplaining && (
            <div className="bg-gray-50 p-4 rounded-lg flex justify-center items-center">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
              <span className="text-gray-600">Analyzing formula...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 