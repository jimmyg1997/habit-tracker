import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { Habit, HabitCompletion, HabitImportance } from '../../types';
import HabitItem from './HabitItem';
import { extractEmojiFromCategory, extractNameFromCategory, getCategoryColor } from '../../utils/categoryUtils';
import EmojiPicker from './EmojiPicker';

interface HabitListProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onToggle: (habitId: string, completed: boolean, actualMinutes?: number) => void;
  onUpdate: (completionId: string, updates: Partial<HabitCompletion>) => void;
  onHabitUpdate?: (habitId: string, updates: Partial<Habit>) => void;
  selectedDate: Date;
  isToday: boolean;
  onCategoryReorderToPosition?: (draggedCategory: string, targetCategory: string) => void;
}

export default function HabitList({
  habits,
  completions,
  onToggle,
  onUpdate,
  onHabitUpdate,
  onHabitCreate,
  onHabitDelete,
  selectedDate,
  isToday,
  onCategoryReorderToPosition,
}: HabitListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [addingHabit, setAddingHabit] = useState<string | null>(null);
  const [newHabitName, setNewHabitName] = useState<Record<string, string>>({});
  const [newHabitEmoji, setNewHabitEmoji] = useState<Record<string, string>>({});

  const habitsByCategory = useMemo(() => {
    const grouped: Record<string, Habit[]> = {};
    habits.forEach((habit) => {
      if (!grouped[habit.category]) {
        grouped[habit.category] = [];
      }
      grouped[habit.category].push(habit);
    });
    return grouped;
  }, [habits]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
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
    }
  };

  const handleCategoryDragEnd = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  if (habits.length === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl shadow-sm border border-amber-200/50 dark:border-amber-800/50 p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No habits yet. Add your first habit to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(habitsByCategory).map(([category, categoryHabits]) => {
        const isExpanded = expandedCategories.has(category);
        const completedInCategory = categoryHabits.filter((habit) => {
          const completion = completions.find((c) => c.habit_id === habit.id);
          return completion?.completed;
        }).length;

        const isDraggingCategory = draggedCategory === category;
        const isDragOverCategory = dragOverCategory === category;
        const categoryColor = getCategoryColor(category);

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isDraggingCategory ? 0.5 : 1, 
              y: 0 
            }}
            draggable={!!onCategoryReorderToPosition}
            onDragStart={(e) => handleCategoryDragStart(e as any, category)}
            onDragOver={(e) => handleCategoryDragOver(e as any, category)}
            onDragLeave={handleCategoryDragLeave}
            onDrop={(e) => handleCategoryDrop(e as any, category)}
            onDragEnd={handleCategoryDragEnd}
            className={`bg-gradient-to-br ${categoryColor.bg} dark:bg-gradient-to-br ${categoryColor.dark} rounded-xl shadow-sm border ${categoryColor.border} overflow-hidden opacity-60 ${
              onCategoryReorderToPosition ? 'cursor-move' : ''
            } ${
              isDragOverCategory ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
          >
            <div className="flex items-center">
              {onCategoryReorderToPosition && (
                <div className="px-2 flex items-center">
                  <GripVertical 
                    className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing" 
                    title="Drag to reorder category"
                  />
                </div>
              )}
              <button
                onClick={() => toggleCategory(category)}
                className="flex-1 px-6 py-4 flex items-center justify-between hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{extractEmojiFromCategory(category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-left">
                      {extractNameFromCategory(category)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                      {completedInCategory}/{categoryHabits.length} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all duration-500"
                      style={{
                        width: `${
                          categoryHabits.length > 0
                            ? (completedInCategory / categoryHabits.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
              </button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 space-y-2">
                    {categoryHabits.map((habit) => {
                      const completion = completions.find(
                        (c) => c.habit_id === habit.id
                      );
                      return (
                        <div key={habit.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            <HabitItem
                              habit={habit}
                              completion={completion}
                              onToggle={onToggle}
                              onUpdate={onUpdate}
                              onHabitUpdate={onHabitUpdate}
                              isToday={isToday}
                            />
                          </div>
                          {onHabitDelete && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
                                  onHabitDelete(habit.id);
                                }
                              }}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-500 hover:text-red-700"
                              title="Delete habit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Add Habit Form */}
                    {onHabitCreate && (
                      <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                        {addingHabit === category ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const name = newHabitName[category]?.trim();
                              const emoji = newHabitEmoji[category] || '📋';
                              if (name && onHabitCreate) {
                                onHabitCreate(category, name, 5, 'medium', emoji);
                                setNewHabitName({ ...newHabitName, [category]: '' });
                                setNewHabitEmoji({ ...newHabitEmoji, [category]: '📋' });
                                setAddingHabit(null);
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <EmojiPicker
                              value={newHabitEmoji[category] || '📋'}
                              onChange={(emoji) => setNewHabitEmoji({ ...newHabitEmoji, [category]: emoji })}
                            />
                            <input
                              type="text"
                              value={newHabitName[category] || ''}
                              onChange={(e) => setNewHabitName({ ...newHabitName, [category]: e.target.value })}
                              placeholder="Habit name..."
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              autoFocus
                            />
                            <button
                              type="submit"
                              className="px-3 py-2 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingHabit(null);
                                setNewHabitName({ ...newHabitName, [category]: '' });
                                setNewHabitEmoji({ ...newHabitEmoji, [category]: '📋' });
                              }}
                              className="px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => setAddingHabit(category)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-colors border border-dashed border-gray-300 dark:border-slate-600"
                          >
                            <Plus className="w-4 h-4" />
                            Add Habit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

