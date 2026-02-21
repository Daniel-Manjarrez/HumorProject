export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          There was an issue signing you in. This can happen if the link expired or was already used.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </a>
      </div>
    </div>
  )
}
