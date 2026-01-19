import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Droplet, Utensils, Moon, Smile, Activity, BookOpen } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { debounce } from '../../utils/debounce';
import type { HealthMetrics } from '../../types';
import RatingSlider from './RatingSlider';

interface HealthMetricsPanelProps {
  metrics: HealthMetrics | null;
  weeklyMetrics?: Map<string, HealthMetrics>;
  onUpdate: (updates: Partial<HealthMetrics>, date?: string) => void;
  date: Date;
  weekDays?: Date[];
}

export default function HealthMetricsPanel({
  metrics,
  weeklyMetrics,
  onUpdate,
  date,
  weekDays,
}: HealthMetricsPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [localSleepNotes, setLocalSleepNotes] = useState<Map<string, string>>(new Map());
  const initializedRef = useRef<Set<string>>(new Set());

  // Use weekly view if weekDays is provided
  const isWeeklyView = !!weekDays && weekDays.length > 0;

  // Initialize local state from metrics
  useEffect(() => {
    if (isWeeklyView && weekDays) {
      weekDays.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (!initializedRef.current.has(dateStr)) {
          const dayMetrics = weeklyMetrics?.get(dateStr);
          if (dayMetrics?.sleep_note) {
            setLocalSleepNotes(prev => new Map(prev).set(dateStr, dayMetrics.sleep_note || ''));
            initializedRef.current.add(dateStr);
          }
        }
      });
    } else if (metrics?.sleep_note && !initializedRef.current.has('daily')) {
      setLocalSleepNotes(prev => new Map(prev).set('daily', metrics.sleep_note || ''));
      initializedRef.current.add('daily');
    }
  }, [metrics, weeklyMetrics, weekDays, isWeeklyView]);

  // Debounced save function
  const debouncedSaveSleepNote = debounce((dateStr: string, value: string) => {
    onUpdate({ sleep_note: value || null }, dateStr);
  }, 500);

  const toggleExpanded = (metricType: string) => {
    setExpanded((prev) => ({ ...prev, [metricType]: !prev[metricType] }));
  };

  const getMetricsForDate = (dateStr: string): HealthMetrics | null => {
    if (isWeeklyView && weeklyMetrics) {
      return weeklyMetrics.get(dateStr) || null;
    }
    return metrics;
  };

  if (isWeeklyView && weekDays) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl shadow-sm border border-rose-200/50 dark:border-rose-800/50 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Health Metrics - Weekly View
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30">
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-slate-700/30 z-10 min-w-[150px]">
                  Metric
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`text-center px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 min-w-[100px] ${
                      isSameDay(day, new Date()) ? 'bg-primary/10 dark:bg-primary/20' : ''
                    }`}
                  >
                    <div className="font-medium text-[10px]">{format(day, 'EEE')}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">{format(day, 'd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Sleep Hours */}
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                <td className="px-3 py-3 sticky left-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 z-10">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Sleep Hours</span>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayMetrics = getMetricsForDate(dateStr);
                  const sleepHours = dayMetrics?.sleep_hours ?? null;
                  const isToday = isSameDay(day, new Date());

                  return (
                    <td
                      key={dateStr}
                      className={`text-center px-2 py-2 ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={sleepHours ?? ''}
                        onChange={(e) =>
                          onUpdate(
                            {
                              sleep_hours: e.target.value ? parseFloat(e.target.value) : null,
                            },
                            dateStr
                          )
                        }
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center"
                        placeholder="0-24"
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Sleep Quality */}
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                <td className="px-3 py-3 sticky left-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 z-10">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Sleep Quality</span>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayMetrics = getMetricsForDate(dateStr);
                  const sleepQuality = dayMetrics?.sleep_quality ?? null;
                  const isToday = isSameDay(day, new Date());

                  return (
                    <td
                      key={dateStr}
                      className={`px-2 py-2 ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <RatingSlider
                        value={sleepQuality}
                        onChange={(value) => onUpdate({ sleep_quality: value }, dateStr)}
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Hydration */}
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                <td className="px-3 py-3 sticky left-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 z-10">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Hydration</span>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayMetrics = getMetricsForDate(dateStr);
                  const hydration = dayMetrics?.hydration_glasses ?? null;
                  const isToday = isSameDay(day, new Date());
                  // Convert hydration glasses to 1-5 scale for slider
                  // Map: 0-1 glasses = 1, 2-3 = 2, 4-5 = 3, 6-7 = 4, 8+ = 5
                  const hydrationRating = hydration === null || hydration === 0 
                    ? null 
                    : Math.min(5, Math.max(1, Math.ceil((hydration + 1) / 2)));

                  return (
                    <td
                      key={dateStr}
                      className={`px-2 py-2 ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <RatingSlider
                        value={hydrationRating}
                        min={1}
                        max={5}
                        onChange={(value) => {
                          // Convert back: 1-5 scale to glasses
                          // 1 = 0-1, 2 = 2-3, 3 = 4-5, 4 = 6-7, 5 = 8+
                          const glasses = value === 1 ? 1 : (value - 1) * 2;
                          onUpdate({ hydration_glasses: glasses }, dateStr);
                        }}
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Nutrition */}
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                <td className="px-3 py-3 sticky left-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 z-10">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Nutrition</span>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayMetrics = getMetricsForDate(dateStr);
                  const nutrition = dayMetrics?.nutrition_rating ?? null;
                  const isToday = isSameDay(day, new Date());

                  return (
                    <td
                      key={dateStr}
                      className={`px-2 py-2 ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <RatingSlider
                        value={nutrition}
                        onChange={(value) => onUpdate({ nutrition_rating: value }, dateStr)}
                      />
                    </td>
                  );
                })}
              </tr>

              {/* Mood */}
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                <td className="px-3 py-3 sticky left-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 z-10">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Mood</span>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayMetrics = getMetricsForDate(dateStr);
                  const mood = dayMetrics?.mood_rating ?? null;
                  const isToday = isSameDay(day, new Date());
                  
                  // Map mood_rating (1-5) to emoji selection (1-6)
                  // For backward compatibility, if mood_rating exists, map it to closest emoji
                  // Emojis: 1=😊 happy, 2=😠 angry, 3=😰 stressed, 4=🙏 grateful, 5=😴 sleepy, 6=😐 neutral
                  const moodEmojis = [
                    { emoji: '😊', label: 'Happy', value: 1 },
                    { emoji: '😠', label: 'Angry', value: 2 },
                    { emoji: '😰', label: 'Stressed', value: 3 },
                    { emoji: '🙏', label: 'Grateful', value: 4 },
                    { emoji: '😴', label: 'Sleepy', value: 5 },
                    { emoji: '😐', label: 'Neutral', value: 6 },
                  ];
                  
                  // If mood_rating exists (1-5), map to emoji (1-6)
                  // For now, we'll store as mood_rating but display as emoji
                  // We need to change the data model, but for now map: 1->1, 2->2, 3->3, 4->4, 5->5, null->null
                  // Actually, let's use a different approach - store emoji index in mood_rating (1-6)
                  const selectedEmojiIndex = mood ? (mood <= 6 ? mood : Math.ceil(mood / 5 * 6)) : null;

                  return (
                    <td
                      key={dateStr}
                      className={`text-center px-2 py-2 ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {moodEmojis.map((moodEmoji) => (
                          <button
                            key={moodEmoji.value}
                            onClick={() => onUpdate({ mood_rating: moodEmoji.value }, dateStr)}
                            className={`p-1.5 rounded-lg text-lg transition-all ${
                              selectedEmojiIndex === moodEmoji.value
                                ? 'bg-amber-100 dark:bg-amber-900/30 scale-110 ring-2 ring-amber-500'
                                : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 hover:scale-105'
                            }`}
                            title={moodEmoji.label}
                          >
                            {moodEmoji.emoji}
                          </button>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Sleep Notes - Always Visible */}
              <tr className="border-b border-gray-100 dark:border-slate-700/50">
                <td className="px-3 py-3 sticky left-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 z-10">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <Moon className="w-4 h-4" />
                    Sleep Notes
                  </div>
                </td>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayMetrics = getMetricsForDate(dateStr);
                  const localNote = localSleepNotes.get(dateStr);
                  const sleepNote = localNote !== undefined ? localNote : (dayMetrics?.sleep_note ?? '');
                  const isToday = isSameDay(day, new Date());

                  return (
                    <td
                      key={dateStr}
                      className={`px-2 py-2 ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <textarea
                        value={sleepNote}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLocalSleepNotes(prev => new Map(prev).set(dateStr, value));
                          debouncedSaveSleepNote(dateStr, value);
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                        rows={2}
                        placeholder="Notes..."
                      />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  // Fallback to daily view if no weekDays provided
  const sleepHours = metrics?.sleep_hours ?? null;
  const sleepQuality = metrics?.sleep_quality ?? null;
  const hydration = metrics?.hydration_glasses ?? null;
  const nutrition = metrics?.nutrition_rating ?? null;
  const mood = metrics?.mood_rating ?? null;
  const physicalState = metrics?.physical_state_rating ?? null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-xl shadow-sm border border-rose-200/50 dark:border-rose-800/50 p-6"
      >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Health Metrics
        </h3>
        <button
          onClick={() => toggleExpanded('daily')}
          className="text-sm text-primary hover:text-primary-dark transition-colors"
        >
          {expanded.daily ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sleep Hours */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep Hours
          </label>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={sleepHours ?? ''}
            onChange={(e) =>
              onUpdate({
                sleep_hours: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            placeholder="0-24"
          />
        </div>

        {/* Sleep Quality */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep Quality
          </label>
          <RatingSlider
            value={sleepQuality}
            onChange={(value) => onUpdate({ sleep_quality: value })}
          />
        </div>

        {/* Hydration */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Droplet className="w-4 h-4" />
            Hydration
          </label>
          {(() => {
            // Convert hydration glasses to 1-5 scale for slider
            // Map: 0-1 glasses = 1, 2-3 = 2, 4-5 = 3, 6-7 = 4, 8+ = 5
            const hydrationRating = hydration === null || hydration === 0 
              ? null 
              : Math.min(5, Math.max(1, Math.ceil((hydration + 1) / 2)));
            return (
              <RatingSlider
                value={hydrationRating}
                min={1}
                max={5}
                onChange={(value) => {
                  // Convert back: 1-5 scale to glasses
                  // 1 = 0-1, 2 = 2-3, 3 = 4-5, 4 = 6-7, 5 = 8+
                  const glasses = value === 1 ? 1 : (value - 1) * 2;
                  onUpdate({ hydration_glasses: glasses });
                }}
              />
            );
          })()}
        </div>

        {/* Nutrition */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Nutrition
          </label>
          <RatingSlider
            value={nutrition}
            onChange={(value) => onUpdate({ nutrition_rating: value })}
          />
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Mood
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              { emoji: '😊', label: 'Happy', value: 1 },
              { emoji: '😠', label: 'Angry', value: 2 },
              { emoji: '😰', label: 'Stressed', value: 3 },
              { emoji: '🙏', label: 'Grateful', value: 4 },
              { emoji: '😴', label: 'Sleepy', value: 5 },
              { emoji: '😐', label: 'Neutral', value: 6 },
            ].map((moodEmoji) => (
              <button
                key={moodEmoji.value}
                onClick={() => onUpdate({ mood_rating: moodEmoji.value })}
                className={`flex-1 min-w-[60px] py-2 rounded-lg text-xl transition-all ${
                  mood === moodEmoji.value
                    ? 'bg-amber-100 dark:bg-amber-900/30 scale-110 ring-2 ring-amber-500'
                    : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 hover:scale-105'
                }`}
                title={moodEmoji.label}
              >
                {moodEmoji.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700"
      >
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep Note
          </label>
          <textarea
            value={localSleepNotes.get('daily') !== undefined ? localSleepNotes.get('daily') : (metrics?.sleep_note ?? '')}
            onChange={(e) => {
              const value = e.target.value;
              setLocalSleepNotes(prev => new Map(prev).set('daily', value));
              debouncedSaveSleepNote('daily', value);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
            rows={3}
            placeholder="Add notes about your sleep..."
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
