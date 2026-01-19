import { supabase } from './supabase';
import type { User, Habit, HabitCompletion, HealthMetrics, Achievement, NotificationSettings } from '../types';

// User operations
export async function getUser(userId: string, retries: number = 3): Promise<User | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Don't log AbortErrors - they're just cancelled requests
        if (error.message && !error.message.includes('AbortError') && !error.message.includes('signal is aborted')) {
          // Log error details for debugging (only on last attempt)
          if (attempt === retries) {
            console.error('Error fetching user:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            });
          }
        }
        
        // If it's a "not found" error and we have retries left, wait and retry
        if (error.code === 'PGRST116' && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt)); // Exponential backoff
          continue;
        }
        
        return null;
      }
      
      if (data) {
        return data;
      }
    } catch (err: any) {
      // Network errors or other exceptions - retry if attempts left
      if (attempt < retries && !err?.message?.includes('AbortError')) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        continue;
      }
      if (err?.message && !err.message.includes('AbortError')) {
        console.error('Exception fetching user:', err);
      }
      return null;
    }
  }
  
  return null;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    return false;
  }
  return true;
}

// Habit operations
export async function getHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching habits:', error);
    return [];
  }
  return data || [];
}

export async function createHabit(habit: Omit<Habit, 'id' | 'created_at'>): Promise<Habit | null> {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single();

  if (error) {
    console.error('Error creating habit:', error);
    return null;
  }
  return data;
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<boolean> {
  const { error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId);

  if (error) {
    console.error('Error updating habit:', error);
    return false;
  }
  return true;
}

export async function deleteHabit(habitId: string): Promise<boolean> {
  // Archive instead of delete to preserve analytics
  // Only use is_archived since deleted_at may not exist in schema
  const { error } = await supabase
    .from('habits')
    .update({ is_archived: true })
    .eq('id', habitId);

  if (error) {
    console.error('Error archiving habit:', error);
    return false;
  }
  return true;
}

export async function cleanupDuplicateHabits(userId: string): Promise<number> {
  // Get all habits for user
  const { data: habits, error: fetchError } = await supabase
    .from('habits')
    .select('id, name, created_at')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true });

  if (fetchError || !habits) {
    console.error('Error fetching habits for cleanup:', fetchError);
    return 0;
  }

  // Group by name (case-insensitive, trimmed)
  const nameMap = new Map<string, string[]>();
  habits.forEach((habit) => {
    const key = habit.name.toLowerCase().trim();
    if (!nameMap.has(key)) {
      nameMap.set(key, []);
    }
    nameMap.get(key)!.push(habit.id);
  });

  // Find duplicates (keep first, delete rest)
  let deletedCount = 0;
  for (const [name, ids] of nameMap.entries()) {
    if (ids.length > 1) {
      // Keep the first ID (oldest), delete the rest
      const toDelete = ids.slice(1);
      for (const id of toDelete) {
        const success = await deleteHabit(id);
        if (success) {
          deletedCount++;
        }
      }
    }
  }

  return deletedCount;
}

