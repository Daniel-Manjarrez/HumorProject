import { createClient } from '@/utils/supabase/server';
import LoginButton from '@/components/LoginButton';

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
    .order('created_datetime_utc', { ascending: false });

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
          </div>
          {/* Optional: Add a Sign Out button here later */}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {captions?.map((caption: Caption) => (
            <div
              key={caption.id}
              className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col border border-gray-100"
            >
              <div className="p-8 flex-grow flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
                <p className="text-gray-800 text-xl font-serif italic text-center leading-relaxed">
                  "{caption.content}"
                </p>
              </div>
              <div className="bg-white px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  {new Date(caption.created_datetime_utc).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <div className="flex items-center text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-sm">{caption.like_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {captions?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No captions found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
