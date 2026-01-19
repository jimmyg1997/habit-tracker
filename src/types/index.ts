export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  theme_preference: 'light' | 'dark' | null;
  created_at: string;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  current_level: number;
}

export type HabitImportance = 'low' | 'medium' | 'high' | 'critical';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  category: string;
  estimated_minutes: number;
  order_index: number;
  is_archived: boolean;
  created_at: string;
  times_per_week?: number | null; // How many times per week this habit should be done
  importance?: HabitImportance | null; // Importance/priority level
  kpi_type?: string | null; // KPI type (e.g., 'days', 'times', etc.)
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  completed: boolean;
  actual_minutes: number | null;
  note: string | null;
  completed_at: string | null;
}

export interface AudioRecording {
  id: string;
  url: string;
  duration: number; // in seconds
  timestamp: string;
}

export interface HealthMetrics {
  id: string;
  user_id: string;
  metric_date: string;
  sleep_hours: number | null;
  sleep_quality: number | null;
  hydration_glasses: number | null;
  nutrition_rating: number | null;
  sleep_note: string | null;
  mood_rating: number | null;
  physical_state_rating: number | null;
  journal_note: string | null;
  media_urls: string[] | null; // Array of media file URLs
  audio_recordings: AudioRecording[] | null; // Array of audio recordings
  summary: string | null; // AI-generated summary
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  morning_time: string | null;
  midday_time: string | null;
  evening_time: string | null;
  habit_reminders: Record<string, string> | null;
}

export type HabitCategory = 
  | '📝 Productivity'
  | '🌟 Self-Care'
  | '👥 Social'
  | '📱 Digital'
  | '🧠 Learning'
  | '💪 Workout'
  | '🏋️ Fitness Lifestyle';

export interface DefaultHabit {
  name: string;
  emoji: string;
  category: HabitCategory;
  estimated_minutes: number;
  times_per_week?: number | null;
  importance?: HabitImportance;
  kpi_type?: string;
}

