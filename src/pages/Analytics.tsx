import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getHabits, getCompletionsForDate } from '../lib/db';
import { getAchievements } from '../lib/db';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { Habit, HabitCompletion, Achievement } from '../types';
import Header from '../components/Dashboard/Header';
import AnalyticsOverview from '../components/Analytics/AnalyticsOverview';
import StreakCalendar from '../components/Analytics/StreakCalendar';
import CompletionChart from '../components/Analytics/CompletionChart';
import CategoryBreakdown from '../components/Analytics/CategoryBreakdown';
import HealthMetricsAnalytics from '../components/Analytics/HealthMetricsAnalytics';

export default function Analytics() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, timeRange]);

  async function loadData() {
    if (!user) return;
    setLoading(true);

    try {
      const habitsData = await getHabits(user.id);
      setHabits(habitsData);

      // Load completions for the selected time range
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      if (timeRange === 'week') {
        startDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
      } else if (timeRange === 'month') {
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
      } else {
        startDate = new Date(2020, 0, 1); // All time
        endDate = today;
      }

      const dates: string[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const allCompletions = await Promise.all(
        dates.map((date) => getCompletionsForDate(user.id, date))
      );
      setCompletions(allCompletions.flat());

      const achievementsData = await getAchievements(user.id);
      setAchievements(achievementsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate completion count and percentage for the selected time range
  const completedCount = completions.filter((c) => c.completed).length;
  
  // For week/month views, calculate expected completions based on time range
  let expectedCompletions = 0;
  if (timeRange === 'week') {
    expectedCompletions = habits.length * 7; // 7 days in a week
  } else if (timeRange === 'month') {
    const today = new Date();
    const daysInMonth = endOfMonth(today).getDate();
    expectedCompletions = habits.length * daysInMonth;
  } else {
    // All time - use actual days tracked
    const uniqueDates = new Set(completions.map(c => c.completion_date));
    expectedCompletions = habits.length * (uniqueDates.size || 1);
  }
  
  const completionPercentage =
    expectedCompletions > 0 ? Math.round((completedCount / expectedCompletions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        user={user}
        selectedDate={new Date()}
        completionPercentage={completionPercentage}
        completedCount={completedCount}
        totalCount={habits.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnalyticsOverview
              user={user}
              habits={habits}
              completions={completions}
              achievements={achievements}
            />
            <StreakCalendar completions={completions} habits={habits} timeRange={timeRange} />
            <CompletionChart completions={completions} habits={habits} timeRange={timeRange} />
            <CategoryBreakdown habits={habits} completions={completions} />
            {user && <HealthMetricsAnalytics userId={user.id} timeRange={timeRange} />}
          </div>
        )}
      </div>
    </div>
  );
}

