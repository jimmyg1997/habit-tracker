import { useState, useEffect } from 'react';
import { format, addDays, subDays, isToday, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { getHabits, getCompletionsForDate, upsertCompletion, createHabit, updateHabit, cleanupDuplicateHabits, deleteHabit, reorderHabits } from '../lib/db';
import { getHealthMetricsForDate, getHealthMetricsForWeek, upsertHealthMetrics } from '../lib/db';
import type { Habit, HabitCompletion, HealthMetrics } from '../types';
import { DEFAULT_HABITS } from '../types';
import Header from '../components/Dashboard/Header';
import JournalPanel from '../components/Dashboard/JournalPanel';
import HealthMetricsPanel from '../components/Dashboard/HealthMetricsPanel';
import HabitList from '../components/Dashboard/HabitList';
import WeeklyView from '../components/Dashboard/WeeklyView';
import Navigation from '../components/Dashboard/Navigation';
import { useGamification } from '../hooks/useGamification';
import { Calendar, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';

export default function Dashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('weekly'); // Default to weekly
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [weeklyHealthMetrics, setWeeklyHealthMetrics] = useState<Map<string, HealthMetrics>>(new Map());
  const [loading, setLoading] = useState(true);
  const { checkAndUpdateStreaks, awardXP, checkAchievements } = useGamification();

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const isTodaySelected = isToday(selectedDate);
  
  // Get all dates for the week if in weekly view
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekDateStrings = weekDays.map((d) => format(d, 'yyyy-MM-dd'));

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, dateString, viewMode, selectedWeek]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    logger.debug('DASHBOARD', 'Loading dashboard data', { viewMode, dateString }, user.id);

    try {
      let habitsData = await getHabits(user.id);
      logger.debug('DASHBOARD', 'Loaded habits from database', { count: habitsData.length }, user.id);
      console.log('Dashboard - Loaded habits:', habitsData.length);
      
      // Check for duplicates and clean up database if needed
      const nameCounts = new Map<string, number>();
      habitsData.forEach((habit) => {
        const key = habit.name.toLowerCase().trim();
        nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
      });
      
      const hasDuplicates = Array.from(nameCounts.values()).some(count => count > 1);
      if (hasDuplicates) {
        console.log('Found duplicate habits, cleaning up database...');
        const deletedCount = await cleanupDuplicateHabits(user.id);
        if (deletedCount > 0) {
          toast.success(`Removed ${deletedCount} duplicate habit(s)`);
          // Reload habits after cleanup
          habitsData = await getHabits(user.id);
          console.log('Dashboard - After cleanup:', habitsData.length);
        }
      }
      
      // Frontend deduplication as backup (keep first occurrence)
      const seenNames = new Map<string, Habit>();
      habitsData = habitsData.filter((habit) => {
        const nameKey = habit.name.toLowerCase().trim();
        if (seenNames.has(nameKey)) {
          return false; // Remove duplicate
        }
        seenNames.set(nameKey, habit);
        return true; // Keep first occurrence
      });
      console.log('Dashboard - After deduplication:', habitsData.length);
      
      // Auto-add default habits if user has no unique habits (check for duplicates by name)
      const existingNames = new Set(habitsData.map(h => h.name.toLowerCase().trim()));
      
      if (existingNames.size === 0) {
        console.log('No habits found, adding default habits...');
        let orderIndex = 0;
        const addedHabits: Habit[] = [];
        
        for (const defaultHabit of DEFAULT_HABITS) {
          const habitNameKey = defaultHabit.name.toLowerCase().trim();
          // Skip if habit with same name already exists
          if (existingNames.has(habitNameKey)) {
            console.log(`Skipping duplicate: ${defaultHabit.name}`);
            continue;
          }
          
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
            addedHabits.push(result);
            existingNames.add(habitNameKey);
          }
        }
        
        habitsData = [...habitsData, ...addedHabits];
        if (addedHabits.length > 0) {
          toast.success(`Welcome! Added ${addedHabits.length} default habits.`);
        }
      }
      
      setHabits(habitsData);

      if (viewMode === 'weekly') {
        // Load completions for entire week
        const weekCompletions = await Promise.all(
          weekDateStrings.map((date) => getCompletionsForDate(user.id, date))
        );
        setCompletions(weekCompletions.flat());
      } else {
        // Load completions for single date
        const completionsData = await getCompletionsForDate(user.id, dateString);
        setCompletions(completionsData);
      }

      // Load health metrics for the week
      try {
        if (viewMode === 'weekly') {
          const weekMetrics = await getHealthMetricsForWeek(user.id, weekDateStrings);
          setWeeklyHealthMetrics(weekMetrics);
        } else {
          const metricsData = await getHealthMetricsForDate(user.id, dateString);
          setHealthMetrics(metricsData);
        }
      } catch (metricsError) {
        if (viewMode === 'weekly') {
          setWeeklyHealthMetrics(new Map());
        } else {
          setHealthMetrics(null);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleHabitToggle(
    habitId: string,
    date: string,
    completed: boolean,
    actualMinutes?: number
  ) {
    if (!user) return;

    const completion: Omit<HabitCompletion, 'id'> = {
      habit_id: habitId,
      user_id: user.id,
      completion_date: date,
      completed,
      actual_minutes: actualMinutes || null,
      note: null,
      completed_at: completed ? new Date().toISOString() : null,
    };

    const result = await upsertCompletion(completion);
    if (result) {
      setCompletions((prev) => {
        const filtered = prev.filter((c) => !(c.habit_id === habitId && c.completion_date === date));
        return [...filtered, result];
      });

      const isToday = date === format(new Date(), 'yyyy-MM-dd');
      if (completed && isToday) {
        await awardXP(10);
        await checkAchievements(habits, completions);
      }

      if (isToday) {
        await checkAndUpdateStreaks();
      }
    }
  }

  async function handleUpdateCompletion(completionId: string, updates: Partial<HabitCompletion>) {
    if (!user) return;

    const existing = completions.find((c) => c.id === completionId);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    const result = await upsertCompletion(updated);
    if (result) {
      setCompletions((prev) =>
        prev.map((c) => (c.id === completionId ? result : c))
      );
    }
  }

  async function handleHabitUpdate(habitId: string, updates: Partial<Habit>) {
    if (!user) return;

    const success = await updateHabit(habitId, updates);
    if (success) {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h))
      );
    }
  }

  async function handleHabitCreate(category: string, habitName: string, estimatedMinutes: number = 5, importance: 'low' | 'medium' | 'high' | 'critical' = 'medium', emoji?: string) {
    if (!user) return;
    
    // Get the category emoji as fallback
    const categoryEmojis: Record<string, string> = {
      '📝 Productivity': '📝',
      '🌟 Self-Care': '🌟',
      '👥 Social': '👥',
      '📱 Digital': '📱',
      '🧠 Learning': '🧠',
      '💪 Workout': '💪',
      '🏋️ Fitness Lifestyle': '🏋️',
    };
    
    // Get max order_index for this category
    const categoryHabits = habits.filter(h => h.category === category);
    const maxOrder = categoryHabits.length > 0 
      ? Math.max(...categoryHabits.map(h => h.order_index)) + 1 
      : 0;
    
    const newHabit: Omit<Habit, 'id' | 'created_at'> = {
      user_id: user.id,
      name: habitName,
      emoji: emoji || categoryEmojis[category] || '📋',
      category: category,
      estimated_minutes: estimatedMinutes,
      times_per_week: 7, // Default to daily
      importance: importance,
      kpi_type: 'days',
      order_index: maxOrder,
      is_archived: false,
    };

    const result = await createHabit(newHabit);
    if (result) {
      setHabits((prev) => [...prev, result]);
      toast.success(`Added "${habitName}"!`);
    } else {
      toast.error('Failed to create habit');
    }
  }

  async function handleHabitCreateBatch(habitData: Array<{ category: string; name: string; emoji: string; estimatedMinutes: number; importance: 'low' | 'medium' | 'high' | 'critical' }>) {
    if (!user || habitData.length === 0) return;

    const createdHabits: Habit[] = [];
    
    for (const data of habitData) {
      const categoryHabits = habits.filter(h => h.category === data.category);
      const maxOrder = categoryHabits.length > 0 
        ? Math.max(...categoryHabits.map(h => h.order_index)) + 1 
        : 0;

      const newHabit: Omit<Habit, 'id' | 'created_at'> = {
        user_id: user.id,
        name: data.name,
        emoji: data.emoji || '📋',
        category: data.category,
        estimated_minutes: data.estimatedMinutes,
        times_per_week: 7,
        importance: data.importance,
        kpi_type: 'days',
        order_index: maxOrder,
        is_archived: false,
      };

      const result = await createHabit(newHabit);
      if (result) {
        createdHabits.push(result);
      }
    }

    if (createdHabits.length > 0) {
      setHabits((prev) => [...prev, ...createdHabits]);
      toast.success(`Added ${createdHabits.length} habit${createdHabits.length !== 1 ? 's' : ''}!`);
    } else {
      toast.error('Failed to create habits');
    }
  }

  async function handleHabitDelete(habitId: string) {
    if (!user) return;
    
    const success = await deleteHabit(habitId);
    if (success) {
      setHabits((prev) => prev.filter(h => h.id !== habitId));
    } else {
      toast.error('Failed to delete habit');
    }
  }

  async function handleHabitReorder(habitId: string, direction: 'up' | 'down') {
    if (!user) return;
    
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const categoryHabits = habits
      .filter(h => h.category === habit.category)
      .sort((a, b) => a.order_index - b.order_index);
    
    const currentIndex = categoryHabits.findIndex(h => h.id === habitId);
    if (currentIndex === -1) return;
    
    let targetIndex: number;
    if (direction === 'up') {
      targetIndex = currentIndex - 1;
      if (targetIndex < 0) return;
    } else {
      targetIndex = currentIndex + 1;
      if (targetIndex >= categoryHabits.length) return;
    }
    
    const targetHabit = categoryHabits[targetIndex];
    
    // Swap order_index values
    const tempOrder = habit.order_index;
    await updateHabit(habitId, { order_index: targetHabit.order_index });
    await updateHabit(targetHabit.id, { order_index: tempOrder });
    
    // Reload habits to reflect new order
    const updatedHabits = await getHabits(user.id);
    setHabits(updatedHabits);
  }

  async function handleHabitReorderToPosition(draggedHabitId: string, targetHabitId: string) {
    if (!user) return;
    
    const draggedHabit = habits.find(h => h.id === draggedHabitId);
    const targetHabit = habits.find(h => h.id === targetHabitId);
    
    if (!draggedHabit || !targetHabit || draggedHabit.category !== targetHabit.category) {
      return;
    }
    
    // Simply swap the order_index values
    const tempOrder = draggedHabit.order_index;
    await updateHabit(draggedHabitId, { order_index: targetHabit.order_index });
    await updateHabit(targetHabitId, { order_index: tempOrder });
    
    // Update local state immediately
    setHabits((prev) => {
      const updated = [...prev];
      const draggedIdx = updated.findIndex(h => h.id === draggedHabitId);
      const targetIdx = updated.findIndex(h => h.id === targetHabitId);
      if (draggedIdx !== -1 && targetIdx !== -1) {
        updated[draggedIdx] = { ...updated[draggedIdx], order_index: targetHabit.order_index };
        updated[targetIdx] = { ...updated[targetIdx], order_index: tempOrder };
      }
      return updated;
    });
    
    // Reload to ensure consistency
    setTimeout(async () => {
      const updatedHabits = await getHabits(user.id);
      setHabits(updatedHabits);
    }, 300);
  }

  async function handleCategoryCreate(categoryName: string, emoji: string, colorIndex: number, rgbColor?: { r: number; g: number; b: number } | null) {
    if (!user) return;
    
    // Create a new habit with the new category to establish it
    // The category will be stored as part of the habit
    // Store color index or RGB in category string (we'll parse it later)
    const { createCategoryString } = await import('../utils/categoryUtils');
    const newCategory = createCategoryString(emoji, categoryName, colorIndex, rgbColor || undefined);
    
    // Get max order_index
    const maxOrder = habits.length > 0 
      ? Math.max(...habits.map(h => h.order_index)) + 1 
      : 0;
    
    const newHabit: Omit<Habit, 'id' | 'created_at'> = {
      user_id: user.id,
      name: `New Habit in ${categoryName}`, // Placeholder name
      emoji: emoji,
      category: newCategory,
      estimated_minutes: 5,
      times_per_week: 7,
      importance: 'medium',
      kpi_type: 'days',
      order_index: maxOrder,
      is_archived: false,
    };

    const result = await createHabit(newHabit);
    if (result) {
      setHabits((prev) => [...prev, result]);
      toast.success(`Created category "${categoryName}"! You can now add habits to it.`);
    } else {
      toast.error('Failed to create category');
    }
  }

  async function handleCategoryReorder(categoryName: string, direction: 'up' | 'down') {
    if (!user) return;
    
    // Get all categories and their habits
    const categories = Array.from(new Set(habits.map(h => h.category)));
    const currentIndex = categories.indexOf(categoryName);
    
    if (currentIndex === -1) return;
    
    let targetIndex: number;
    if (direction === 'up') {
      targetIndex = currentIndex - 1;
      if (targetIndex < 0) return;
    } else {
      targetIndex = currentIndex + 1;
      if (targetIndex >= categories.length) return;
    }
    
    const targetCategory = categories[targetIndex];
    
    // Swap all habits between the two categories
    // This is a simplified approach - we'll update order_index for all habits in both categories
    const sourceHabits = habits.filter(h => h.category === categoryName);
    const targetHabits = habits.filter(h => h.category === targetCategory);
    
    // Get min/max order_index for both categories
    const sourceMin = sourceHabits.length > 0 ? Math.min(...sourceHabits.map(h => h.order_index)) : 0;
    const targetMin = targetHabits.length > 0 ? Math.min(...targetHabits.map(h => h.order_index)) : 0;
    const sourceMax = sourceHabits.length > 0 ? Math.max(...sourceHabits.map(h => h.order_index)) : 0;
    const targetMax = targetHabits.length > 0 ? Math.max(...targetHabits.map(h => h.order_index)) : 0;
    
    // Swap order_index ranges
    const offset = direction === 'up' 
      ? targetMin - sourceMax - 1
      : targetMax - sourceMin + 1;
    
    // Update all habits in source category
    for (const habit of sourceHabits) {
      await updateHabit(habit.id, { order_index: habit.order_index + offset });
    }
    
    // Reload habits
    const updatedHabits = await getHabits(user.id);
    setHabits(updatedHabits);
  }

  async function handleCategoryReorderToPosition(draggedCategory: string, targetCategory: string) {
    if (!user) return;
    
    if (draggedCategory === targetCategory) return;
    
    // Get all categories
    const categories = Array.from(new Set(habits.map(h => h.category)));
    const draggedIndex = categories.indexOf(draggedCategory);
    const targetIndex = categories.indexOf(targetCategory);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Move step by step
    const direction = draggedIndex < targetIndex ? 'down' : 'up';
    const steps = Math.abs(targetIndex - draggedIndex);
    
    for (let i = 0; i < steps; i++) {
      await handleCategoryReorder(draggedCategory, direction);
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async function handleCategoryRename(oldCategory: string, newCategory: string, newEmoji: string) {
    if (!user) return;

    // Update all habits with the old category to the new category
    const habitsToUpdate = habits.filter(h => h.category === oldCategory);
    
    if (habitsToUpdate.length === 0) {
      toast.error('No habits found in this category');
      return;
    }

    // Update all habits in parallel
    const updatePromises = habitsToUpdate.map(habit => 
      updateHabit(habit.id, { category: newCategory })
    );

    await Promise.all(updatePromises);

    // Reload habits
    const updatedHabits = await getHabits(user.id);
    setHabits(updatedHabits);
    toast.success(`Category renamed to "${newCategory}"!`);
  }

  async function handleCategoryDelete(categoryName: string) {
    if (!user) return;

    const habitsInCategory = habits.filter(h => h.category === categoryName);
    
    if (habitsInCategory.length === 0) {
      toast.error('No habits found in this category');
      return;
    }

    if (!confirm(`Archive category "${categoryName}"? This will archive ${habitsInCategory.length} habit(s) in this category. Analytics will be preserved.`)) {
      return;
    }

    // Archive all habits in the category (preserves analytics)
    const archivePromises = habitsInCategory.map(habit => deleteHabit(habit.id));
    await Promise.all(archivePromises);

    // Reload habits
    const updatedHabits = await getHabits(user.id);
    setHabits(updatedHabits);
    toast.success(`Archived category "${categoryName}" and ${habitsInCategory.length} habit(s)!`);
  }

  async function handleHealthMetricsUpdate(updates: Partial<HealthMetrics>, date?: string): Promise<HealthMetrics | null> {
    if (!user) return Promise.resolve(null);

    const targetDate = date || dateString;
    const existing = viewMode === 'weekly' 
      ? weeklyHealthMetrics.get(targetDate) || {
          user_id: user.id,
          metric_date: targetDate,
          sleep_hours: null,
          sleep_quality: null,
          hydration_glasses: null,
          nutrition_rating: null,
          sleep_note: null,
          mood_rating: null,
          physical_state_rating: null,
          journal_note: null,
          media_urls: null,
        }
      : healthMetrics || {
          user_id: user.id,
          metric_date: targetDate,
          sleep_hours: null,
          sleep_quality: null,
          hydration_glasses: null,
          nutrition_rating: null,
          sleep_note: null,
          mood_rating: null,
          physical_state_rating: null,
          journal_note: null,
          media_urls: null,
        };

    logger.debug('HEALTH_METRICS', 'Updating health metrics', { 
      date: targetDate,
      updates: Object.keys(updates)
    }, user.id);

    const updated = { ...existing, ...updates };
    const result = await upsertHealthMetrics(updated);
    if (result) {
      // Update state without causing full re-render - use functional updates
      if (viewMode === 'weekly') {
        setWeeklyHealthMetrics(prev => {
          const newMap = new Map(prev);
          newMap.set(targetDate, result);
          return newMap;
        });
      } else {
        setHealthMetrics(result);
      }
      logger.info('HEALTH_METRICS', 'Health metrics saved successfully', { date: targetDate }, user.id);
      return result;
    } else {
      logger.error('HEALTH_METRICS', 'Failed to save health metrics', { date: targetDate }, user.id);
      console.error('Failed to save health metrics');
      return null;
    }
  }

  function navigateDate(direction: 'prev' | 'next') {
    setSelectedDate((prev) =>
      direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1)
    );
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  // Calculate completion for the selected date/week
  const getCompletedCount = () => {
    if (viewMode === 'weekly') {
      const weekDateStrings = weekDays.map((d) => format(d, 'yyyy-MM-dd'));
      const weekCompletions = completions.filter(
        (c) => weekDateStrings.includes(c.completion_date) && c.completed
      );
      // Count ALL completions, not unique habits
      return weekCompletions.length;
    } else {
      // For daily view, count unique habits completed (prevent duplicates)
      const todayCompletions = completions.filter(
        (c) => c.completion_date === dateString && c.completed
      );
      const uniqueHabits = new Set(todayCompletions.map(c => c.habit_id));
      return uniqueHabits.size;
    }
  };

  const getTotalPossible = () => {
    if (viewMode === 'weekly') {
      // Total possible = sum of times_per_week for all habits
      // Each habit has a times_per_week value (default 7 if not set)
      return habits.reduce((total, habit) => {
        return total + (habit.times_per_week || 7);
      }, 0);
    } else {
      // Total possible = number of habits for the day
      return habits.length;
    }
  };

  const completedCount = getCompletedCount();
  const totalPossible = getTotalPossible();
  // Ensure completed count never exceeds total possible
  const adjustedCompletedCount = Math.min(completedCount, totalPossible);
  const completionPercentage =
    totalPossible > 0 ? Math.round((adjustedCompletedCount / totalPossible) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        user={user}
        selectedDate={viewMode === 'weekly' ? selectedWeek : selectedDate}
        completionPercentage={completionPercentage}
        completedCount={adjustedCompletedCount}
        totalCount={totalPossible}
        viewMode={viewMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid className="w-4 h-4" />
              Weekly
            </button>
          </div>
        </div>

        {viewMode === 'daily' ? (
          <>
            <Navigation
              selectedDate={selectedDate}
              onNavigate={navigateDate}
              onGoToToday={goToToday}
              isToday={isTodaySelected}
            />
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <JournalPanel
                  metrics={healthMetrics}
                  weeklyMetrics={viewMode === 'weekly' ? weeklyHealthMetrics : undefined}
                  onUpdate={handleHealthMetricsUpdate}
                  date={selectedDate}
                  weekDays={viewMode === 'weekly' ? weekDays : undefined}
                />
                <HealthMetricsPanel
                  metrics={healthMetrics}
                  weeklyMetrics={viewMode === 'weekly' ? weeklyHealthMetrics : undefined}
                  onUpdate={handleHealthMetricsUpdate}
                  date={selectedDate}
                  weekDays={viewMode === 'weekly' ? weekDays : undefined}
                />
                <HabitList
                  habits={habits}
                  completions={completions}
                  onToggle={(habitId, completed, actualMinutes) =>
                    handleHabitToggle(habitId, dateString, completed, actualMinutes)
                  }
                  onUpdate={handleUpdateCompletion}
                  onHabitUpdate={handleHabitUpdate}
                  onHabitCreate={handleHabitCreate}
                  onHabitDelete={handleHabitDelete}
                  selectedDate={selectedDate}
                  isToday={isTodaySelected}
                  onCategoryReorderToPosition={handleCategoryReorderToPosition}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Week Navigation */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Previous week"
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
                    onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Next week"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <JournalPanel
                  metrics={healthMetrics}
                  weeklyMetrics={weeklyHealthMetrics}
                  onUpdate={handleHealthMetricsUpdate}
                  date={selectedWeek}
                  weekDays={weekDays}
                />
                <HealthMetricsPanel
                  metrics={healthMetrics}
                  weeklyMetrics={weeklyHealthMetrics}
                  onUpdate={handleHealthMetricsUpdate}
                  date={selectedWeek}
                  weekDays={weekDays}
                />
                <WeeklyView
                  habits={habits}
                  completions={completions}
                  onToggle={handleHabitToggle}
                  onUpdate={handleUpdateCompletion}
                  selectedWeek={selectedWeek}
                  onWeekChange={setSelectedWeek}
                  onHabitUpdate={handleHabitUpdate}
                  onHabitCreate={handleHabitCreate}
                  onHabitCreateBatch={handleHabitCreateBatch}
                  onHabitDelete={handleHabitDelete}
                  onHabitReorder={handleHabitReorder}
                  onHabitReorderToPosition={handleHabitReorderToPosition}
                  onCategoryCreate={handleCategoryCreate}
                  onCategoryReorder={handleCategoryReorder}
                  onCategoryReorderToPosition={handleCategoryReorderToPosition}
                  onCategoryRename={handleCategoryRename}
                  onCategoryDelete={handleCategoryDelete}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