export const DEFAULT_HABITS: DefaultHabit[] = [
  // Productivity
  { name: 'Update this document', emoji: '📝', category: '📝 Productivity', estimated_minutes: 5, times_per_week: 5, importance: 'high', kpi_type: 'days' },
  { name: 'Update Journal(s)', emoji: '📝', category: '📝 Productivity', estimated_minutes: 5, times_per_week: 7, importance: 'high', kpi_type: 'days' },
  { name: 'Meditation', emoji: '📝', category: '📝 Productivity', estimated_minutes: 10, times_per_week: 7, importance: 'critical', kpi_type: 'days' },
  { name: 'Read newsletters', emoji: '📝', category: '📝 Productivity', estimated_minutes: 15, times_per_week: 5, importance: 'medium', kpi_type: 'days' },
  { name: 'Google Review', emoji: '📝', category: '📝 Productivity', estimated_minutes: 5, times_per_week: 1, importance: 'low', kpi_type: 'days' },
  
  // Self-Care
  { name: 'Songs Spotify', emoji: '🎵', category: '🌟 Self-Care', estimated_minutes: 5, times_per_week: 7, importance: 'medium', kpi_type: 'days' },
  { name: 'Skin Care Routine', emoji: '🌟', category: '🌟 Self-Care', estimated_minutes: 5, times_per_week: 7, importance: 'high', kpi_type: 'days' },
  { name: 'Vitamins', emoji: '🌟', category: '🌟 Self-Care', estimated_minutes: 1, times_per_week: 3, importance: 'critical', kpi_type: 'days' },
  { name: 'Water Availability', emoji: '🌟', category: '🌟 Self-Care', estimated_minutes: 0, times_per_week: 7, importance: 'critical', kpi_type: 'days' },
  { name: 'No Sugar', emoji: '🚫', category: '🌟 Self-Care', estimated_minutes: 0, times_per_week: 7, importance: 'high', kpi_type: 'days' },
  { name: 'No Alcohol', emoji: '🚫', category: '🌟 Self-Care', estimated_minutes: 0, times_per_week: 7, importance: 'high', kpi_type: 'days' },
  
  // Social
  { name: 'New Hairstyle', emoji: '👥', category: '👥 Social', estimated_minutes: 0, times_per_week: 1, importance: 'low', kpi_type: 'days' },
  { name: 'Print photos for friends', emoji: '👥', category: '👥 Social', estimated_minutes: 20, times_per_week: 1, importance: 'low', kpi_type: 'days' },
  { name: 'Name Day & Birthday', emoji: '👥', category: '👥 Social', estimated_minutes: 2, times_per_week: 1, importance: 'medium', kpi_type: 'days' },
  
  // Digital
  { name: 'Clean Phone', emoji: '📱', category: '📱 Digital', estimated_minutes: 1, times_per_week: 1, importance: 'low', kpi_type: 'days' },
  
  // Learning
  { name: 'Micro Learning (Kinnu)', emoji: '🧠', category: '🧠 Learning', estimated_minutes: 10, times_per_week: 5, importance: 'high', kpi_type: 'days' },
  { name: 'Duolingo (French, Polish)', emoji: '🧠', category: '🧠 Learning', estimated_minutes: 15, times_per_week: 7, importance: 'high', kpi_type: 'days' },
  { name: 'Play Chess', emoji: '🧠', category: '🧠 Learning', estimated_minutes: 0, times_per_week: 3, importance: 'medium', kpi_type: 'days' },
  { name: 'Leetcode', emoji: '🧠', category: '🧠 Learning', estimated_minutes: 0, times_per_week: 5, importance: 'high', kpi_type: 'days' },
  
  // Workout
  { name: 'Cardio', emoji: '💪', category: '💪 Workout', estimated_minutes: 30, times_per_week: 3, importance: 'high', kpi_type: 'days' },
  { name: 'Strength Training', emoji: '💪', category: '💪 Workout', estimated_minutes: 45, times_per_week: 3, importance: 'high', kpi_type: 'days' },
  { name: 'Stretching', emoji: '💪', category: '💪 Workout', estimated_minutes: 15, times_per_week: 5, importance: 'medium', kpi_type: 'days' },
  
  // Fitness Lifestyle
  { name: 'Morning Run', emoji: '🏃', category: '🏋️ Fitness Lifestyle', estimated_minutes: 30, times_per_week: 3, importance: 'high', kpi_type: 'days' },
  { name: 'Yoga Session', emoji: '🧘', category: '🏋️ Fitness Lifestyle', estimated_minutes: 20, times_per_week: 4, importance: 'medium', kpi_type: 'days' },
  { name: 'Gym Workout', emoji: '🏋️', category: '🏋️ Fitness Lifestyle', estimated_minutes: 60, times_per_week: 3, importance: 'high', kpi_type: 'days' },
  { name: 'Cycling', emoji: '🚴', category: '🏋️ Fitness Lifestyle', estimated_minutes: 45, times_per_week: 2, importance: 'medium', kpi_type: 'days' },
  { name: 'Hiking', emoji: '🥾', category: '🏋️ Fitness Lifestyle', estimated_minutes: 90, times_per_week: 1, importance: 'low', kpi_type: 'days' },
  { name: 'Dance Class', emoji: '💃', category: '🏋️ Fitness Lifestyle', estimated_minutes: 60, times_per_week: 1, importance: 'medium', kpi_type: 'days' },
  { name: 'Pilates', emoji: '🤸', category: '🏋️ Fitness Lifestyle', estimated_minutes: 45, times_per_week: 2, importance: 'high', kpi_type: 'days' },
  { name: 'CrossFit', emoji: '💪', category: '🏋️ Fitness Lifestyle', estimated_minutes: 60, times_per_week: 3, importance: 'critical', kpi_type: 'days' },
  { name: 'Swimming', emoji: '🏊', category: '🏋️ Fitness Lifestyle', estimated_minutes: 45, times_per_week: 2, importance: 'medium', kpi_type: 'days' },
  { name: 'Rock Climbing', emoji: '🧗', category: '🏋️ Fitness Lifestyle', estimated_minutes: 90, times_per_week: 1, importance: 'low', kpi_type: 'days' },
];