export async function reorderHabits(habitIds: string[]): Promise<boolean> {
  const updates = habitIds.map((id, index) => ({
    id,
    order_index: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('habits')
      .update({ order_index: update.order_index })
      .eq('id', update.id);

    if (error) {
      console.error('Error reordering habits:', error);
      return false;
    }
  }
  return true;
}

// Habit completion operations
export async function getCompletionsForDate(
  userId: string,
  date: string
): Promise<HabitCompletion[]> {
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('completion_date', date);

  if (error) {
    console.error('Error fetching completions:', error);
    return [];
  }
  return data || [];
}

export async function upsertCompletion(
  completion: Omit<HabitCompletion, 'id'>
): Promise<HabitCompletion | null> {
  const { data, error } = await supabase
    .from('habit_completions')
    .upsert(completion, {
      onConflict: 'habit_id,completion_date',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting completion:', error);
    return null;
  }
  return data;
}

// Health metrics operations
export async function getHealthMetricsForDate(
  userId: string,
  date: string
): Promise<HealthMetrics | null> {
  try {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('metric_date', date)
      .maybeSingle(); // Use maybeSingle instead of single to handle not found gracefully

    if (error) {
      // 406 errors are often RLS or format issues - just return null silently
      if (error.code === 'PGRST116' || error.message?.includes('406')) {
        return null;
      }
      // Only log non-406 errors
      if (!error.message?.includes('406') && !error.message?.includes('Not Acceptable')) {
        console.error('Error fetching health metrics:', error);
      }
      return null;
    }
    if (data) {
      // Parse audio_recordings if it's a JSON string
      if (data.audio_recordings && typeof data.audio_recordings === 'string') {
        try {
          data.audio_recordings = JSON.parse(data.audio_recordings);
        } catch (e) {
          console.error('Error parsing audio_recordings:', e);
          data.audio_recordings = null;
        }
      }
    }
    return data || null;
  } catch (err: any) {
    // Silently handle any errors - health metrics are optional
    return null;
  }
}

export async function getHealthMetricsForWeek(
  userId: string,
  dates: string[]
): Promise<Map<string, HealthMetrics>> {
  try {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .in('metric_date', dates);

    if (error) {
      console.error('Error fetching health metrics for week:', error);
      return new Map();
    }

    const metricsMap = new Map<string, HealthMetrics>();
    if (data) {
      data.forEach((metric) => {
        // Parse audio_recordings if it's a JSONB string
        if (metric.audio_recordings && typeof metric.audio_recordings === 'string') {
          try {
            metric.audio_recordings = JSON.parse(metric.audio_recordings);
          } catch (e) {
            console.error('Error parsing audio_recordings:', e);
            metric.audio_recordings = null;
          }
        }
        metricsMap.set(metric.metric_date, metric);
      });
    }
    return metricsMap;
  } catch (err: any) {
    console.error('Exception fetching health metrics for week:', err);
    return new Map();
  }
}

export async function upsertHealthMetrics(
  metrics: Omit<HealthMetrics, 'id'>
): Promise<HealthMetrics | null> {
  try {
    // Log what we're trying to save for debugging
    console.log('Saving health metrics:', {
      user_id: metrics.user_id,
      metric_date: metrics.metric_date,
      has_journal_note: !!metrics.journal_note,
      journal_note_length: metrics.journal_note?.length || 0,
      has_audio_recordings: !!(metrics.audio_recordings && metrics.audio_recordings.length > 0),
      has_summary: !!metrics.summary,
    });

    // Prepare metrics for database - only include fields that exist in the schema
    // If columns don't exist yet, exclude them to avoid 400 errors
    const dbMetrics: any = {
      user_id: metrics.user_id,
      metric_date: metrics.metric_date,
      sleep_hours: metrics.sleep_hours,
      sleep_quality: metrics.sleep_quality,
      hydration_glasses: metrics.hydration_glasses,
      nutrition_rating: metrics.nutrition_rating,
      sleep_note: metrics.sleep_note,
      mood_rating: metrics.mood_rating,
      physical_state_rating: metrics.physical_state_rating,
      journal_note: metrics.journal_note,
      // Only include these if they're provided (columns may not exist yet)
      ...(metrics.media_urls !== undefined && {
        media_urls: Array.isArray(metrics.media_urls) && metrics.media_urls.length > 0 
          ? metrics.media_urls 
          : null
      }),
      ...(metrics.audio_recordings !== undefined && {
        audio_recordings: Array.isArray(metrics.audio_recordings) && metrics.audio_recordings.length > 0 
          ? metrics.audio_recordings 
          : null
      }),
      ...(metrics.summary !== undefined && {
        summary: metrics.summary || null
      }),
    };

    const { data, error } = await supabase
      .from('health_metrics')
      .upsert(dbMetrics, {
        onConflict: 'user_id,metric_date',
      })
      .select()
      .maybeSingle();

    if (error) {
      // Check if it's a column doesn't exist error
      if (error.message?.includes('column') && (error.message?.includes('audio_recordings') || error.message?.includes('summary'))) {
        console.warn('Database columns missing. Please run migration:', error.message);
        console.warn('Run this SQL in Supabase:');
        console.warn(`
ALTER TABLE health_metrics
ADD COLUMN IF NOT EXISTS audio_recordings JSONB,
ADD COLUMN IF NOT EXISTS summary TEXT;
        `);
        
        // Try again without the new columns
        const fallbackMetrics: any = {
          user_id: metrics.user_id,
          metric_date: metrics.metric_date,
          sleep_hours: metrics.sleep_hours,
          sleep_quality: metrics.sleep_quality,
          hydration_glasses: metrics.hydration_glasses,
          nutrition_rating: metrics.nutrition_rating,
          sleep_note: metrics.sleep_note,
          mood_rating: metrics.mood_rating,
          physical_state_rating: metrics.physical_state_rating,
          journal_note: metrics.journal_note,
          media_urls: Array.isArray(metrics.media_urls) && metrics.media_urls.length > 0 
            ? metrics.media_urls 
            : null,
        };
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('health_metrics')
          .upsert(fallbackMetrics, {
            onConflict: 'user_id,metric_date',
          })
          .select()
          .maybeSingle();
        
        if (fallbackError) {
          console.error('Error upserting health metrics (fallback):', fallbackError);
          console.error('Metrics attempted:', metrics);
          return null;
        }
        
        return fallbackData;
      }
      
      // 406 errors - log but don't fail the app
      if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        console.warn('Health metrics update blocked (RLS or format issue):', error.message);
        console.warn('Metrics attempted:', metrics);
        return null;
      }
      console.error('Error upserting health metrics:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Metrics attempted:', JSON.stringify(dbMetrics, null, 2));
      return null;
    }
    
    if (data) {
      // Parse audio_recordings if it's a JSON string (shouldn't happen with JSONB, but handle it)
      if (data.audio_recordings && typeof data.audio_recordings === 'string') {
        try {
          data.audio_recordings = JSON.parse(data.audio_recordings);
        } catch (e) {
          console.error('Error parsing audio_recordings:', e);
          data.audio_recordings = null;
        }
      }
      // Ensure audio_recordings is an array if it exists
      if (data.audio_recordings && !Array.isArray(data.audio_recordings)) {
        data.audio_recordings = null;
      }
      
      console.log('Successfully saved health metrics:', {
        id: data.id,
        metric_date: data.metric_date,
        has_journal_note: !!data.journal_note,
        has_media: !!(data.media_urls && Array.isArray(data.media_urls) && data.media_urls.length > 0),
        has_recordings: !!(data.audio_recordings && Array.isArray(data.audio_recordings) && data.audio_recordings.length > 0),
        has_summary: !!data.summary,
      });
    } else {
      console.warn('No data returned from upsert, but no error');
    }
    
    return data;
  } catch (err: any) {
    console.error('Exception upserting health metrics:', err);
    console.error('Metrics attempted:', metrics);
    return null;
  }
}

// Achievement operations
export async function getAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
  return data || [];
}

export async function createAchievement(
  achievement: Omit<Achievement, 'id'>
): Promise<Achievement | null> {
  const { data, error } = await supabase
    .from('achievements')
    .insert(achievement)
    .select()
    .single();

  if (error) {
    console.error('Error creating achievement:', error);
    return null;
  }
  return data;
}

// Notification settings operations
export async function getNotificationSettings(
  userId: string
): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notification settings:', error);
    return null;
  }
  return data || null;
}

export async function upsertNotificationSettings(
  settings: Omit<NotificationSettings, 'id'>
): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .upsert(settings, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting notification settings:', error);
    return null;
  }
  return data;
}

