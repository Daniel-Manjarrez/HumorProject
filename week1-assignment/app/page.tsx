import { createClient } from '@/utils/supabase/server';
import LoginButton from '@/components/LoginButton';
import SignOutButton from '@/components/SignOutButton';
import CaptionRater from '@/components/CaptionRater';

// Define the shape of our data
type Caption = {
  id: string;
  content: string;
  created_datetime_utc: string;
  like_count: number;
};

export default async function Home() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Humor Project
            </h1>
            <p className="mt-4 text-lg text-gray-600">
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

  // Fetch data
  const { data: captions, error } = await supabase
    .from('captions')
    .select('id, content, created_datetime_utc, like_count')
    .order('created_datetime_utc', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching captions:', error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Humor Project
            </h1>
            <p className="mt-2 text-xl text-gray-500">
              Welcome back, {user.email}
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              ID: {user.id}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-8">
          <CaptionRater captions={captions || []} />
        </div>

      </div>
    </div>
  );
}
