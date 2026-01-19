import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  reorderHabits,
} from '../../lib/db';
import { DEFAULT_HABITS } from '../../types';
import type { Habit } from '../../types';
import { Plus, Edit2, Trash2, GripVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';
import HabitForm from './HabitForm';

export default function HabitManager() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  async function loadHabits() {
    if (!user) return;
    const data = await getHabits(user.id);
    setHabits(data);
    setLoading(false);
  }

  async function handleCreateHabit(habitData: Omit<Habit, 'id' | 'user_id' | 'created_at'>) {
    if (!user) return;

    const newHabit: Omit<Habit, 'id' | 'created_at'> = {
      ...habitData,
      user_id: user.id,
      order_index: habits.length,
    };

    const result = await createHabit(newHabit);
    if (result) {
      setHabits([...habits, result]);
      setShowForm(false);
      toast.success('Habit created!');
    } else {
      toast.error('Failed to create habit');
    }
  }

  async function handleUpdateHabit(habitId: string, updates: Partial<Habit>) {
    const success = await updateHabit(habitId, updates);
    if (success) {
      setHabits(habits.map((h) => (h.id === habitId ? { ...h, ...updates } : h)));
      setEditingHabit(null);
      toast.success('Habit updated!');
    } else {
      toast.error('Failed to update habit');
    }
  }

  async function handleDeleteHabit(habitId: string) {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    const success = await deleteHabit(habitId);
    if (success) {
      setHabits(habits.filter((h) => h.id !== habitId));
      toast.success('Habit deleted');
    } else {
      toast.error('Failed to delete habit');
    }
  }

  async function handleAddDefaults() {
    if (!user) return;

    if (
      !confirm(
        'This will add all default habits. Existing habits will be preserved. Continue?'
      )
    ) {
      return;
    }

    const existingNames = new Set(habits.map((h) => h.name));
    const toAdd = DEFAULT_HABITS.filter((h) => !existingNames.has(h.name));

    let orderIndex = habits.length;
    for (const defaultHabit of toAdd) {
      const newHabit: Omit<Habit, 'id' | 'created_at'> = {
        user_id: user.id,
        name: defaultHabit.name,
        emoji: defaultHabit.emoji,
        category: defaultHabit.category,
        estimated_minutes: defaultHabit.estimated_minutes,
        times_per_week: defaultHabit.times_per_week || 7,
        importance: defaultHabit.importance || 'medium',
        kpi_type: defaultHabit.kpi_type || 'days',
        order_index: orderIndex++,
        is_archived: false,
      };

      const result = await createHabit(newHabit);
      if (result) {
        setHabits((prev) => [...prev, result]);
      }
    }

    toast.success(`Added ${toAdd.length} default habits!`);
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Habit Management</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddDefaults}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm"
          >
            Add Defaults
          </button>
          <button
            onClick={() => {
              setEditingHabit(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <HabitForm
            habit={editingHabit}
            onSave={(data) => {
              if (editingHabit) {
                handleUpdateHabit(editingHabit.id, data);
              } else {
                handleCreateHabit(data);
              }
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingHabit(null);
            }}
          />
        </div>
      )}

      <div className="space-y-2">
        {habits.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No habits yet. Add your first habit or use the default set!
          </p>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
            >
              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
              <span className="text-xl">{habit.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{habit.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {habit.category} • {habit.estimated_minutes} min
                  {habit.times_per_week && ` • ${habit.times_per_week}/week`}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingHabit(habit);
                  setShowForm(true);
                }}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteHabit(habit.id)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

