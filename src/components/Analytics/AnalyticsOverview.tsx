import { Trophy, Flame, TrendingUp, Target } from 'lucide-react';
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
          Best: {user.longest_streak} days
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


