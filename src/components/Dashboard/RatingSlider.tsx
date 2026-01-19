import { useState } from 'react';
import { Frown, Smile } from 'lucide-react';

interface RatingSliderProps {
  value: number | null;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function RatingSlider({ 
  value, 
  min = 1, 
  max = 5, 
  onChange,
  disabled = false 
}: RatingSliderProps) {
  const currentValue = value ?? min;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  // Interpolate between sad and happy based on value
  const getEmoji = () => {
    if (currentValue <= 1) return '😢'; // Very sad
    if (currentValue <= 2) return '😞'; // Sad
    if (currentValue <= 3) return '😐'; // Neutral
    if (currentValue <= 4) return '🙂'; // Happy
    return '😊'; // Very happy
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Frown className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{min}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">{max}</span>
          <Smile className="w-3 h-3 text-gray-400" />
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={currentValue}
          onChange={(e) => {
            const newValue = parseInt(e.target.value, 10);
            if (!isNaN(newValue)) {
              onChange(newValue);
            }
          }}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #9ca3af 0%, #9ca3af ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
            pointerEvents: disabled ? 'none' : 'auto',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </div>
      <div className="text-center">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {currentValue}
        </span>
      </div>
    </div>
  );
}

