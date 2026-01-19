import { Trophy, Flame, TrendingUp, Target } from 'lucide-react';
import { format, parseISO, subDays, isAfter, isBefore } from 'date-fns';
import type { User, Habit, HabitCompletion, Achievement } from '../../types';

interface AnalyticsOverviewProps {
  user: User | null;
  habits: Habit[];
  completions: HabitCompletion[];
  achievements: Achievement[];
}

export default function AnalyticsOverview({
  user,
  habits,
  completions,
  achievements,
}: AnalyticsOverviewProps) {
  if (!user) return null;

  const totalCompletions = completions.filter((c) => c.completed).length;
  // Calculate completion rate: total completions / (habits * days tracked)
  const uniqueDates = new Set(completions.map(c => c.completion_date));
  const daysTracked = uniqueDates.size || 1;
  const expectedCompletions = habits.length * daysTracked;
  const completionRate =
    expectedCompletions > 0
      ? Math.round((totalCompletions / expectedCompletions) * 100)
      : 0;

  const xpForNextLevel = (user.current_level + 1) ** 2 * 100;
  const xpProgress = ((user.total_xp % (user.current_level ** 2 * 100)) / (xpForNextLevel - user.current_level ** 2 * 100)) * 100;

  // Calculate best streak from completions data
  const calculateBestStreak = () => {
    if (completions.length === 0) return 0;
    
    // Get all unique dates with completions, sorted
    const datesWithCompletions = new Set<string>();
    completions.forEach((c) => {
      if (c.completed) {
        datesWithCompletions.add(c.completion_date);
      }
    });
    
    if (datesWithCompletions.size === 0) return 0;
    
    const sortedDates = Array.from(datesWithCompletions)
      .map(d => parseISO(d))
      .sort((a, b) => a.getTime() - b.getTime());
    
    let bestStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
      } else {
        // Gap found, update best streak and reset
        bestStreak = Math.max(bestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    // Check final streak
    bestStreak = Math.max(bestStreak, currentStreak);
    
    return bestStreak;
  };

  const bestStreak = calculateBestStreak();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <Trophy className="w-8 h-8 text-warning" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            Level {user.current_level}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {user.total_xp} total XP
        </p>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <Flame className="w-8 h-8 text-warning" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.current_streak}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Best: {bestStreak} days
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <Target className="w-8 h-8 text-success" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalCompletions}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Completions</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {achievements.length}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Achievements</p>
      </div>
    </div>
  );
}


