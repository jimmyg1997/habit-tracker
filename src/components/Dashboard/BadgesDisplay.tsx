import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Target, Calendar, Zap, Star, Heart, Flame, CheckCircle, TrendingUp } from 'lucide-react';
import { getAchievements } from '../../lib/db';
import type { Achievement } from '../../types';

interface BadgesDisplayProps {
  userId: string;
}

interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: 'streak' | 'completion' | 'milestone' | 'special';
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { type: 'first_day', name: 'First Day', description: 'Complete your first habit', icon: Star, color: 'text-yellow-500', category: 'milestone' },
  { type: 'week_warrior', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Flame, color: 'text-orange-500', category: 'streak' },
  { type: 'month_master', name: 'Month Master', description: 'Maintain a 30-day streak', icon: Calendar, color: 'text-blue-500', category: 'streak' },
  { type: 'perfect_day', name: 'Perfect Day', description: 'Complete all habits in one day', icon: CheckCircle, color: 'text-green-500', category: 'completion' },
  { type: 'perfect_week', name: 'Perfect Week', description: 'Complete all habits for a week', icon: Target, color: 'text-purple-500', category: 'completion' },
  { type: 'early_bird', name: 'Early Bird', description: 'Complete 5 habits before 9 AM', icon: Zap, color: 'text-amber-500', category: 'special' },
  { type: 'night_owl', name: 'Night Owl', description: 'Complete 5 habits after 9 PM', icon: Star, color: 'text-indigo-500', category: 'special' },
  { type: 'century_club', name: 'Century Club', description: 'Reach 100 total completions', icon: Trophy, color: 'text-red-500', category: 'milestone' },
  { type: 'level_10', name: 'Level 10', description: 'Reach level 10', icon: TrendingUp, color: 'text-pink-500', category: 'milestone' },
  { type: 'level_25', name: 'Level 25', description: 'Reach level 25', icon: Award, color: 'text-cyan-500', category: 'milestone' },
  { type: 'level_50', name: 'Level 50', description: 'Reach level 50', icon: Heart, color: 'text-rose-500', category: 'milestone' },
];

export default function BadgesDisplay({ userId }: BadgesDisplayProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  async function loadAchievements() {
    try {
      const earned = await getAchievements(userId);
      setAchievements(earned);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }

  const earnedTypes = new Set(achievements.map(a => a.badge_type));
  const badgesByCategory = BADGE_DEFINITIONS.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, BadgeDefinition[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Badges & Achievements
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {earnedTypes.size} / {BADGE_DEFINITIONS.length} earned
        </div>
      </div>

      {Object.entries(badgesByCategory).map(([category, badges]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
            {category.replace('_', ' ')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {badges.map((badge) => {
              const isEarned = earnedTypes.has(badge.type);
              const Icon = badge.icon;
              
              return (
                <motion.div
                  key={badge.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 border-primary shadow-md'
                      : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`${isEarned ? badge.color : 'text-gray-400'}`}>
                      <Icon className={`w-8 h-8 ${isEarned ? '' : 'opacity-50'}`} />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {badge.name}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        {badge.description}
                      </div>
                    </div>
                    {isEarned && (
                      <div className="text-[10px] text-primary font-medium">
                        ✓ Earned
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
