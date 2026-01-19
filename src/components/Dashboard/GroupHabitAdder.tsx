import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import type { HabitCategory, HabitImportance } from '../../types';
import EmojiPicker from './EmojiPicker';

interface HabitInput {
  name: string;
  emoji: string;
  category: HabitCategory;
  estimatedMinutes: number;
  importance: HabitImportance;
}

interface GroupHabitAdderProps {
  onAddBatch: (habits: Array<{ category: string; name: string; emoji: string; estimatedMinutes: number; importance: HabitImportance }>) => void;
  onClose: () => void;
}

const CATEGORIES: HabitCategory[] = [
  '📝 Productivity',
  '🌟 Self-Care',
  '👥 Social',
  '📱 Digital',
  '🧠 Learning',
  '💪 Workout',
  '🏋️ Fitness Lifestyle',
];

export default function GroupHabitAdder({ onAddBatch, onClose }: GroupHabitAdderProps) {
  const [habits, setHabits] = useState<HabitInput[]>([
    { name: '', emoji: '📋', category: '📝 Productivity', estimatedMinutes: 5, importance: 'medium' },
  ]);

  const addHabit = () => {
    setHabits([...habits, { name: '', emoji: '📋', category: '📝 Productivity', estimatedMinutes: 5, importance: 'medium' }]);
  };

  const removeHabit = (index: number) => {
    setHabits(habits.filter((_, i) => i !== index));
  };

  const updateHabit = (index: number, updates: Partial<HabitInput>) => {
    setHabits(habits.map((h, i) => (i === index ? { ...h, ...updates } : h)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validHabits = habits.filter(h => h.name.trim());
    if (validHabits.length === 0) {
      return;
    }

    onAddBatch(validHabits.map(h => ({
      category: h.category,
      name: h.name.trim(),
      emoji: h.emoji,
      estimatedMinutes: h.estimatedMinutes,
      importance: h.importance,
    })));

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {habits.map((habit, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <EmojiPicker
              value={habit.emoji}
              onChange={(emoji) => updateHabit(index, { emoji })}
            />
            <input
              type="text"
              value={habit.name}
              onChange={(e) => updateHabit(index, { name: e.target.value })}
              placeholder="Habit name..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
            <select
              value={habit.category}
              onChange={(e) => updateHabit(index, { category: e.target.value as HabitCategory })}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              max="300"
              value={habit.estimatedMinutes}
              onChange={(e) => updateHabit(index, { estimatedMinutes: parseInt(e.target.value) || 0 })}
              className="w-20 px-2 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center"
              placeholder="Min"
            />
            <select
              value={habit.importance}
              onChange={(e) => updateHabit(index, { importance: e.target.value as HabitImportance })}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            {habits.length > 1 && (
              <button
                type="button"
                onClick={() => removeHabit(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
        <button
          type="button"
          onClick={addHabit}
          className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Another Habit
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          >
            Add {habits.filter(h => h.name.trim()).length} Habit{habits.filter(h => h.name.trim()).length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </form>
  );
}

