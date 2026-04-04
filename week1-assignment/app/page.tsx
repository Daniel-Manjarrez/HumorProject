import { requireUser } from '@/utils/auth';
import { createClient } from '@/utils/supabase/server';
import LoginButton from '@/components/LoginButton';
import SignOutButton from '@/components/SignOutButton';
import CaptionRater from '@/components/CaptionRater';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function Home() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Humor Project
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Join our community to view and share witty captions.
            </p>
          </div>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  // First, fetch the IDs of captions the user has already voted on
  const { data: votedCaptions, error: votesError } = await supabase
    .from('caption_votes')
    .select('caption_id')
    .eq('profile_id', user.id);

  if (votesError) {
    console.error("Error fetching votes", votesError);
    // Continue anyway, they just might see some they voted on already
  }

  const votedIds = votedCaptions?.map(v => v.caption_id) || [];

  // Fetch captions
  let query = supabase
    .from('captions')
    .select(`
      id,
      content,
      created_datetime_utc,
      like_count,
      images (
        url
      )
    `);

  // Only apply the NOT IN filter if there are actually voted IDs.
  // Using an array syntax might cause URL header overflows if there are thousands of IDs.
  // However, Supabase/PostgREST uses GET for selects, so long arrays in URL parameters break limits.
  // Instead of not.in on potentially thousands of IDs, we fetch 1000 latest and filter in JS
  // if the voted list is too large.

  if (votedIds.length > 0 && votedIds.length < 200) {
    query = query.not('id', 'in', `(${votedIds.join(',')})`);
  }

  const { data: rawCaptions, error } = await query
    .order('created_datetime_utc', { ascending: false })
    .limit(300);

  if (error) {
    console.error('Error fetching captions:', error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  // If we couldn't filter in SQL due to length, filter in JS
  let pendingCaptions = rawCaptions;
  if (votedIds.length >= 200) {
    const votedSet = new Set(votedIds);
    pendingCaptions = rawCaptions?.filter(c => !votedSet.has(c.id)) || [];
  }

  // Just take the first 50 for the UI
  pendingCaptions = pendingCaptions?.slice(0, 50) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto relative pt-8">
        <div className="absolute -top-8 right-0 flex items-center gap-4 z-10">
          <ThemeToggle />
          <SignOutButton />
        </div>

        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight">
              Humor Project
            </h1>
            <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">
              Welcome back, {user.email}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
              ID: {user.id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Upload Image
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <CaptionRater initialCaptions={pendingCaptions as any || []} />
        </div>

      </div>
    </div>
  );
}
