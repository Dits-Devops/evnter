import { createServerClient } from './supabase';

export async function createNotification(
  userId: string,
  type: 'schedule_change' | 'approval_accepted' | 'approval_rejected' | 'general',
  message: string,
  actionUrl?: string
) {
  try {
    const supabase = createServerClient();
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      message,
      action_url: actionUrl,
    });
  } catch (error) {
    console.error('Failed to create notification', error);
  }
}
