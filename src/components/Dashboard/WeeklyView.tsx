import { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Calendar, AlertTriangle, Plus, Edit2, X, Trash2, GripVertical, Pencil, Settings, MoreVertical } from 'lucide-react';
import type { Habit, HabitCompletion, HabitImportance } from '../../types';
import HabitNote from './HabitNote';
import TimeSlider from './TimeSlider';
import EmojiPicker from './EmojiPicker';
import CategoryCreator from './CategoryCreator';
import { extractEmojiFromCategory, extractNameFromCategory, createCategoryString, getCategoryColor, getCategoryColorIndex, getCategoryRGB, PASTEL_COLORS } from '../../utils/categoryUtils';
import ColorPaletteSlider from './ColorPaletteSlider';
import toast from 'react-hot-toast';

interface WeeklyViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onToggle: (habitId: string, date: string, completed: boolean, actualMinutes?: number) => void;
  onUpdate: (completionId: string, updates: Partial<HabitCompletion>) => void;
  selectedWeek: Date;
  onWeekChange: (week: Date) => void;
  onHabitUpdate?: (habitId: string, updates: Partial<Habit>) => void;
  onHabitCreate?: (category: string, habitName: string, estimatedMinutes: number, importance: HabitImportance, emoji?: string) => void;
  onHabitCreateBatch?: (habits: Array<{ category: string; name: string; emoji: string; estimatedMinutes: number; importance: HabitImportance }>) => void;
  onHabitDelete?: (habitId: string) => void;
  onHabitReorder?: (habitId: string, direction: 'up' | 'down') => void;
  onHabitReorderToPosition?: (draggedHabitId: string, targetHabitId: string) => void;
  onCategoryCreate?: (categoryName: string, emoji: string, colorIndex: number, rgbColor?: { r: number; g: number; b: number } | null) => void;
  onCategoryReorder?: (categoryName: string, direction: 'up' | 'down') => void;
  onCategoryReorderToPosition?: (draggedCategory: string, targetCategory: string) => void;
  onCategoryRename?: (oldCategory: string, newCategory: string, newEmoji: string) => void;
  onCategoryDelete?: (categoryName: string) => void;
}

const HABIT_SUGGESTIONS: Record<string, Array<{ name: string; emoji: string; minutes: number }>> = {
  '📝 Productivity': [
    { name: 'Morning Pages', emoji: '📔', minutes: 10 },
    { name: 'Review Goals', emoji: '🎯', minutes: 5 },
    { name: 'Plan Day', emoji: '📋', minutes: 5 },
    { name: 'Read Article', emoji: '📰', minutes: 15 },
  ],
  '🌟 Self-Care': [
    { name: 'Yoga', emoji: '🧘', minutes: 20 },
    { name: 'Read Book', emoji: '📖', minutes: 20 },
    { name: 'Take Walk', emoji: '🚶', minutes: 15 },
    { name: 'Meditation', emoji: '🧘', minutes: 10 },
  ],
  '👥 Social': [
    { name: 'Call Family', emoji: '📞', minutes: 15 },
    { name: 'Meet Friend', emoji: '👋', minutes: 60 },
    { name: 'Send Message', emoji: '💬', minutes: 5 },
  ],
  '📱 Digital': [
    { name: 'Backup Photos', emoji: '📸', minutes: 10 },
    { name: 'Organize Files', emoji: '📁', minutes: 15 },
    { name: 'Update Apps', emoji: '📲', minutes: 5 },
  ],
  '🧠 Learning': [
    { name: 'Read Tutorial', emoji: '📚', minutes: 20 },
    { name: 'Practice Coding', emoji: '💻', minutes: 30 },
    { name: 'Watch Course', emoji: '🎓', minutes: 30 },
  ],
  '💪 Workout': [
    { name: 'Cardio', emoji: '🏃', minutes: 30 },
    { name: 'Strength Training', emoji: '💪', minutes: 45 },
    { name: 'Stretching', emoji: '🤸', minutes: 15 },
    { name: 'Swimming', emoji: '🏊', minutes: 30 },
  ],
  '🏋️ Fitness Lifestyle': [
    { name: 'Morning Run', emoji: '🏃', minutes: 30 },
    { name: 'Yoga Session', emoji: '🧘', minutes: 45 },
    { name: 'Gym Workout', emoji: '🏋️', minutes: 60 },
    { name: 'Cycling', emoji: '🚴', minutes: 45 },
    { name: 'Hiking', emoji: '🥾', minutes: 120 },
    { name: 'Dance Class', emoji: '💃', minutes: 60 },
    { name: 'Pilates', emoji: '🧘‍♀️', minutes: 45 },
    { name: 'CrossFit', emoji: '💪', minutes: 60 },
  ],
};

function getImportanceColor(importance?: string | null): string {
  switch (importance) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'high':
      return 'text-orange-600 dark:text-orange-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'low':
      return 'text-gray-500 dark:text-gray-400';
    default:
      return 'text-gray-400 dark:text-gray-500';
  }
}

