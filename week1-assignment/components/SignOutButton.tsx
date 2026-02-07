'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); // Refresh the page to update server components
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 cursor-pointer"
    >
      Sign Out
    </button>
  );
}
