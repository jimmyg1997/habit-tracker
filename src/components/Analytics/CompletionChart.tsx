import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, compareAsc, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import type { Habit, HabitCompletion } from '../../types';

interface CompletionChartProps {
  completions: HabitCompletion[];
  habits: Habit[];
  timeRange?: 'week' | 'month' | 'all';
}

export default function CompletionChart({ completions, habits, timeRange = 'month' }: CompletionChartProps) {
  // Filter completions based on timeRange
  const today = new Date();
  let dateRange: Date[] = [];
  
  if (timeRange === 'week') {
    const startDate = startOfWeek(today, { weekStartsOn: 1 });
    const endDate = endOfWeek(today, { weekStartsOn: 1 });
    dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  } else if (timeRange === 'month') {
    const startDate = startOfMonth(today);
    const endDate = endOfMonth(today);
    dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  }
  
  const dateStrSet = timeRange === 'all' ? null : new Set(dateRange.map(d => format(d, 'yyyy-MM-dd')));
  
  const completionsByDate = new Map<string, number>();
  completions.forEach((c) => {
    if (c.completed) {
      // If timeRange is 'all', include all. Otherwise, only include dates in range
      if (dateStrSet === null || dateStrSet.has(c.completion_date)) {
        const count = completionsByDate.get(c.completion_date) || 0;
        completionsByDate.set(c.completion_date, count + 1);
      }
    }
  });

  // For week/month views, include all days in range (even with 0 completions)
  let data: Array<{ date: string; dateISO: string; completions: number }>;
  
  if (timeRange === 'week' || timeRange === 'month') {
    data = dateRange.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, timeRange === 'week' ? 'EEE' : 'MMM d'),
        dateISO: dateStr,
        completions: completionsByDate.get(dateStr) || 0,
      };
    });
  } else {
    // All time - only show days with completions
    data = Array.from(completionsByDate.entries())
      .map(([date, count]) => ({
        date: format(parseISO(date), 'MMM d'),
        dateISO: date,
        completions: count,
      }))
      .sort((a, b) => compareAsc(parseISO(a.dateISO), parseISO(b.dateISO)));
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Daily Completions
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="completions"
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ fill: '#6366F1', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


