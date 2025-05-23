"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Component that uses useSearchParams
function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the callbackUrl from the query string if it exists
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn("google", {
        callbackUrl,
        redirect: true,
      });
      
      // If redirect is false, handle here (we're using redirect: true so this won't typically run)
      if (result?.ok) {
        router.push(callbackUrl);
      } else if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-md font-medium text-sm transition-colors"
        >
          <Image 
            src="/google-logo.svg" 
            alt="Google Logo" 
            width={20} 
            height={20}
            onError={(e) => {
              // Fallback if image doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>

        <div className="text-center text-sm text-gray-500 mt-4">
          By continuing, you agree to FormulAi's{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="FormulAi Logo"
              width={180}
              height={65}
              className="mx-auto"
              priority
            />
          </Link>
          <p className="mt-4 text-gray-600">
            Connect your Google account to get started
          </p>
        </div>

        <Suspense fallback={<div className="bg-white p-8 rounded-lg shadow-sm">Loading sign-in options...</div>}>
          <SignInForm />
        </Suspense>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Don't have a Google account?{" "}
            <a 
              href="https://accounts.google.com/signup" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 