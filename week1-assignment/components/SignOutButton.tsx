'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Clear persisted feed state
    sessionStorage.removeItem('captionFeed');
    sessionStorage.removeItem('captionCurrentIndex');

    router.push('/login'); // Redirect to login page
    router.refresh(); // Refresh the page to update server components
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
    >
      Sign Out
    </button>
  );
}
