"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-4xl font-bold text-red-500">Error</h1>
      <h2 className="text-xl font-semibold mt-4 mb-2">Dashboard Error Occurred</h2>
      <p className="text-gray-600 text-center max-w-md mb-6">
        We encountered an error while processing your request in the dashboard. Please try again or
        contact support.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
