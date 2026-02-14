'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitVote(captionId: string, voteValue: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Check if a vote already exists for this user and caption
  const { data: existingVote, error: fetchError } = await supabase
    .from('caption_votes')
    .select('id')
    .eq('profile_id', user.id)
    .eq('caption_id', captionId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
    console.error('Error checking existing vote:', fetchError)
    throw new Error('Failed to check vote status')
  }

  if (existingVote) {
    // UPDATE existing vote
    const { error } = await supabase
      .from('caption_votes')
      .update({
        vote_value: voteValue,
        modified_datetime_utc: new Date().toISOString()
      })
      .eq('id', existingVote.id)

    if (error) {
      console.error('Error updating vote:', error)
      throw new Error('Failed to update vote')
    }
  } else {
    // INSERT new vote
    const { error } = await supabase
      .from('caption_votes')
      .insert({
        profile_id: user.id,
        caption_id: captionId,
        vote_value: voteValue,
        created_datetime_utc: new Date().toISOString(),
        modified_datetime_utc: new Date().toISOString()
      })

    if (error) {
      console.error('Error inserting vote:', error)
      throw new Error('Failed to insert vote')
    }
  }

  revalidatePath('/')
}
