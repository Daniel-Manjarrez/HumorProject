import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">Authentication Error</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Something went wrong while trying to authenticate you. Please try again.
        </p>
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}