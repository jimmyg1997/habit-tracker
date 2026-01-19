import { useState } from 'react';
import { Palette } from 'lucide-react';

interface RGBColorPickerProps {
  onColorSelect: (r: number, g: number, b: number) => void;
  initialColor?: { r: number; g: number; b: number };
}

export default function RGBColorPicker({ onColorSelect, initialColor }: RGBColorPickerProps) {
  const [r, setR] = useState(initialColor?.r ?? 200);
  const [g, setG] = useState(initialColor?.g ?? 200);
  const [b, setB] = useState(initialColor?.b ?? 200);

  const updateColor = (newR: number, newG: number, newB: number) => {
    setR(newR);
    setG(newG);
    setB(newB);
    onColorSelect(newR, newG, newB);
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  };

  // Generate pastel RGB colors (light, desaturated)
  const generatePastelRGB = (hue: number) => {
    // Convert HSL to RGB for pastel colors
    const h = hue / 360;
    const s = 0.3; // Low saturation for pastel
    const l = 0.85; // High lightness for pastel
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // Generate a palette of pastel colors - expanded to 48 colors
  const pastelPalette = Array.from({ length: 48 }, (_, i) => {
    const hue = (i * 360) / 48;
    return generatePastelRGB(hue);
  });

  return (
    <div className="space-y-4">
      {/* Quick Pastel Palette */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quick Pastel Colors
        </label>
        <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
          {pastelPalette.map((color, index) => (
            <button
              key={index}
              type="button"
              onClick={() => updateColor(color.r, color.g, color.b)}
              className="h-10 w-10 rounded-lg border-2 border-gray-200 dark:border-slate-600 hover:scale-110 transition-all shadow-sm"
              style={{
                backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
              }}
              title={`RGB(${color.r}, ${color.g}, ${color.b})`}
            />
          ))}
        </div>
      </div>

      {/* RGB Sliders */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom RGB Color
        </label>
        <div className="space-y-3">
          {/* Red */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Red</span>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{r}</span>
            </div>
            <input
              type="range"
              min="150"
              max="255"
              value={r}
              onChange={(e) => updateColor(parseInt(e.target.value), g, b)}
              className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(150, ${g}, ${b}), rgb(255, ${g}, ${b}))`,
              }}
            />
          </div>

          {/* Green */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Green</span>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{g}</span>
            </div>
            <input
              type="range"
              min="150"
              max="255"
              value={g}
              onChange={(e) => updateColor(r, parseInt(e.target.value), b)}
              className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(${r}, 150, ${b}), rgb(${r}, 255, ${b}))`,
              }}
            />
          </div>

          {/* Blue */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Blue</span>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{b}</span>
            </div>
            <input
              type="range"
              min="150"
              max="255"
              value={b}
              onChange={(e) => updateColor(r, g, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(${r}, ${g}, 150), rgb(${r}, ${g}, 255))`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div
          className="w-16 h-16 rounded-lg border-2 border-gray-200 dark:border-slate-600 shadow-sm"
          style={{
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
          }}
        />
        <div className="flex-1">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preview
          </div>
          <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
            RGB({r}, {g}, {b})
          </div>
          <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
            {rgbToHex(r, g, b)}
          </div>
        </div>
      </div>
    </div>
  );
}

