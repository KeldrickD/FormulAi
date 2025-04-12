"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");
  
  // Map error codes to user-friendly messages
  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "RefreshAccessTokenError":
        return "Your session has expired. Please sign in again.";
      case "Verification":
        return "The sign-in link is invalid or has expired. Please try again.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return "There was a problem with your sign-in. Please try again.";
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account. Please sign in using the original provider.";
      case "AccessDenied":
        return "You do not have permission to access this resource.";
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      <div className="p-4 bg-red-50 rounded-md mb-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Sign-in Error
        </h3>
        <p className="text-sm text-red-700">
          {error ? getErrorMessage(error) : "An error occurred during sign-in."}
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/auth/signin"
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors"
        >
          Try Again
        </Link>
        
        <Link
          href="/"
          className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-md font-medium transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h2 className="text-3xl font-bold text-blue-600">FormulAi</h2>
          </Link>
          <p className="mt-2 text-gray-600">
            Authentication Error
          </p>
        </div>

        <Suspense fallback={<div className="bg-white p-8 rounded-lg shadow-sm">Loading error details...</div>}>
          <ErrorContent />
        </Suspense>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Need help?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 