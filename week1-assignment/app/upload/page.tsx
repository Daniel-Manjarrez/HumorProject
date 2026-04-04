import { requireUser } from '@/utils/auth';
import Link from 'next/link';
import UploadClient from './UploadClient';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';

export default async function UploadPage() {
  // Only require a logged-in user, no admin checks
  await requireUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <ThemeToggle />
        <SignOutButton />
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 font-medium">
            ← Back to Home
          </Link>
        </div>

        <UploadClient />
      </div>
    </div>
  );
}