import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-6">Resource Not Found</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        The dashboard resource you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
        Return to Dashboard Home
      </Link>
    </div>
  );
}
