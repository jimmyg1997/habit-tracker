import { useState, useEffect } from 'react';
import type { Habit } from '../../types';
import { X } from 'lucide-react';

interface HabitFormProps {
  habit: Habit | null;
  onSave: (data: Omit<Habit, 'id' | 'user_id' | 'created_at'>) => void;
  onCancel: () => void;
}

const CATEGORIES: string[] = [
  '📝 Productivity',
  '🌟 Self-Care',
  '👥 Social',
  '📱 Digital',
  '🧠 Learning',
  '💪 Workout',
  '🏋️ Fitness Lifestyle',
];

const EMOJIS = [
  '📝', '📔', '🧘', '📰', '⭐', '🎵', '✨', '💊', '💧', '🚫', '🍷',
  '💇', '🖼️', '🎂', '📱', '📚', '🌍', '♟️', '💻', '🏃', '🧠', '📖',
];

export default function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [emoji, setEmoji] = useState(habit?.emoji || '📝');
  const [category, setCategory] = useState(habit?.category || CATEGORIES[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(habit?.estimated_minutes || 5);
  const [timesPerWeek, setTimesPerWeek] = useState(habit?.times_per_week || 7);
  const [importance, setImportance] = useState<'low' | 'medium' | 'high' | 'critical' | null>(habit?.importance || 'medium');
  const [kpiType, setKpiType] = useState(habit?.kpi_type || 'days');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      emoji,
      category,
      estimated_minutes: estimatedMinutes,
      times_per_week: timesPerWeek,
      importance: importance || null,
      kpi_type: kpiType || 'days',
      order_index: habit?.order_index || 0,
      is_archived: false,
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {habit ? 'Edit Habit' : 'New Habit'}
        </h3>
        <button
          onClick={onCancel}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Habit Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder="e.g., Morning Meditation"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-2xl p-2 rounded-lg transition-colors ${
                  emoji === e
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estimated Minutes
          </label>
          <input
            type="number"
            min="0"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Times Per Week
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={timesPerWeek}
            onChange={(e) => setTimesPerWeek(parseInt(e.target.value) || 7)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            How many times per week should this habit be completed? (1-7)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Importance / Priority
          </label>
          <select
            value={importance || 'medium'}
            onChange={(e) => setImportance(e.target.value as 'low' | 'medium' | 'high' | 'critical' | null)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical ⚠️</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Set the priority level for this habit. Critical habits will be highlighted.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            KPI Type
          </label>
          <select
            value={kpiType}
            onChange={(e) => setKpiType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="days">Days</option>
            <option value="times">Times</option>
            <option value="hours">Hours</option>
            <option value="minutes">Minutes</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            The unit of measurement for tracking this habit.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          >
            {habit ? 'Update' : 'Create'} Habit
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

