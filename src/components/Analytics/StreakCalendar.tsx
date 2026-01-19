import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subMonths, startOfYear, endOfYear } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { HabitCompletion, Habit } from '../../types';

interface StreakCalendarProps {
  completions: HabitCompletion[];
  habits?: Habit[];
  timeRange?: 'week' | 'month' | 'all';
}

export default function StreakCalendar({ completions, habits = [], timeRange = 'month' }: StreakCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const today = new Date();
  let startDate: Date;
  let endDate: Date;
  let days: Date[];

  if (timeRange === 'week') {
    startDate = startOfWeek(today, { weekStartsOn: 1 });
    endDate = endOfWeek(today, { weekStartsOn: 1 });
    days = eachDayOfInterval({ start: startDate, end: endDate });
  } else if (timeRange === 'month') {
    // For month view, start from the first Monday of the month's calendar grid
    const monthStart = startOfMonth(today);
    startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    endDate = endOfMonth(today);
    // End at the last Sunday of the month's calendar grid
    const monthEnd = endOfMonth(today);
    endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    days = eachDayOfInterval({ start: startDate, end: endDate });
  } else {
    // All time - show last 12 months
    endDate = endOfMonth(today);
    startDate = startOfMonth(subMonths(today, 11));
    days = eachDayOfInterval({ start: startDate, end: endDate });
  }

  // Count completions per date - only for dates in the displayed range
  const dateStrSet = new Set(days.map(d => format(d, 'yyyy-MM-dd')));
  const completionsByDate = new Map<string, number>();
  completions.forEach((c) => {
    if (c.completed && dateStrSet.has(c.completion_date)) {
      const dateStr = c.completion_date;
      completionsByDate.set(dateStr, (completionsByDate.get(dateStr) || 0) + 1);
    }
  });

  // Get max completions for intensity calculation (only from displayed dates)
  const displayedCompletions = Array.from(completionsByDate.values());
  const maxCompletions = displayedCompletions.length > 0 ? Math.max(...displayedCompletions) : 1;

  const getIntensity = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = completionsByDate.get(dateStr) || 0;
    // Return intensity as percentage (0-4 for 5 levels)
    return Math.min(4, Math.floor((count / maxCompletions) * 4));
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-slate-700';
    if (intensity === 1) return 'bg-green-200 dark:bg-green-900/30';
    if (intensity === 2) return 'bg-green-400 dark:bg-green-700/50';
    if (intensity === 3) return 'bg-green-600 dark:bg-green-600/70';
    return 'bg-green-700 dark:bg-green-500 text-white';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Activity Calendar {timeRange === 'week' ? '(Week)' : timeRange === 'month' ? '(Month)' : '(Last 12 Months)'}
      </h3>
      <div className={`grid gap-1 ${timeRange === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
        {timeRange === 'week' && (
          <div className="col-span-7 grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                {day}
              </div>
            ))}
          </div>
        )}
        {timeRange !== 'week' && (
          <div className="col-span-7 grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
                {day}
              </div>
            ))}
          </div>
        )}
        {days.map((day) => {
          const intensity = getIntensity(day);
          const isToday = isSameDay(day, new Date());
          const dateStr = format(day, 'yyyy-MM-dd');
          const count = completionsByDate.get(dateStr) || 0;
          
          // Check if this day is in the current month (for month view)
          const isCurrentMonth = timeRange !== 'month' || format(day, 'yyyy-MM') === format(today, 'yyyy-MM');
          
          const dayCompletions = completions.filter(
            (c) => c.completion_date === dateStr && c.completed
          );
          const dayHabits = habits.filter((h) => 
            dayCompletions.some((c) => c.habit_id === h.id)
          );

          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`aspect-square rounded flex items-center justify-center text-xs transition-all cursor-pointer hover:scale-110 ${
                getIntensityColor(intensity)
              } ${intensity > 0 ? 'text-white' : isCurrentMonth ? 'text-gray-400' : 'text-gray-300 dark:text-gray-600'} ${isToday ? 'ring-2 ring-primary' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}`}
              title={`${format(day, 'MMM d, yyyy')}: ${count} completion${count !== 1 ? 's' : ''} - Click for details`}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
      {timeRange !== 'week' && (
        <div className="mt-4 flex items-center justify-end gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-gray-100 dark:bg-slate-700"></div>
            <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900/30"></div>
            <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-700/50"></div>
            <div className="w-3 h-3 rounded bg-green-600 dark:bg-green-600/70"></div>
            <div className="w-3 h-3 rounded bg-green-700 dark:bg-green-500"></div>
          </div>
          <span>More</span>
        </div>
      )}

      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDay && (() => {
          const dateStr = format(selectedDay, 'yyyy-MM-dd');
          const dayCompletions = completions.filter(
            (c) => c.completion_date === dateStr && c.completed
          );
          const dayHabits = habits.filter((h) => 
            dayCompletions.some((c) => c.habit_id === h.id)
          );
          const totalHabits = habits.length;
          const completedCount = dayCompletions.length;
          const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedDay(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {completedCount} / {totalHabits}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Habits completed ({completionRate}%)
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  {dayHabits.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Completed Habits:
                      </h4>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {dayHabits.map((habit) => (
                          <div
                            key={habit.id}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                          >
                            <span className="text-lg">{habit.emoji}</span>
                            <span className="text-sm text-gray-900 dark:text-white flex-1">
                              {habit.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No habits completed on this day
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

