import { Clock } from 'lucide-react';

interface TimeSliderProps {
  value: number;
  min: number;
  max: number;
  estimated: number;
  onChange: (value: number) => void;
}

export default function TimeSlider({
  value,
  min,
  max,
  estimated,
  onChange,
}: TimeSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div 
      className="space-y-2" 
      style={{ 
        pointerEvents: 'auto', 
        position: 'relative', 
        zIndex: 1000,
        isolation: 'isolate'
      }}
      onMouseDown={(e) => {
        // Only stop propagation on initial click, not during drag
        if (e.target === e.currentTarget) {
          e.stopPropagation();
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Actual:</span>
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {value} min
        </span>
      </div>

      <div 
        className="relative" 
        style={{ 
          pointerEvents: 'auto', 
          position: 'relative', 
          zIndex: 1000,
          isolation: 'isolate'
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            e.stopPropagation();
          }
        }}
      >
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            e.stopPropagation();
            const newValue = parseInt(e.target.value, 10);
            if (!isNaN(newValue)) {
              onChange(newValue);
            }
          }}
          onInput={(e) => {
            e.stopPropagation();
            const newValue = parseInt((e.target as HTMLInputElement).value, 10);
            if (!isNaN(newValue)) {
              onChange(newValue);
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-grab active:cursor-grabbing slider"
          style={{
            background: `linear-gradient(to right, #10B981 0%, #10B981 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
            pointerEvents: 'auto',
            zIndex: 1000,
            position: 'relative',
            isolation: 'isolate',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
          }}
        />
        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
          <span>{min}m</span>
          <span className="text-primary font-medium">Est: {estimated}m</span>
          <span>{max}m</span>
        </div>
      </div>
    </div>
  );
}


