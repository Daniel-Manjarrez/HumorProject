import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  return user;
}