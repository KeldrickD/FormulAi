"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface WaitlistFormProps {
  className?: string;
  buttonText?: string;
  placeholderText?: string;
  successMessage?: string;
}

export default function WaitlistForm({
  className = "",
  buttonText = "Join Waitlist",
  placeholderText = "Enter your email",
  successMessage = "Thanks for joining! We'll be in touch soon."
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, you would send this to your API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for demo purposes
      const waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
      waitlist.push({
        email,
        date: new Date().toISOString()
      });
      localStorage.setItem('waitlist', JSON.stringify(waitlist));
      
      setIsSubmitted(true);
      toast.success(successMessage);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`bg-green-50 p-4 rounded-lg text-green-800 text-center ${className}`}>
        <p className="font-medium">📧 {successMessage}</p>
        <p className="text-sm mt-2">Check your inbox for updates.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholderText}
        className="px-4 py-2 rounded-lg border border-gray-300 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isSubmitting}
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : buttonText}
      </button>
    </form>
  );
} 