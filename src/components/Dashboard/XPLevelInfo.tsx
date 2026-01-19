import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, TrendingUp, Info, X } from 'lucide-react';
import type { User } from '../../types';

interface XPLevelInfoProps {
  user: User;
}

export default function XPLevelInfo({ user }: XPLevelInfoProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate level info
  const calculateLevel = (totalXP: number): number => {
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  };

  const getXPForLevel = (level: number): number => {
    return Math.pow(level - 1, 2) * 100;
  };

  const getXPForNextLevel = (level: number): number => {
    return Math.pow(level, 2) * 100;
  };

  const currentLevel = user.current_level;
  const currentXP = user.total_xp;
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForNextLevel(currentLevel);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progressToNext = (xpInCurrentLevel / xpNeededForNext) * 100;
  
  // Calculate max level (level 100 = 990,000 XP)
  const MAX_LEVEL = 100;
  const maxXP = getXPForLevel(MAX_LEVEL + 1);

  return (
    <>
      <button
        onClick={() => setShowDetails(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30 transition-all"
      >
        <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <div className="flex flex-col items-start">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">
            Level {currentLevel}
          </div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400">
            {currentXP.toLocaleString()} XP
          </div>
        </div>
        <Info className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    XP & Levels
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Level Progress */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        Level {currentLevel}
                      </span>
                    </div>
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="w-full h-3 bg-amber-200 dark:bg-amber-900/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                    />
                  </div>
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    {xpNeededForNext - xpInCurrentLevel} XP needed for Level {currentLevel + 1}
                  </div>
                </div>

                {/* How to Earn XP */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    How to Earn XP
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                      <span>Complete a habit</span>
                      <span className="font-semibold text-primary">+10 XP</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                      <span>Maintain a streak</span>
                      <span className="font-semibold text-primary">+5 XP/day</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                      <span>Perfect day (100% completion)</span>
                      <span className="font-semibold text-primary">+20 XP bonus</span>
                    </div>
                  </div>
                </div>

                {/* Level System Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Level System</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>
                      <strong>Formula:</strong> Level = √(Total XP / 100) + 1
                    </p>
                    <p>
                      <strong>Max Level:</strong> {MAX_LEVEL} ({maxXP.toLocaleString()} XP)
                    </p>
                    <p>
                      <strong>Current Progress:</strong> {((currentLevel / MAX_LEVEL) * 100).toFixed(1)}% to max level
                    </p>
                  </div>
                </div>

                {/* Level Milestones */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Upcoming Milestones</h4>
                  <div className="space-y-1 text-sm">
                    {[currentLevel + 1, currentLevel + 5, currentLevel + 10].map((level) => {
                      if (level > MAX_LEVEL) return null;
                      const xpNeeded = getXPForLevel(level);
                      return (
                        <div key={level} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Level {level}</span>
                          <span className="text-gray-500 dark:text-gray-500">
                            {xpNeeded.toLocaleString()} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
