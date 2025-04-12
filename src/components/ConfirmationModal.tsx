"use client";

import { Fragment, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  action: string;
  preview?: string;
  isLoading?: boolean;
  type?: "success" | "warning" | "danger";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  action,
  preview,
  isLoading = false,
  type = "warning",
}: ConfirmationModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle click on overlay (close if clicking outside modal)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center">
            {type === "success" && (
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            )}
            {type === "warning" && (
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
            )}
            {type === "danger" && (
              <XCircle className="mr-2 h-5 w-5 text-red-500" />
            )}
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            disabled={isLoading}
          >
            <span className="sr-only">Close</span>
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700">{message}</p>
          
          {preview && (
            <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm">
              <span className="block font-medium text-gray-600">Preview:</span>
              <span className="text-gray-800">{preview}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              type === "success"
                ? "bg-green-600 hover:bg-green-700"
                : type === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              action
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 