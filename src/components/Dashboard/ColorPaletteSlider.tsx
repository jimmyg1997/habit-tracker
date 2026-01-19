import { useState } from 'react';
import { PASTEL_COLORS } from '../../utils/categoryUtils';
import RGBColorPicker from './RGBColorPicker';
import { Palette, Sliders } from 'lucide-react';

interface ColorPaletteSliderProps {
  selectedColorIndex: number;
  selectedRGB?: { r: number; g: number; b: number } | null;
  onColorChange: (index: number, rgbColor?: { r: number; g: number; b: number } | null) => void;
}

export default function ColorPaletteSlider({ selectedColorIndex, selectedRGB, onColorChange }: ColorPaletteSliderProps) {
  const [showRGBPicker, setShowRGBPicker] = useState(false);
  const isCustomRGB = selectedRGB !== null && selectedRGB !== undefined;

  return (
    <div className="w-full">
      {/* Preset Colors */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {PASTEL_COLORS.map((color, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onColorChange(index, null)}
            className={`flex-shrink-0 h-16 w-16 rounded-lg border-2 transition-all ${
              selectedColorIndex === index && !isCustomRGB
                ? 'border-gray-900 dark:border-white scale-110 shadow-lg ring-2 ring-primary'
                : 'border-gray-200 dark:border-slate-600 hover:scale-105'
            } bg-gradient-to-br ${color.bg} dark:bg-gradient-to-br ${color.dark}`}
            title={color.name}
          />
        ))}
      </div>

      {/* RGB Picker Toggle */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowRGBPicker(!showRGBPicker)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            showRGBPicker || isCustomRGB
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          {isCustomRGB ? <Palette className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          <span>{isCustomRGB ? 'Custom RGB' : 'Custom Color'}</span>
        </button>
        {!isCustomRGB && (
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            {PASTEL_COLORS[selectedColorIndex]?.name || 'Select a color'}
          </div>
        )}
        {isCustomRGB && selectedRGB && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border border-gray-300 dark:border-slate-600"
              style={{ backgroundColor: `rgb(${selectedRGB.r}, ${selectedRGB.g}, ${selectedRGB.b})` }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              RGB({selectedRGB.r}, {selectedRGB.g}, {selectedRGB.b})
            </span>
          </div>
        )}
      </div>

      {/* RGB Color Picker */}
      {showRGBPicker && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
          <RGBColorPicker
            onColorSelect={(r, g, b) => onColorChange(-1, { r, g, b })}
            initialColor={selectedRGB || undefined}
          />
        </div>
      )}
    </div>
  );
}

