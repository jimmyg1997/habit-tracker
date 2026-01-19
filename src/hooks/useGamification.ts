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

    // Recalculate streak from scratch by checking consecutive days backwards
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayCompletions = await getCompletionsForDate(user.id, dateStr);
      const hasCompletion = dayCompletions.some((c) => c.completed);
      
      if (hasCompletion) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        // If today has no completion, don't count it
        if (dateStr === format(new Date(), 'yyyy-MM-dd')) {
          // Check yesterday
          const yesterday = subDays(new Date(), 1);
          const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
          const yesterdayCompletions = await getCompletionsForDate(user.id, yesterdayStr);
          if (yesterdayCompletions.some((c) => c.completed)) {
            // Yesterday had completion, so streak continues from yesterday
            streak = 0; // Today doesn't count, so streak is 0 until today is completed
          }
        }
        break;
      }
    }

    const newLongestStreak = Math.max(user.longest_streak, streak);

    if (streak !== user.current_streak || newLongestStreak !== user.longest_streak) {
      await updateUser(user.id, {
        current_streak: streak,
        longest_streak: newLongestStreak,
      });
      if (loadUser && user) {
        await loadUser(user.id);
      }
    }
  }

  async function checkAchievements(habits: any[] = [], completions: any[] = []) {
    if (!user) return;

    const existingAchievements = await getAchievements(user.id);
    const earnedTypes = new Set(existingAchievements.map((a) => a.badge_type));

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayCompletions = await getCompletionsForDate(user.id, today);
    const allCompletions = completions.length > 0 ? completions : await getCompletionsForDate(user.id, today);

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

    // Month Master (30 day streak)
    if (!earnedTypes.has('month_master') && user.current_streak >= 30) {
      await createAchievement({
        user_id: user.id,
        badge_type: 'month_master',
        earned_at: new Date().toISOString(),
      });
      toast.success('Achievement unlocked: Month Master! 🌟');
    }

    // Perfect Day (100% completion)
    if (!earnedTypes.has('perfect_day') && habits.length > 0) {
      const completedToday = todayCompletions.filter(c => c.completed).length;
      if (completedToday >= habits.length) {
        await createAchievement({
          user_id: user.id,
          badge_type: 'perfect_day',
          earned_at: new Date().toISOString(),
        });
        toast.success('Achievement unlocked: Perfect Day! ✨');
      }
    }

    // Century Club (100 total completions)
    if (!earnedTypes.has('century_club')) {
      const totalCompletions = allCompletions.filter(c => c.completed).length;
      if (totalCompletions >= 100) {
        await createAchievement({
          user_id: user.id,
          badge_type: 'century_club',
          earned_at: new Date().toISOString(),
        });
        toast.success('Achievement unlocked: Century Club! 🏆');
      }
    }

    // Level achievements
    if (!earnedTypes.has('level_10') && user.current_level >= 10) {
      await createAchievement({
        user_id: user.id,
        badge_type: 'level_10',
        earned_at: new Date().toISOString(),
      });
      toast.success('Achievement unlocked: Level 10! 🎯');
    }

    if (!earnedTypes.has('level_25') && user.current_level >= 25) {
      await createAchievement({
        user_id: user.id,
        badge_type: 'level_25',
        earned_at: new Date().toISOString(),
      });
      toast.success('Achievement unlocked: Level 25! 🎯');
    }

    if (!earnedTypes.has('level_50') && user.current_level >= 50) {
      await createAchievement({
        user_id: user.id,
        badge_type: 'level_50',
        earned_at: new Date().toISOString(),
      });
      toast.success('Achievement unlocked: Level 50! 🎯');
    }
  }

  return {
    awardXP,
    checkAndUpdateStreaks,
    checkAchievements,
    calculateLevel,
  };
}

