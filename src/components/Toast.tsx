"use client";

import React from 'react';
import { toast as hotToast, Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'white',
          color: '#333',
          border: '1px solid #ddd',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
        success: {
          icon: <CheckCircle2 className="text-green-500 h-5 w-5" />,
          style: {
            border: '1px solid #e6f4ea',
            background: '#f2f9f5',
          },
        },
        error: {
          icon: <AlertCircle className="text-red-500 h-5 w-5" />,
          style: {
            border: '1px solid #fee2e2',
            background: '#fef2f2',
          },
        },
      }}
    />
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export const showToast = ({ message, type = 'info', duration = 5000 }: ToastProps) => {
  switch (type) {
    case 'success':
      return hotToast.success(message, { duration });
    case 'error':
      return hotToast.error(message, { duration });
    default:
      return hotToast(message, { duration });
  }
};

export const dismissToast = (toastId: string) => {
  hotToast.dismiss(toastId);
};

// Custom toast with a loading indicator
export const showLoadingToast = (message: string) => {
  return hotToast.loading(message, {
    style: {
      border: '1px solid #e2e8f0',
      background: '#f8fafc',
    },
  });
};

// Custom toast with actions
export const showActionToast = (
  message: string,
  actionText: string,
  onAction: () => void
) => {
  return hotToast.custom(
    (t) => (
      <div
        className={`flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-md ${
          t.visible ? 'animate-enter' : 'animate-leave'
        }`}
      >
        <div className="flex items-center">
          <span className="text-gray-800">{message}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onAction();
              hotToast.dismiss(t.id);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded"
          >
            {actionText}
          </button>
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    ),
    { duration: 8000 }
  );
}; 