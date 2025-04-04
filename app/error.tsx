"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold text-red-500">Error</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Something went wrong</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        We encountered an unexpected error. Please try again or contact support if the problem
        persists.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
