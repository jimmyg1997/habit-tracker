import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Habit, HabitCompletion } from '../../types';
import { extractNameFromCategory } from '../../utils/categoryUtils';

interface CategoryBreakdownProps {
  habits: Habit[];
  completions: HabitCompletion[];
}

export default function CategoryBreakdown({ habits, completions }: CategoryBreakdownProps) {
  const categoryStats = new Map<string, { completed: number; color: string }>();

  habits.forEach((habit) => {
    const stats = categoryStats.get(habit.category) || { completed: 0, color: '#6366F1' };
    // Count all completed instances for this habit
    const habitCompletions = completions.filter((c) => c.habit_id === habit.id && c.completed);
    stats.completed += habitCompletions.length;
    categoryStats.set(habit.category, stats);
  });

  const data = Array.from(categoryStats.entries())
    .map(([category, stats]) => ({
      category: extractNameFromCategory(category),
      completed: stats.completed,
    }))
    .filter(item => item.completed > 0 || habits.some(h => extractNameFromCategory(h.category) === item.category)) // Show all categories with habits
    .sort((a, b) => b.completed - a.completed); // Sort by completed count

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Category Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis 
            type="category" 
            dataKey="category" 
            stroke="#6b7280" 
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} completions`,
              'Completed'
            ]}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="completed" fill="#6366F1" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#6366F1" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


