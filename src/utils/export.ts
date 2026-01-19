import * as XLSX from 'xlsx';
import { getHabits, getCompletionsForDate } from '../lib/db';
import { getHealthMetricsForDate } from '../lib/db';
import { getAchievements } from '../lib/db';
import { format, subDays } from 'date-fns';

export async function exportToExcel(userId: string) {
  // Get all data
  const habits = await getHabits(userId);
  const achievements = await getAchievements(userId);

  // Get completions for last 90 days
  const completions: any[] = [];
  const healthMetrics: any[] = [];

  for (let i = 0; i < 90; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const [dayCompletions, dayMetrics] = await Promise.all([
      getCompletionsForDate(userId, date),
      getHealthMetricsForDate(userId, date),
    ]);

    completions.push(...dayCompletions);
    if (dayMetrics) {
      healthMetrics.push(dayMetrics);
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Daily Completions
  const completionsData = completions.map((c) => ({
    Date: c.completion_date,
    Habit: habits.find((h) => h.id === c.habit_id)?.name || 'Unknown',
    Completed: c.completed ? 'Yes' : 'No',
    'Actual Minutes': c.actual_minutes || '',
    Note: c.note || '',
    'Completed At': c.completed_at || '',
  }));
  const completionsSheet = XLSX.utils.json_to_sheet(completionsData);
  XLSX.utils.book_append_sheet(workbook, completionsSheet, 'Completions');

  // Sheet 2: Health Metrics
  const metricsData = healthMetrics.map((m) => ({
    Date: m.metric_date,
    'Sleep Hours': m.sleep_hours || '',
    'Sleep Quality': m.sleep_quality || '',
    'Hydration Glasses': m.hydration_glasses || '',
    'Nutrition Rating': m.nutrition_rating || '',
    'Sleep Note': m.sleep_note || '',
  }));
  const metricsSheet = XLSX.utils.json_to_sheet(metricsData);
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Health Metrics');

  // Sheet 3: Habits
  const habitsData = habits.map((h) => ({
    Name: h.name,
    Emoji: h.emoji,
    Category: h.category,
    'Estimated Minutes': h.estimated_minutes,
    'Order Index': h.order_index,
    'Created At': h.created_at,
  }));
  const habitsSheet = XLSX.utils.json_to_sheet(habitsData);
  XLSX.utils.book_append_sheet(workbook, habitsSheet, 'Habits');

  // Sheet 4: Achievements
  const achievementsData = achievements.map((a) => ({
    'Badge Type': a.badge_type,
    'Earned At': a.earned_at,
  }));
  const achievementsSheet = XLSX.utils.json_to_sheet(achievementsData);
  XLSX.utils.book_append_sheet(workbook, achievementsSheet, 'Achievements');

  // Sheet 5: Summary
  const totalCompletions = completions.filter((c) => c.completed).length;
  const summaryData = [
    { Metric: 'Total Habits', Value: habits.length },
    { Metric: 'Total Completions', Value: totalCompletions },
    { Metric: 'Total Achievements', Value: achievements.length },
    { Metric: 'Days Tracked', Value: new Set(completions.map((c) => c.completion_date)).size },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Download
  XLSX.writeFile(workbook, `habit-tracker-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}


