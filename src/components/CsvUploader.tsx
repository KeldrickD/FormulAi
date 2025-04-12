"use client";

import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface CsvUploaderProps {
  onParsed: (data: any) => void;
  onCancel: () => void;
  maxSize?: number; // in MB
}

export default function CsvUploader({ onParsed, onCancel, maxSize = 5 }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const parseCSV = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      setIsProcessing(false);
      return;
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      setError('Only CSV files are supported.');
      setIsProcessing(false);
      return;
    }

    try {
      const text = await file.text();
      
      // Basic CSV parsing
      const rows = text.split('\n');
      const headers = rows[0].split(',').map(header => header.trim());
      
      const data = rows.slice(1).filter(row => row.trim()).map(row => {
        const values = row.split(',').map(value => value.trim());
        const rowData: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        return rowData;
      });

      // Process the data
      const result = {
        headers,
        data,
        rowCount: data.length,
        columnCount: headers.length
      };
      
      onParsed(result);
      toast.success(`Successfully parsed ${result.rowCount} rows of data`);
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file');
      toast.error('Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  }, [maxSize, onParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFile(file);
      parseCSV(file);
    }
  }, [parseCSV]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file);
      parseCSV(file);
    }
  }, [parseCSV]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-blue-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Maximum file size: {maxSize}MB
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors">
              Browse Files
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <File className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">{file.name}</span>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-gray-700"
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
          
          {isProcessing && (
            <div className="mt-2 flex items-center text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Processing file...
            </div>
          )}
          
          {error && (
            <div className="mt-2 flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
          
          {!isProcessing && !error && (
            <div className="mt-2 flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              File processed successfully
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 