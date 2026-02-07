'use client';

import { createClient } from '@/utils/supabase/client';

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 bg-white text-gray-700 font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google Logo"
        className="w-6 h-6"
      />
      <span>Sign in with Google</span>
    </button>
  );
}
