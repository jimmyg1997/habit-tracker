import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import type { Habit, HabitCompletion } from '../../types';
import TimeSlider from './TimeSlider';
import HabitNote from './HabitNote';
import EmojiPicker from './EmojiPicker';
import toast from 'react-hot-toast';

interface HabitItemProps {
  habit: Habit;
  completion: HabitCompletion | undefined;
  onToggle: (habitId: string, completed: boolean, actualMinutes?: number) => void;
  onUpdate: (completionId: string, updates: Partial<HabitCompletion>) => void;
  onHabitUpdate?: (habitId: string, updates: Partial<Habit>) => void;
  isToday: boolean;
}

export default function HabitItem({
  habit,
  completion,
  onToggle,
  onUpdate,
  onHabitUpdate,
  isToday,
}: HabitItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [actualMinutes, setActualMinutes] = useState(
    completion?.actual_minutes ?? habit.estimated_minutes
  );
  const [editingHabit, setEditingHabit] = useState<{ name: string; emoji: string } | null>(null);

  const isCompleted = completion?.completed ?? false;

  useEffect(() => {
    if (completion?.actual_minutes !== undefined) {
      setActualMinutes(completion.actual_minutes);
    } else {
      setActualMinutes(habit.estimated_minutes);
    }
  }, [completion, habit.estimated_minutes]);

  const handleToggle = () => {
    if (isCompleted) {
      onToggle(habit.id, false);
    } else {
      onToggle(habit.id, true, actualMinutes);
      setShowDetails(true);
    }
  };

  const handleTimeChange = (minutes: number) => {
    setActualMinutes(minutes);
    if (isCompleted && completion) {
      onUpdate(completion.id, { actual_minutes: minutes });
    }
  };

  const minTime = Math.max(0, Math.round(habit.estimated_minutes * 0.5));
  const maxTime = Math.round(habit.estimated_minutes * 1.5);

  return (
    <motion.div
      layout
      className={`p-4 rounded-lg border transition-all duration-200 ${
        isCompleted
          ? 'bg-success/10 border-success/30 dark:bg-success/20 dark:border-success/40'
          : 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className="mt-1 flex-shrink-0"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-success" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            )}
          </motion.div>
        </button>

        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xl">{habit.emoji}</span>
                <h4
                  className={`font-medium flex-1 ${
                    isCompleted
                      ? 'text-success dark:text-success-light line-through'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {habit.name}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {onHabitUpdate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingHabit({
                        name: habit.name,
                        emoji: habit.emoji,
                      });
                    }}
                    className="p-1 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors text-amber-600 dark:text-amber-500"
                    title="Rename habit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{habit.estimated_minutes} min</span>
                </div>
              </div>
            </div>

          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3"
                style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
              >
                <div 
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <TimeSlider
                    value={actualMinutes}
                    min={minTime}
                    max={maxTime}
                    estimated={habit.estimated_minutes}
                    onChange={handleTimeChange}
                  />
                </div>

                <div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide note
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Add note
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <HabitNote
                          completion={completion}
                          onUpdate={onUpdate}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Habit Rename Modal */}
      <AnimatePresence>
        {editingHabit && onHabitUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingHabit(null)}
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
                  onClick={() => setEditingHabit(null)}
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
                    value={editingHabit.name}
                    onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Habit name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emoji
                  </label>
                  <EmojiPicker
                    value={editingHabit.emoji}
                    onChange={(emoji) => setEditingHabit({ ...editingHabit, emoji })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setEditingHabit(null)}
                    className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (editingHabit.name.trim()) {
                        onHabitUpdate(habit.id, {
                          name: editingHabit.name.trim(),
                          emoji: editingHabit.emoji,
                        });
                        setEditingHabit(null);
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
    </motion.div>
  );
}

