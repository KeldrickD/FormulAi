"use client";

import { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles } from 'lucide-react';

// Type for a new feature
interface Feature {
  id: string;
  title: string;
  description: string;
  date: string;
  isNew?: boolean;
  category: 'feature' | 'improvement' | 'fix';
}

// Recent features to showcase
const FEATURES: Feature[] = [
  {
    id: 'feature-1',
    title: 'Team Collaboration Mode',
    description: 'Share and edit spreadsheets with your team in real-time. Includes AI assistant in team chat.',
    date: '2023-10-15',
    isNew: true,
    category: 'feature'
  },
  {
    id: 'feature-2',
    title: 'Formula Explainer',
    description: 'Get plain-English explanations for any Excel or Google Sheets formula.',
    date: '2023-10-10',
    isNew: true,
    category: 'feature'
  },
  {
    id: 'feature-3',
    title: 'Slack & Notion Integration',
    description: 'Share analysis results directly to Slack channels and Notion pages.',
    date: '2023-10-05', 
    category: 'feature'
  },
  {
    id: 'feature-4',
    title: 'Improved Dashboard Generation',
    description: 'Better chart suggestions and faster dashboard creation from spreadsheet data.',
    date: '2023-09-28',
    category: 'improvement'
  },
  {
    id: 'feature-5',
    title: 'Bug Fixes & Performance',
    description: 'Fixed issues with CSV imports and improved overall app performance.',
    date: '2023-09-20',
    category: 'fix'
  }
];

// Determine if we should show the modal based on last viewed
const shouldShowModal = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const lastViewed = localStorage.getItem('whatsNewLastViewed');
  if (!lastViewed) return true;
  
  // Show if there are features newer than last viewed
  const lastViewedDate = new Date(lastViewed);
  return FEATURES.some(feature => new Date(feature.date) > lastViewedDate);
};

export default function WhatsNew() {
  const [isOpen, setIsOpen] = useState(false);

  // Check if should show on mount
  useEffect(() => {
    // Delay showing by 2 seconds to not interrupt initial experience
    const timer = setTimeout(() => {
      setIsOpen(shouldShowModal());
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Store the current date as last viewed when closing
  const handleClose = () => {
    localStorage.setItem('whatsNewLastViewed', new Date().toISOString());
    setIsOpen(false);
  };

  // Handle manual opening of modal from a button
  const handleOpen = () => {
    setIsOpen(true);
  };

  // Badge for the category
  const CategoryBadge = ({ category }: { category: Feature['category'] }) => {
    const styles = {
      feature: 'bg-blue-100 text-blue-800',
      improvement: 'bg-green-100 text-green-800',
      fix: 'bg-amber-100 text-amber-800'
    };
    
    const labels = {
      feature: 'New Feature',
      improvement: 'Improvement',
      fix: 'Fix'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[category]}`}>
        {labels[category]}
      </span>
    );
  };

  return (
    <>
      {/* Button to open the modal */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <Sparkles className="h-4 w-4" />
        What's New
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" /> 
                What's New
              </h2>
              <button 
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="space-y-6">
                {FEATURES.map(feature => (
                  <div 
                    key={feature.id} 
                    className="relative border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 pr-8">
                        {feature.title}
                        {feature.isNew && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </h3>
                      <CategoryBadge category={feature.category} />
                    </div>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      {new Date(feature.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {FEATURES.length} updates
              </span>
              <button
                onClick={handleClose}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Mark as read
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 