function getPercentageColor(percentage: number): string {
  if (percentage === 0) return 'bg-red-500/20 text-red-700 dark:text-red-400';
  if (percentage < 50) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
  if (percentage < 100) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
  return 'bg-green-500/20 text-green-700 dark:text-green-400';
}

export default function WeeklyView({
  habits,
  completions,
  onToggle,
  onUpdate,
  selectedWeek,
  onWeekChange,
  onHabitUpdate,
  onHabitCreate,
  onHabitCreateBatch,
  onHabitDelete,
  onHabitReorder,
  onHabitReorderToPosition,
  onCategoryCreate,
  onCategoryReorder,
  onCategoryReorderToPosition,
  onCategoryRename,
  onCategoryDelete,
}: WeeklyViewProps) {
  const [expandedHabit, setExpandedHabit] = useState<{ habitId: string; date: string } | null>(null);
  const [editingHabit, setEditingHabit] = useState<{ habitId: string; field: 'kpi' | 'estimated' | 'importance' } | null>(null);
  const [editValues, setEditValues] = useState<{ kpi: string; estimated: number; importance: HabitImportance }>({ kpi: 'days', estimated: 7, importance: 'medium' });
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [quickAddInputs, setQuickAddInputs] = useState<Record<string, { name: string; emoji: string; minutes: number; importance: HabitImportance }>>({});
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [showAdvancedColumns, setShowAdvancedColumns] = useState<Record<string, boolean>>({});
  const [habitMenuOpen, setHabitMenuOpen] = useState<string | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [draggedHabit, setDraggedHabit] = useState<Habit | null>(null);
  const [dragOverHabit, setDragOverHabit] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ category: string; name: string; emoji: string; colorIndex: number; rgbColor?: { r: number; g: number; b: number } | null } | null>(null);
  const [editingHabitName, setEditingHabitName] = useState<{ habitId: string; name: string; emoji: string } | null>(null);

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const completionsByHabitAndDate = useMemo(() => {
    const map = new Map<string, Map<string, HabitCompletion>>();
    completions.forEach((c) => {
      if (!map.has(c.habit_id)) {
        map.set(c.habit_id, new Map());
      }
      map.get(c.habit_id)!.set(c.completion_date, c);
    });
    return map;
  }, [completions]);

  const handleToggle = (habitId: string, date: string, completed: boolean, actualMinutes?: number) => {
    onToggle(habitId, date, completed, actualMinutes);
  };

  const handleUpdate = (completionId: string, updates: Partial<HabitCompletion>) => {
    onUpdate(completionId, updates);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    onWeekChange(direction === 'prev' ? subWeeks(selectedWeek, 1) : addWeeks(selectedWeek, 1));
  };

  const habitsByCategory = useMemo(() => {
    // Deduplicate habits by ID first
    const uniqueHabits = new Map<string, Habit>();
    habits.forEach((habit) => {
      if (!uniqueHabits.has(habit.id)) {
        uniqueHabits.set(habit.id, habit);
      }
    });
    const deduplicatedHabits = Array.from(uniqueHabits.values());
    
    const grouped: Record<string, Habit[]> = {};
    deduplicatedHabits.forEach((habit) => {
      if (!grouped[habit.category]) {
        grouped[habit.category] = [];
      }
      grouped[habit.category].push(habit);
    });
    Object.keys(grouped).forEach((cat) => {
      grouped[cat].sort((a, b) => {
        // First sort by order_index (for manual reordering)
        if (a.order_index !== b.order_index) {
          return a.order_index - b.order_index;
        }
        // Then by importance
        const importanceOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aOrder = importanceOrder[a.importance as keyof typeof importanceOrder] ?? 4;
        const bOrder = importanceOrder[b.importance as keyof typeof importanceOrder] ?? 4;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
      });
    });
    return grouped;
  }, [habits]);

  const handleEditStart = (habit: Habit, field: 'kpi' | 'estimated' | 'importance') => {
    setEditingHabit({ habitId: habit.id, field });
    setEditValues({
      kpi: habit.kpi_type || 'days',
      estimated: habit.times_per_week || 7,
      importance: (habit.importance || 'medium') as HabitImportance,
    });
  };

  const handleEditSave = (habit: Habit) => {
    if (!onHabitUpdate || !editingHabit) return;
    
    const updates: Partial<Habit> = {};
    if (editingHabit.field === 'kpi') {
      updates.kpi_type = editValues.kpi;
    } else if (editingHabit.field === 'estimated') {
      updates.times_per_week = editValues.estimated;
    } else if (editingHabit.field === 'importance') {
      updates.importance = editValues.importance;
    }
    
    onHabitUpdate(habit.id, updates);
    setEditingHabit(null);
    toast.success('Habit updated!');
  };

  const handleDelete = (habit: Habit) => {
    if (!onHabitDelete) return;
    if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
      onHabitDelete(habit.id);
      toast.success(`Deleted "${habit.name}"`);
    }
  };

  const handleDragStart = (e: React.DragEvent, habit: Habit) => {
    setDraggedHabit(habit);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', habit.id);
    // Make the drag image semi-transparent
    if (e.dataTransfer.setDragImage) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.5';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, habitId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverHabit(habitId);
  };

  const handleDragLeave = () => {
    setDragOverHabit(null);
  };

  const handleDrop = (e: React.DragEvent, targetHabit: Habit) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverHabit(null);
    
    if (!draggedHabit || !onHabitReorder || draggedHabit.id === targetHabit.id) {
      setDraggedHabit(null);
      return;
    }

    // Only allow reordering within the same category
    if (draggedHabit.category !== targetHabit.category) {
      setDraggedHabit(null);
      return;
    }

    // Find positions within the same category
    const categoryHabits = habitsByCategory[targetHabit.category] || [];
    const draggedIndex = categoryHabits.findIndex(h => h.id === draggedHabit.id);
    const targetIndex = categoryHabits.findIndex(h => h.id === targetHabit.id);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      setDraggedHabit(null);
      return;
    }

    // Use direct position swap if available, otherwise use step-by-step
    if (onHabitReorderToPosition) {
      onHabitReorderToPosition(draggedHabit.id, targetHabit.id);
      setDraggedHabit(null);
      toast.success('Habit reordered!');
    } else if (onHabitReorder) {
      // Fallback: move step by step
      const direction = draggedIndex < targetIndex ? 'down' : 'up';
      const steps = Math.abs(targetIndex - draggedIndex);
      
      // Use setTimeout chain instead of await in loop
      const moveSteps = (step: number) => {
        if (step >= steps) {
          setDraggedHabit(null);
          toast.success('Habit reordered!');
          return;
        }
        
        onHabitReorder(draggedHabit.id, direction);
        
        if (step < steps - 1) {
          setTimeout(() => moveSteps(step + 1), 150);
        } else {
          setDraggedHabit(null);
          toast.success('Habit reordered!');
        }
      };
      
      moveSteps(0);
    }
  };

  const handleDragEnd = () => {
    setDraggedHabit(null);
    setDragOverHabit(null);
  };

  // Category drag and drop handlers
  const handleCategoryDragStart = (e: React.DragEvent, category: string) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', category);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleCategoryDragOver = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (draggedCategory && draggedCategory !== category) {
      setDragOverCategory(category);
    }
  };

  const handleCategoryDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(null);
    
    if (!draggedCategory || !onCategoryReorderToPosition || draggedCategory === targetCategory) {
      setDraggedCategory(null);
      return;
    }

    if (onCategoryReorderToPosition) {
      onCategoryReorderToPosition(draggedCategory, targetCategory);
      setDraggedCategory(null);
      toast.success('Category reordered!');
    }
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  const handleEditCancel = () => {
    setEditingHabit(null);
  };

  const handleQuickAdd = (category: string, suggestion: typeof HABIT_SUGGESTIONS[string][0]) => {
    if (onHabitCreate) {
      onHabitCreate(category, suggestion.name, suggestion.minutes, 'medium', suggestion.emoji);
    }
    setShowAddMenu(null);
  };

  const handleQuickAddSubmit = async (category: string) => {
    const input = quickAddInputs[category];
    if (!input || !input.name.trim()) return;
    
    const newHabitName = input.name.trim();
    const estimatedMinutes = input.minutes || 5;
    const importance = input.importance || 'medium';
    const emoji = input.emoji || '📋';
    
    // Clear the input
    setQuickAddInputs({ ...quickAddInputs, [category]: { name: '', emoji: '📋', minutes: 5, importance: 'medium' } });
    
    if (onHabitCreate) {
      onHabitCreate(category, newHabitName, estimatedMinutes, importance, emoji);
    }
  };

  // Calculate expanded habit modal data
  const expandedHabitData = useMemo(() => {
    if (!expandedHabit) return null;
    const habit = habits.find(h => h.id === expandedHabit.habitId);
    if (!habit) return null;
    const habitCompletions = completionsByHabitAndDate.get(expandedHabit.habitId);
    const completion = habitCompletions?.get(expandedHabit.date);
    return { habit, completion };
  }, [expandedHabit, habits, completionsByHabitAndDate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setHabitMenuOpen(null);
    };
    if (habitMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [habitMenuOpen]);

  return (
    <div className="space-y-3">
      {/* Week Navigation and Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          {onCategoryCreate && (
            <button
              onClick={() => setShowCategoryCreator(true)}
              className="px-4 py-2 bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-primary-light rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
          </div>

          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Category Creator Modal */}
      <AnimatePresence>
        {showCategoryCreator && onCategoryCreate && (
          <CategoryCreator
            onCreate={(categoryName, emoji, colorIndex, rgbColor) => {
              onCategoryCreate(categoryName, emoji, colorIndex, rgbColor);
              setShowCategoryCreator(false);
            }}
            onClose={() => setShowCategoryCreator(false)}
          />
        )}
      </AnimatePresence>

      {/* Habit Rename Modal */}
      <AnimatePresence>
        {editingHabitName && onHabitUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingHabitName(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg shadow-xl border border-violet-200/50 dark:border-violet-800/50 p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rename Habit</h3>
                <button
                  onClick={() => setEditingHabitName(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Habit Name
                  </label>
                  <input
                    type="text"
                    value={editingHabitName.name}
                    onChange={(e) => setEditingHabitName({ ...editingHabitName, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Habit name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emoji
                  </label>
                  <EmojiPicker
                    value={editingHabitName.emoji}
                    onChange={(emoji) => setEditingHabitName({ ...editingHabitName, emoji })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setEditingHabitName(null)}
                    className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingHabitName.name.trim()) {
                        onHabitUpdate(editingHabitName.habitId, {
                          name: editingHabitName.name.trim(),
                          emoji: editingHabitName.emoji,
                        });
                        setEditingHabitName(null);
                        toast.success('Habit renamed!');
                      }
                    }}
                    className="flex-1 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Rename Modal */}
      <AnimatePresence>
        {editingCategory && onCategoryRename && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg shadow-xl border border-violet-200/50 dark:border-violet-800/50 p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rename Category</h3>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Category name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emoji
                  </label>
                  <EmojiPicker
                    value={editingCategory.emoji}
                    onChange={(emoji) => setEditingCategory({ ...editingCategory, emoji })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Color
                  </label>
                  <ColorPaletteSlider
                    selectedColorIndex={editingCategory.colorIndex}
                    selectedRGB={editingCategory.rgbColor}
                    onColorChange={(index, rgbColor) => setEditingCategory({ ...editingCategory, colorIndex: index, rgbColor: rgbColor || null })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingCategory.name.trim()) {
                        const newCategory = createCategoryString(
                          editingCategory.emoji,
                          editingCategory.name.trim(),
                          editingCategory.colorIndex,
                          editingCategory.rgbColor || undefined
                        );
                        onCategoryRename(editingCategory.category, newCategory, editingCategory.emoji);
                        setEditingCategory(null);
                      }
                    }}
                    className="flex-1 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Grid */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl shadow-sm border border-amber-200/50 dark:border-amber-800/50 p-12 text-center"
        >
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Habits Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by adding your first habit!
          </p>
          <a
            href="/profile"
            className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
          >
            Go to Profile to Add Habits
          </a>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {Object.entries(habitsByCategory).map(([category, categoryHabits], catIndex) => {
            const isDraggingCategory = draggedCategory === category;
            const isDragOverCategory = dragOverCategory === category;
            const categoryColor = getCategoryColor(category);
            const rgbColor = getCategoryRGB(category);
            const isRGB = rgbColor !== null;
            
            // Helper to get background style for RGB colors
            const getBgStyle = () => {
              if (!isRGB || !rgbColor) return {};
              const r2 = Math.min(255, rgbColor.r + 10);
              const g2 = Math.min(255, rgbColor.g + 10);
              const b2 = Math.min(255, rgbColor.b + 10);
              return {
                background: `linear-gradient(to bottom right, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.2), rgba(${r2}, ${g2}, ${b2}, 0.2))`
              };
            };
            
            const getDarkBgStyle = () => {
              if (!isRGB || !rgbColor) return {};
              const darkR = Math.floor(rgbColor.r * 0.1);
              const darkG = Math.floor(rgbColor.g * 0.1);
              const darkB = Math.floor(rgbColor.b * 0.1);
              const darkR2 = Math.floor(Math.min(255, rgbColor.r + 10) * 0.1);
              const darkG2 = Math.floor(Math.min(255, rgbColor.g + 10) * 0.1);
              const darkB2 = Math.floor(Math.min(255, rgbColor.b + 10) * 0.1);
              return {
                background: `linear-gradient(to bottom right, rgba(${darkR}, ${darkG}, ${darkB}, 0.05), rgba(${darkR2}, ${darkG2}, ${darkB2}, 0.05))`
              };
            };
            
            const getBorderStyle = () => {
              if (!isRGB || !rgbColor) return {};
              return {
                borderColor: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.2)`
              };
            };

            // Helper to get solid background for sticky column (needs to be opaque to cover scrolling content)
            const getStickyColumnStyle = () => {
              if (isRGB && rgbColor) {
                const r2 = Math.min(255, rgbColor.r + 10);
                const g2 = Math.min(255, rgbColor.g + 10);
                const b2 = Math.min(255, rgbColor.b + 10);
                return {
                  backgroundColor: `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1)`,
                  backgroundImage: `linear-gradient(to bottom right, rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1), rgba(${r2}, ${g2}, ${b2}, 1))`,
                  boxShadow: '2px 0 8px rgba(0,0,0,0.25)',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                };
              }
              return {
                boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              };
            };

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isDraggingCategory ? 0.5 : 1, 
                  y: 0 
                }}
                transition={{ delay: catIndex * 0.1 }}
                draggable={!!onCategoryReorderToPosition}
                onDragStart={(e) => handleCategoryDragStart(e as any, category)}
                onDragOver={(e) => handleCategoryDragOver(e as any, category)}
                onDragLeave={handleCategoryDragLeave}
                onDrop={(e) => handleCategoryDrop(e as any, category)}
                onDragEnd={handleCategoryDragEnd}
                className={`${isRGB ? '' : `bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} rounded-lg shadow-sm ${isRGB ? 'border' : `border ${categoryColor.border}`} overflow-hidden opacity-40 ${
                  onCategoryReorderToPosition ? 'cursor-move' : ''
                } ${
                  isDragOverCategory ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                style={isRGB ? { ...getBgStyle(), ...getBorderStyle() } : undefined}
              >
                <div 
                  className={`px-4 py-2.5 border-b ${isRGB ? '' : categoryColor.border} ${isRGB ? '' : `bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} flex items-center justify-between`}
                  style={isRGB ? getDarkBgStyle() : undefined}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {onCategoryReorderToPosition && (
                      <GripVertical 
                        className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0" 
                        title="Drag to reorder category"
                      />
                    )}
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="text-lg">{extractEmojiFromCategory(category)}</span>
                      {extractNameFromCategory(category)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAdvancedColumns({ ...showAdvancedColumns, [category]: !showAdvancedColumns[category] })}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title={showAdvancedColumns[category] ? "Hide Priority & KPI" : "Show Priority & KPI"}
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                    {onCategoryRename && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        const rgb = getCategoryRGB(category);
                        setEditingCategory({
                          category,
                          name: extractNameFromCategory(category),
                          emoji: extractEmojiFromCategory(category),
                          colorIndex: getCategoryColorIndex(category),
                          rgbColor: rgb,
                        });
                        }}
                        className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-amber-600 dark:text-amber-500"
                        title="Rename category"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onCategoryDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCategoryDelete) {
                            onCategoryDelete(category);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-500 hover:text-red-700"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddMenu(showAddMenu === category ? null : category)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-primary"
                    title="Add habit"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <AnimatePresence>
                {showAddMenu === category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`px-4 py-3 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark} border-b ${categoryColor.border}`}
                  >
                    <div className="flex flex-wrap gap-2">
                      {(HABIT_SUGGESTIONS[category] || []).map((suggestion) => (
                        <button
                          key={suggestion.name}
                          onClick={() => handleQuickAdd(category, suggestion)}
                          className={`px-3 py-1.5 text-sm bg-white/40 dark:bg-black/20 border ${categoryColor.border} rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-colors flex items-center gap-1.5`}
                        >
                          <span>{suggestion.emoji}</span>
                          <span>{suggestion.name}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          window.location.href = '/profile';
                        }}
                        className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        + Custom
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', position: 'relative' }}>
                <table className="w-full min-w-full" style={{ tableLayout: 'auto', borderCollapse: 'separate', borderSpacing: 0, width: '100%', position: 'relative' }}>
                  <thead>
                    <tr className={`border-b ${categoryColor.border} bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`}>
                      <th 
                        className={`text-left px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 ${!isRGB ? `bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}` : ''}`} 
                        style={{ 
                          width: '180px', 
                          minWidth: '180px', 
                          maxWidth: '180px'
                        }}
                      >
                        Habit
                      </th>
                      {showAdvancedColumns[category] && (
                        <>
                          <th className={`text-center px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '70px', minWidth: '70px', maxWidth: '70px' }}>
                            Priority
                          </th>
                          <th className={`text-center px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}>
                            KPI
                          </th>
                        </>
                      )}
                      <th className={`text-center px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '70px', minWidth: '70px', maxWidth: '70px' }}>
                        Est.
                      </th>
                      <th className={`text-center px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}>
                        Act.
                      </th>
                      <th className={`text-center px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}>
                        %
                      </th>
                      {weekDays.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        return (
                          <th
                            key={day.toISOString()}
                            className={`text-center px-1 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark} relative`}
                            style={{ 
                              width: '50px', 
                              minWidth: '50px', 
                              maxWidth: '50px',
                              position: 'relative'
                            }}
                          >
                            {isToday && (
                              <div className="absolute inset-0 ring-2 ring-primary shadow-lg bg-primary/10 dark:bg-primary/20 rounded pointer-events-none" style={{ zIndex: 1 }} />
                            )}
                            <div className="font-medium text-[10px] relative z-10">{format(day, 'EEE')}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal relative z-10">{format(day, 'd')}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {categoryHabits.map((habit, habitIndex) => {
                      const habitCompletions = completionsByHabitAndDate.get(habit.id) || new Map();
                      const expectedTimes = habit.times_per_week || 7;
                      const kpiType = habit.kpi_type || 'days';
                      
                      const completedThisWeek = weekDays
                        .map((day) => format(day, 'yyyy-MM-dd'))
                        .filter((dateStr) => {
                          const completion = habitCompletions.get(dateStr);
                          return completion?.completed === true;
                        }).length;
                      
                      const percentage = expectedTimes > 0 
                        ? Math.round((completedThisWeek / expectedTimes) * 100) 
                        : 0;

                      const isEditingKpi = editingHabit?.habitId === habit.id && editingHabit?.field === 'kpi';
                      const isEditingEst = editingHabit?.habitId === habit.id && editingHabit?.field === 'estimated';
                      const isEditingImportance = editingHabit?.habitId === habit.id && editingHabit?.field === 'importance';

                      const isDragging = draggedHabit?.id === habit.id;
                      const isDragOver = dragOverHabit === habit.id;

                      return (
                        <motion.tr
                          key={habit.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: isDragging ? 0.5 : 1, 
                            x: 0,
                          }}
                          transition={{ delay: habitIndex * 0.02 }}
                          draggable={!!onHabitReorder}
                          onDragStart={(e) => handleDragStart(e as any, habit)}
                          onDragOver={(e) => handleDragOver(e as any, habit.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e as any, habit)}
                          onDragEnd={handleDragEnd}
                          className={`border-b ${categoryColor.border} bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark} hover:opacity-80 transition-opacity ${
                            onHabitReorder ? 'cursor-move' : ''
                          } ${
                            isDragging ? 'opacity-50' : ''
                          } ${
                            isDragOver ? 'ring-2 ring-primary/50 border-primary/30 border-t-2' : ''
                          }`}
                          style={{ pointerEvents: 'auto' }}
                        >
                          {/* Habit Name Column */}
                          <td 
                            className={`px-3 py-2 ${!isRGB ? `bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}` : ''}`} 
                            style={{ 
                              width: '180px', 
                              minWidth: '180px', 
                              maxWidth: '180px'
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              {onHabitReorder && (
                                <GripVertical 
                                  className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0" 
                                  title="Drag to reorder"
                                />
                              )}
                              {/* 3-dots menu for edit/delete */}
                              {(onHabitUpdate || onHabitDelete) && (
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setHabitMenuOpen(habitMenuOpen === habit.id ? null : habit.id);
                                    }}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    title="More options"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {habitMenuOpen === habit.id && (
                                    <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 min-w-[120px]">
                                        {onHabitUpdate && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setHabitMenuOpen(null);
                                              setEditingHabitName({
                                                habitId: habit.id,
                                                name: habit.name,
                                                emoji: habit.emoji,
                                              });
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                          >
                                            <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                                            Edit
                                          </button>
                                        )}
                                        {onHabitDelete && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setHabitMenuOpen(null);
                                              handleDelete(habit);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                          </button>
                                        )}
                                    </div>
                                  )}
                                </div>
                              )}
                              <motion.span 
                                className="text-base cursor-pointer" 
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {habit.emoji}
                              </motion.span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white text-xs">
                                  {habit.name}
                                  {habit.estimated_minutes > 0 && (
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                                      [{habit.estimated_minutes}m]
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Priority/Importance Column - Editable (Hidden by default) */}
                          {showAdvancedColumns[category] && (
                          <td className={`px-2 py-2 text-center bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '70px', minWidth: '70px', maxWidth: '70px' }}>
                            {editingHabit?.habitId === habit.id && editingHabit?.field === 'importance' ? (
                              <div className="flex items-center gap-1 justify-center">
                                <select
                                  value={editValues.importance}
                                  onChange={(e) => setEditValues({ ...editValues, importance: e.target.value as HabitImportance })}
                                  className={`text-xs px-1.5 py-0.5 border border-primary rounded bg-white/40 dark:bg-black/20 text-gray-900 dark:text-white`}
                                  autoFocus
                                  onBlur={() => handleEditSave(habit)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(habit);
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                  <option value="critical">⚠️ Critical</option>
                                </select>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditStart(habit, 'importance')}
                                className={`text-xs font-medium hover:text-primary transition-colors px-1 py-0.5 rounded hover:bg-white/30 dark:hover:bg-black/20 flex items-center gap-1 justify-center`}
                                title="Click to edit"
                              >
                                {habit.importance === 'critical' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                <span className={getImportanceColor(habit.importance)}>
                                  {habit.importance || 'medium'}
                                  </span>
                              </button>
                            )}
                          </td>
                          )}

                          {/* KPI Column - Editable (Hidden by default) */}
                          {showAdvancedColumns[category] && (
                          <td className={`px-2 py-2 text-center bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}>
                            {isEditingKpi ? (
                              <div className="flex items-center gap-1 justify-center">
                                <select
                                  value={editValues.kpi}
                                  onChange={(e) => setEditValues({ ...editValues, kpi: e.target.value })}
                                  className={`text-xs px-1.5 py-0.5 border border-primary rounded bg-white/40 dark:bg-black/20 text-gray-900 dark:text-white`}
                                  autoFocus
                                  onBlur={() => handleEditSave(habit)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(habit);
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                >
                                  <option value="days">days</option>
                                  <option value="times">times</option>
                                  <option value="hours">hours</option>
                                  <option value="minutes">minutes</option>
                                </select>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditStart(habit, 'kpi')}
                                className={`text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors px-1 py-0.5 rounded hover:bg-white/30 dark:hover:bg-black/20`}
                                title="Click to edit"
                              >
                                {kpiType}
                              </button>
                            )}
                          </td>
                          )}

                          {/* Estimated Column - Editable */}
                          <td className={`px-2 py-2 text-center bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`} style={{ width: '70px', minWidth: '70px', maxWidth: '70px' }}>
                            {isEditingEst ? (
                              <div className="flex items-center gap-1 justify-center">
                                <input
                                  type="number"
                                  min="1"
                                  max="7"
                                  value={editValues.estimated}
                                  onChange={(e) => setEditValues({ ...editValues, estimated: parseInt(e.target.value) || 7 })}
                                  className={`w-12 text-xs px-1.5 py-0.5 border border-primary rounded bg-white/70 dark:bg-black/30 text-gray-900 dark:text-white text-center`}
                                  autoFocus
                                  onBlur={() => handleEditSave(habit)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave(habit);
                                    if (e.key === 'Escape') handleEditCancel();
                                  }}
                                />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditStart(habit, 'estimated')}
                                className="text-xs font-medium text-gray-900 dark:text-white hover:text-primary transition-colors px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                                title="Click to edit"
                              >
                                {expectedTimes}
                              </button>
                            )}
                          </td>

                          {/* Actual Column */}
                          <td className={`px-2 py-2 text-center text-xs font-medium text-gray-900 dark:text-white bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`}>
                            {completedThisWeek}
                          </td>

                          {/* Percentage Column - Progress Bar */}
                          <td className={`px-2 py-2 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`}>
                            <div className="relative w-full h-5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 flex items-center justify-center ${
                                  percentage === 0 
                                    ? 'bg-red-500' 
                                    : percentage < 50 
                                    ? 'bg-orange-500' 
                                    : percentage < 100 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                              >
                                {percentage > 10 && (
                                  <span className="text-[9px] font-semibold text-white">
                                    {percentage}%
                                  </span>
                                )}
                              </div>
                              {percentage <= 10 && (
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-gray-700 dark:text-gray-300">
                                  {percentage}%
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Day Columns */}
                          {weekDays.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const completion = habitCompletions.get(dateStr);
                            const isCompleted = completion?.completed ?? false;
                            const isToday = isSameDay(day, new Date());
                            const isExpanded = expandedHabit?.habitId === habit.id && expandedHabit?.date === dateStr;

                            return (
                              <td
                                key={dateStr}
                                className={`text-center px-1 py-2 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark} relative`}
                                style={{ position: 'relative', pointerEvents: 'auto', width: '50px', minWidth: '50px', maxWidth: '50px' }}
                                data-day-column={isToday ? 'today' : undefined}
                              >
                                <div className="flex flex-col items-center gap-0.5 relative z-10">
                                  <motion.button
                                    onClick={() => handleToggle(habit.id, dateStr, !isCompleted)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="mt-0.5"
                                    aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-success" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                                    )}
                                  </motion.button>

                                  {isCompleted && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!completion) {
                                          handleToggle(habit.id, dateStr, true);
                                        }
                                        setExpandedHabit(
                                          isExpanded ? null : { habitId: habit.id, date: dateStr }
                                        );
                                      }}
                                      className="text-[9px] text-primary hover:text-primary-dark"
                                    >
                                      {isExpanded ? 'Hide' : 'Note'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                    {/* Quick Add Row */}
                    <tr className={`border-t-2 border-dashed ${categoryColor.border} bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`}>
                      <td colSpan={(showAdvancedColumns[category] ? 8 : 6) + weekDays.length} className={`px-3 py-2 bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark}`}>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleQuickAddSubmit(category);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                          {/* Emoji Picker */}
                          <EmojiPicker
                            value={quickAddInputs[category]?.emoji || '📋'}
                            onChange={(emoji) => {
                              const current = quickAddInputs[category] || { name: '', emoji: '📋', minutes: 5, importance: 'medium' as HabitImportance };
                              setQuickAddInputs({ 
                                ...quickAddInputs, 
                                [category]: { ...current, emoji } 
                              });
                            }}
                          />
                          <input
                            type="text"
                            value={quickAddInputs[category]?.name || ''}
                            onChange={(e) => {
                              const current = quickAddInputs[category] || { name: '', emoji: '📋', minutes: 5, importance: 'medium' as HabitImportance };
                              setQuickAddInputs({ 
                                ...quickAddInputs, 
                                [category]: { 
                                  ...current,
                                  name: e.target.value
                                } 
                              });
                            }}
                            placeholder="Habit name..."
                            className={`flex-1 text-xs px-2 py-1.5 border ${categoryColor.border} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white/40 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400`}
                            autoFocus={false}
                          />
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={quickAddInputs[category]?.minutes || 5}
                            onChange={(e) => {
                              const current = quickAddInputs[category] || { name: '', emoji: '📋', minutes: 5, importance: 'medium' as HabitImportance };
                              setQuickAddInputs({ 
                                ...quickAddInputs, 
                                [category]: { 
                                  ...current,
                                  minutes: parseInt(e.target.value) || 5
                                } 
                              });
                            }}
                            placeholder="Min"
                            className={`w-16 text-xs px-2 py-1.5 border ${categoryColor.border} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white/40 dark:bg-black/20 text-gray-900 dark:text-white text-center`}
                            title="Estimated minutes"
                          />
                          <select
                            value={quickAddInputs[category]?.importance || 'medium'}
                            onChange={(e) => {
                              const current = quickAddInputs[category] || { name: '', emoji: '📋', minutes: 5, importance: 'medium' as HabitImportance };
                              setQuickAddInputs({ 
                                ...quickAddInputs, 
                                [category]: { 
                                  ...current,
                                  importance: e.target.value as HabitImportance
                                } 
                              });
                            }}
                            className={`text-xs px-2 py-1.5 border ${categoryColor.border} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white/40 dark:bg-black/20 text-gray-900 dark:text-white`}
                            title="Importance level"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">⚠️ Critical</option>
                          </select>
                          <button
                            type="submit"
                            className="px-3 py-1.5 text-xs bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                          >
                            Add
                          </button>
                        </form>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Unified current day highlight - spans entire column */}
                {(() => {
                  const todayDay = weekDays.find(day => isSameDay(day, new Date()));
                  if (!todayDay) return null;
                  
                  const todayIndex = weekDays.findIndex(day => isSameDay(day, new Date()));
                  
                  // Calculate left offset: Habit (180) + Est (70) + Act (60) + % (60) + Priority (70 if shown) + KPI (60 if shown) + day columns before today
                  // Note: Using actual rendered widths from the table
                  const habitColWidth = 180;
                  const estColWidth = 70;
                  const actColWidth = 60;
                  const percentColWidth = 60;
                  const priorityColWidth = showAdvancedColumns[category] ? 70 : 0;
                  const kpiColWidth = showAdvancedColumns[category] ? 60 : 0;
                  const dayColWidth = 50; // Standard day column width (all days use 50px, header shows 60px for today but cells use 50px)
                  
                  // Calculate the left position: sum of all columns before the current day column
                  // Add small adjustments for borders/padding (approximately 1px per column border)
                  const borderAdjustment = 0; // Table uses borderCollapse: separate, so borders are included in width
                  const leftOffset = habitColWidth + estColWidth + actColWidth + percentColWidth + priorityColWidth + kpiColWidth + (todayIndex * dayColWidth) + borderAdjustment;
                  
                  return (
                    <div
                      className="absolute pointer-events-none ring-2 ring-primary/50 shadow-lg bg-primary/10 dark:bg-primary/20"
                      style={{
                        left: `${leftOffset}px`,
                        top: 0,
                        width: '50px', // Match the actual cell width
                        height: '100%',
                        borderRadius: '4px',
                        zIndex: 5,
                      }}
                    />
                  );
                })()}
              </div>
            </motion.div>
            );
          })}
        </div>
      )}

      {/* Expanded Habit Note Modal */}
      <AnimatePresence>
        {expandedHabit && expandedHabitData && (
          <motion.div
            key={`${expandedHabit.habitId}-${expandedHabit.date}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setExpandedHabit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{expandedHabitData.habit.emoji}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {expandedHabitData.habit.name}
                  </h3>
                </div>
                <button
                  onClick={() => setExpandedHabit(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {expandedHabitData.completion ? (
                <div className="space-y-4">
                  <div 
                    style={{ 
                      pointerEvents: 'auto', 
                      position: 'relative',
                      zIndex: 1000,
                      isolation: 'isolate'
                    }}
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <TimeSlider
                      value={expandedHabitData.completion.actual_minutes ?? expandedHabitData.habit.estimated_minutes}
                      min={Math.max(0, Math.round(expandedHabitData.habit.estimated_minutes * 0.5))}
                      max={Math.round(expandedHabitData.habit.estimated_minutes * 1.5)}
                      estimated={expandedHabitData.habit.estimated_minutes}
                      onChange={(minutes) => {
                        if (expandedHabitData.completion) {
                          handleUpdate(expandedHabitData.completion.id, { actual_minutes: minutes });
                        }
                      }}
                    />
                  </div>
                  <div 
                    style={{ 
                      pointerEvents: 'auto', 
                      position: 'relative',
                      zIndex: 100
                    }} 
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HabitNote
                      completion={expandedHabitData.completion}
                      onUpdate={handleUpdate}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Loading...
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Creator Modal */}
      <AnimatePresence>
        {showCategoryCreator && onCategoryCreate && (
          <CategoryCreator
            onCreate={(categoryName, emoji, colorIndex, rgbColor) => {
              onCategoryCreate(categoryName, emoji, colorIndex, rgbColor);
              setShowCategoryCreator(false);
            }}
            onClose={() => setShowCategoryCreator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
