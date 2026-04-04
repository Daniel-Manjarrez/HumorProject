import { requireUser } from '@/utils/auth';
import Link from 'next/link';
import CaptionRater from '@/components/CaptionRater';
import { createClient } from '@/utils/supabase/server';
import { ThemeToggle } from '@/components/ThemeToggle';
import SignOutButton from '@/components/SignOutButton';

export default async function RatePage() {
  const user = await requireUser();
  const supabase = await createClient();

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
      *,
      images (
        url,
        image_description
      )
    `);

  // Only apply the NOT IN filter if there are actually voted IDs.
  // Supabase's not.in can fail if the array is empty or malformed in JS client
  if (votedIds.length > 0) {
    query = query.not('id', 'in', `(${votedIds.join(',')})`);
  }

  const { data: pendingCaptions, error } = await query.limit(20);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Error Loading Captions</h2>
          <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <ThemeToggle />
        <SignOutButton />
      </div>

      <div className="max-w-5xl mx-auto relative pt-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 font-medium">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Rate Captions</h1>

        <CaptionRater initialCaptions={pendingCaptions || []} />
      </div>
    </div>
  );
}
