import { useAuth } from './useAuth';
import { updateUser, getCompletionsForDate, createAchievement, getAchievements } from '../lib/db';
import { format, startOfDay, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const XP_PER_HABIT = 10;
const XP_BONUS_STREAK = 5;
const XP_BONUS_PERFECT_DAY = 20;

export function useGamification() {
  const { user, loadUser } = useAuth();

  async function awardXP(amount: number) {
    if (!user) return;

    const newTotalXP = user.total_xp + amount;
    const newLevel = calculateLevel(newTotalXP);

    const updates: any = {
      total_xp: newTotalXP,
    };

    if (newLevel > user.current_level) {
      updates.current_level = newLevel;
      toast.success(`Level up! You're now level ${newLevel}! 🎉`, {
        duration: 4000,
      });
    }

    await updateUser(user.id, updates);
    if (loadUser && user) {
      await loadUser(user.id);
    }
  }

  function calculateLevel(totalXP: number): number {
    // Level formula: level = floor(sqrt(totalXP / 100)) + 1
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  async function checkAndUpdateStreaks() {
    if (!user) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterdayDate = subDays(new Date(), 1);
    const yesterday = format(startOfDay(yesterdayDate), 'yyyy-MM-dd');

    const [todayCompletions, yesterdayCompletions] = await Promise.all([
      getCompletionsForDate(user.id, today),
      getCompletionsForDate(user.id, yesterday),
    ]);

    const todayCompleted = todayCompletions.some((c) => c.completed);
    const yesterdayCompleted = yesterdayCompletions.some((c) => c.completed);

    let newStreak = user.current_streak;
    let newLongestStreak = user.longest_streak;

    if (todayCompleted) {
      if (yesterdayCompleted || user.current_streak === 0) {
        newStreak = user.current_streak + 1;
      } else {
        newStreak = 1; // Reset streak
      }
    } else if (!yesterdayCompleted && user.current_streak > 0) {
      newStreak = 0; // Streak broken
    }

    if (newStreak > user.longest_streak) {
      newLongestStreak = newStreak;
    }

    if (newStreak !== user.current_streak || newLongestStreak !== user.longest_streak) {
      await updateUser(user.id, {
        current_streak: newStreak,
        longest_streak: newLongestStreak,
      });
      if (loadUser && user) {
        await loadUser(user.id);
      }
    }
  }

  async function checkAchievements() {
    if (!user) return;

    const existingAchievements = await getAchievements(user.id);
    const earnedTypes = new Set(existingAchievements.map((a) => a.badge_type));

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayCompletions = await getCompletionsForDate(user.id, today);
    const allCompletions = await getCompletionsForDate(user.id, today);

    // First Day achievement
    if (!earnedTypes.has('first_day') && todayCompletions.some((c) => c.completed)) {
      await createAchievement({
        user_id: user.id,
        badge_type: 'first_day',
        earned_at: new Date().toISOString(),
      });
      toast.success('Achievement unlocked: First Day! 🎉');
    }

    // Week Warrior (7 day streak)
    if (!earnedTypes.has('week_warrior') && user.current_streak >= 7) {
      await createAchievement({
        user_id: user.id,
        badge_type: 'week_warrior',
        earned_at: new Date().toISOString(),
      });
      toast.success('Achievement unlocked: Week Warrior! 🔥');
    }

    // Perfect Day (100% completion)
    // This would need to check all habits for the day
    // For now, we'll check if all completions are done
    // In a real implementation, you'd compare against total habits
  }

  return {
    awardXP,
    checkAndUpdateStreaks,
    checkAchievements,
    calculateLevel,
  };
}

