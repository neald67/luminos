import { supabase } from './supabase';
import type { Profile } from './types';

/**
 * Fetch the currently authenticated user's full profile,
 * including their interests.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*, profile_interests(interest)')
    .eq('id', user.id)
    .single();
  return data as Profile | null;
}

/**
 * Sign the current user out of all sessions.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
