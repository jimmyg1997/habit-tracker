// Pastel natural color palette - ultra light and subtle with diverse options
// Expanded to 50+ colors for maximum diversity with very light opacity
export const PASTEL_COLORS = [
  // Purples & Violets
  { name: 'Lavender', bg: 'from-purple-50/20 to-lavender-50/20', dark: 'from-purple-950/5 to-lavender-950/5', border: 'border-purple-200/20 dark:border-purple-800/10' },
  { name: 'Lilac', bg: 'from-violet-50/20 to-purple-50/20', dark: 'from-violet-950/5 to-purple-950/5', border: 'border-violet-200/20 dark:border-violet-800/10' },
  { name: 'Periwinkle', bg: 'from-indigo-50/20 to-purple-50/20', dark: 'from-indigo-950/5 to-purple-950/5', border: 'border-indigo-200/20 dark:border-purple-800/10' },
  { name: 'Lavender Mist', bg: 'from-purple-50/20 to-pink-50/20', dark: 'from-purple-950/5 to-pink-950/5', border: 'border-purple-200/20 dark:border-pink-800/10' },
  { name: 'Orchid', bg: 'from-fuchsia-50/20 to-purple-50/20', dark: 'from-fuchsia-950/5 to-purple-950/5', border: 'border-fuchsia-200/20 dark:border-purple-800/10' },
  { name: 'Plum', bg: 'from-purple-50/20 to-pink-50/20', dark: 'from-purple-950/5 to-pink-950/5', border: 'border-purple-200/20 dark:border-pink-800/10' },
  
  // Pinks & Roses
  { name: 'Rose', bg: 'from-rose-50/20 to-pink-50/20', dark: 'from-rose-950/5 to-pink-950/5', border: 'border-rose-200/20 dark:border-rose-800/10' },
  { name: 'Blush', bg: 'from-pink-50/20 to-rose-50/20', dark: 'from-pink-950/5 to-rose-950/5', border: 'border-pink-200/20 dark:border-rose-800/10' },
  { name: 'Dusty Rose', bg: 'from-rose-50/20 to-pink-50/20', dark: 'from-rose-950/5 to-pink-950/5', border: 'border-rose-200/20 dark:border-pink-800/10' },
  { name: 'Peony', bg: 'from-pink-50/20 to-fuchsia-50/20', dark: 'from-pink-950/5 to-fuchsia-950/5', border: 'border-pink-200/20 dark:border-fuchsia-800/10' },
  { name: 'Cherry Blossom', bg: 'from-pink-50/20 to-rose-50/20', dark: 'from-pink-950/5 to-rose-950/5', border: 'border-pink-200/20 dark:border-rose-800/10' },
  
  // Blues & Cyans
  { name: 'Sky', bg: 'from-cyan-50/20 to-blue-50/20', dark: 'from-cyan-950/5 to-blue-950/5', border: 'border-cyan-200/20 dark:border-cyan-800/10' },
  { name: 'Ocean', bg: 'from-blue-50/20 to-indigo-50/20', dark: 'from-blue-950/5 to-indigo-950/5', border: 'border-blue-200/20 dark:border-indigo-800/10' },
  { name: 'Aqua', bg: 'from-cyan-50/20 to-teal-50/20', dark: 'from-cyan-950/5 to-teal-950/5', border: 'border-cyan-200/20 dark:border-teal-800/10' },
  { name: 'Azure', bg: 'from-blue-50/20 to-cyan-50/20', dark: 'from-blue-950/5 to-cyan-950/5', border: 'border-blue-200/20 dark:border-cyan-800/10' },
  { name: 'Powder Blue', bg: 'from-sky-50/20 to-blue-50/20', dark: 'from-sky-950/5 to-blue-950/5', border: 'border-sky-200/20 dark:border-blue-800/10' },
  { name: 'Baby Blue', bg: 'from-blue-50/20 to-cyan-50/20', dark: 'from-blue-950/5 to-cyan-950/5', border: 'border-blue-200/20 dark:border-cyan-800/10' },
  
  // Greens & Teals
  { name: 'Sage', bg: 'from-green-50/20 to-emerald-50/20', dark: 'from-green-950/5 to-emerald-950/5', border: 'border-green-200/20 dark:border-green-800/10' },
  { name: 'Mint', bg: 'from-teal-50/20 to-cyan-50/20', dark: 'from-teal-950/5 to-cyan-950/5', border: 'border-teal-200/20 dark:border-teal-800/10' },
  { name: 'Forest', bg: 'from-emerald-50/20 to-green-50/20', dark: 'from-emerald-950/5 to-green-950/5', border: 'border-emerald-200/20 dark:border-green-800/10' },
  { name: 'Seafoam', bg: 'from-teal-50/20 to-emerald-50/20', dark: 'from-teal-950/5 to-emerald-950/5', border: 'border-teal-200/20 dark:border-emerald-800/10' },
  { name: 'Meadow', bg: 'from-lime-50/20 to-green-50/20', dark: 'from-lime-950/5 to-green-950/5', border: 'border-lime-200/20 dark:border-green-800/10' },
  { name: 'Jade', bg: 'from-emerald-50/20 to-teal-50/20', dark: 'from-emerald-950/5 to-teal-950/5', border: 'border-emerald-200/20 dark:border-teal-800/10' },
  { name: 'Eucalyptus', bg: 'from-green-50/20 to-teal-50/20', dark: 'from-green-950/5 to-teal-950/5', border: 'border-green-200/20 dark:border-teal-800/10' },
  
  // Yellows & Oranges
  { name: 'Butter', bg: 'from-yellow-50/20 to-amber-50/20', dark: 'from-yellow-950/5 to-amber-950/5', border: 'border-yellow-200/20 dark:border-yellow-800/10' },
  { name: 'Peach', bg: 'from-orange-50/20 to-amber-50/20', dark: 'from-orange-950/5 to-amber-950/5', border: 'border-orange-200/20 dark:border-orange-800/10' },
  { name: 'Honey', bg: 'from-amber-50/20 to-yellow-50/20', dark: 'from-amber-950/5 to-yellow-950/5', border: 'border-amber-200/20 dark:border-yellow-800/10' },
  { name: 'Sunset', bg: 'from-pink-50/20 to-orange-50/20', dark: 'from-pink-950/5 to-orange-950/5', border: 'border-pink-200/20 dark:border-orange-800/10' },
  { name: 'Coral', bg: 'from-rose-50/20 to-orange-50/20', dark: 'from-rose-950/5 to-orange-950/5', border: 'border-rose-200/20 dark:border-orange-800/10' },
  { name: 'Apricot', bg: 'from-orange-50/20 to-amber-50/20', dark: 'from-orange-950/5 to-amber-950/5', border: 'border-orange-200/20 dark:border-amber-800/10' },
  { name: 'Cream', bg: 'from-yellow-50/20 to-amber-50/20', dark: 'from-yellow-950/5 to-amber-950/5', border: 'border-yellow-200/20 dark:border-amber-800/10' },
  { name: 'Lemon', bg: 'from-yellow-50/20 to-lime-50/20', dark: 'from-yellow-950/5 to-lime-950/5', border: 'border-yellow-200/20 dark:border-lime-800/10' },
  
  // Reds & Warm Tones
  { name: 'Salmon', bg: 'from-red-50/20 to-pink-50/20', dark: 'from-red-950/5 to-pink-950/5', border: 'border-red-200/20 dark:border-pink-800/10' },
  { name: 'Terracotta', bg: 'from-orange-50/20 to-red-50/20', dark: 'from-orange-950/5 to-red-950/5', border: 'border-orange-200/20 dark:border-red-800/10' },
  { name: 'Strawberry', bg: 'from-red-50/20 to-rose-50/20', dark: 'from-red-950/5 to-rose-950/5', border: 'border-red-200/20 dark:border-rose-800/10' },
  
  // Neutrals & Earth Tones
  { name: 'Sand', bg: 'from-stone-50/20 to-amber-50/20', dark: 'from-stone-950/5 to-amber-950/5', border: 'border-stone-200/20 dark:border-amber-800/10' },
  { name: 'Beige', bg: 'from-stone-50/20 to-yellow-50/20', dark: 'from-stone-950/5 to-yellow-950/5', border: 'border-stone-200/20 dark:border-yellow-800/10' },
  { name: 'Taupe', bg: 'from-zinc-50/20 to-stone-50/20', dark: 'from-zinc-950/5 to-stone-950/5', border: 'border-zinc-200/20 dark:border-stone-800/10' },
  { name: 'Ivory', bg: 'from-stone-50/20 to-amber-50/20', dark: 'from-stone-950/5 to-amber-950/5', border: 'border-stone-200/20 dark:border-amber-800/10' },
  
  // Special Combinations
  { name: 'Tropical', bg: 'from-teal-50/20 to-pink-50/20', dark: 'from-teal-950/5 to-pink-950/5', border: 'border-teal-200/20 dark:border-pink-800/10' },
  { name: 'Sunrise', bg: 'from-yellow-50/20 to-pink-50/20', dark: 'from-yellow-950/5 to-pink-950/5', border: 'border-yellow-200/20 dark:border-pink-800/10' },
  { name: 'Ocean Breeze', bg: 'from-cyan-50/20 to-blue-50/20', dark: 'from-cyan-950/5 to-blue-950/5', border: 'border-cyan-200/20 dark:border-blue-800/10' },
  { name: 'Spring', bg: 'from-green-50/20 to-yellow-50/20', dark: 'from-green-950/5 to-yellow-950/5', border: 'border-green-200/20 dark:border-yellow-800/10' },
  { name: 'Autumn', bg: 'from-orange-50/20 to-red-50/20', dark: 'from-orange-950/5 to-red-950/5', border: 'border-orange-200/20 dark:border-red-800/10' },
  { name: 'Winter', bg: 'from-blue-50/20 to-cyan-50/20', dark: 'from-blue-950/5 to-cyan-950/5', border: 'border-blue-200/20 dark:border-cyan-800/10' },
  { name: 'Tulip', bg: 'from-pink-50/20 to-yellow-50/20', dark: 'from-pink-950/5 to-yellow-950/5', border: 'border-pink-200/20 dark:border-yellow-800/10' },
  { name: 'Lavender Field', bg: 'from-purple-50/20 to-green-50/20', dark: 'from-purple-950/5 to-green-950/5', border: 'border-purple-200/20 dark:border-green-800/10' },
  { name: 'Cotton Candy', bg: 'from-pink-50/20 to-cyan-50/20', dark: 'from-pink-950/5 to-cyan-950/5', border: 'border-pink-200/20 dark:border-cyan-800/10' },
  { name: 'Iris', bg: 'from-indigo-50/20 to-purple-50/20', dark: 'from-indigo-950/5 to-purple-950/5', border: 'border-indigo-200/20 dark:border-purple-800/10' },
  { name: 'Lilac Dream', bg: 'from-purple-50/20 to-pink-50/20', dark: 'from-purple-950/5 to-pink-950/5', border: 'border-purple-200/20 dark:border-pink-800/10' },
  { name: 'Mint Chip', bg: 'from-teal-50/20 to-green-50/20', dark: 'from-teal-950/5 to-green-950/5', border: 'border-teal-200/20 dark:border-green-800/10' },
  { name: 'Peach Melba', bg: 'from-orange-50/20 to-pink-50/20', dark: 'from-orange-950/5 to-pink-950/5', border: 'border-orange-200/20 dark:border-pink-800/10' },
  { name: 'Buttercup', bg: 'from-yellow-50/20 to-orange-50/20', dark: 'from-yellow-950/5 to-orange-950/5', border: 'border-yellow-200/20 dark:border-orange-800/10' },
  
  // Ultra Light Options
  { name: 'Whisper Pink', bg: 'from-pink-50/10 to-rose-50/10', dark: 'from-pink-950/3 to-rose-950/3', border: 'border-pink-200/15 dark:border-pink-800/5' },
  { name: 'Whisper Blue', bg: 'from-blue-50/10 to-cyan-50/10', dark: 'from-blue-950/3 to-cyan-950/3', border: 'border-blue-200/15 dark:border-blue-800/5' },
  { name: 'Whisper Green', bg: 'from-green-50/10 to-emerald-50/10', dark: 'from-green-950/3 to-emerald-950/3', border: 'border-green-200/15 dark:border-green-800/5' },
  { name: 'Whisper Purple', bg: 'from-purple-50/10 to-violet-50/10', dark: 'from-purple-950/3 to-violet-950/3', border: 'border-purple-200/15 dark:border-purple-800/5' },
  { name: 'Whisper Yellow', bg: 'from-yellow-50/10 to-amber-50/10', dark: 'from-yellow-950/3 to-amber-950/3', border: 'border-yellow-200/15 dark:border-yellow-800/5' },
  { name: 'Whisper Peach', bg: 'from-orange-50/10 to-pink-50/10', dark: 'from-orange-950/3 to-pink-950/3', border: 'border-orange-200/15 dark:border-orange-800/5' },
  { name: 'Whisper Mint', bg: 'from-teal-50/10 to-cyan-50/10', dark: 'from-teal-950/3 to-cyan-950/3', border: 'border-teal-200/15 dark:border-teal-800/5' },
  { name: 'Whisper Lavender', bg: 'from-purple-50/10 to-pink-50/10', dark: 'from-purple-950/3 to-pink-950/3', border: 'border-purple-200/15 dark:border-purple-800/5' },
  
  // Additional Light Soft Colors (30+ new options)
  // Soft Pastels - Light Blue Tones
  { name: 'Soft Sky', bg: 'from-sky-50/20 to-blue-50/20', dark: 'from-sky-950/5 to-blue-950/5', border: 'border-sky-200/20 dark:border-sky-800/10' },
  { name: 'Pale Blue', bg: 'from-blue-50/20 to-indigo-50/20', dark: 'from-blue-950/5 to-indigo-950/5', border: 'border-blue-200/20 dark:border-indigo-800/10' },
  { name: 'Light Cyan', bg: 'from-cyan-50/20 to-sky-50/20', dark: 'from-cyan-950/5 to-sky-950/5', border: 'border-cyan-200/20 dark:border-sky-800/10' },
  { name: 'Cloud Blue', bg: 'from-blue-50/20 to-cyan-50/20', dark: 'from-blue-950/5 to-cyan-950/5', border: 'border-blue-200/20 dark:border-cyan-800/10' },
  { name: 'Ice Blue', bg: 'from-cyan-50/20 to-blue-50/20', dark: 'from-cyan-950/5 to-blue-950/5', border: 'border-cyan-200/20 dark:border-blue-800/10' },
  
  // Soft Pastels - Light Pink Tones
  { name: 'Soft Pink', bg: 'from-pink-50/20 to-rose-50/20', dark: 'from-pink-950/5 to-rose-950/5', border: 'border-pink-200/20 dark:border-rose-800/10' },
  { name: 'Pale Rose', bg: 'from-rose-50/20 to-pink-50/20', dark: 'from-rose-950/5 to-pink-950/5', border: 'border-rose-200/20 dark:border-pink-800/10' },
  { name: 'Light Blush', bg: 'from-pink-50/20 to-fuchsia-50/20', dark: 'from-pink-950/5 to-fuchsia-950/5', border: 'border-pink-200/20 dark:border-fuchsia-800/10' },
  { name: 'Powder Pink', bg: 'from-rose-50/20 to-pink-50/20', dark: 'from-rose-950/5 to-pink-950/5', border: 'border-rose-200/20 dark:border-pink-800/10' },
  { name: 'Baby Pink', bg: 'from-pink-50/20 to-rose-50/20', dark: 'from-pink-950/5 to-rose-950/5', border: 'border-pink-200/20 dark:border-rose-800/10' },
  
  // Soft Pastels - Light Purple Tones
  { name: 'Soft Purple', bg: 'from-purple-50/20 to-violet-50/20', dark: 'from-purple-950/5 to-violet-950/5', border: 'border-purple-200/20 dark:border-violet-800/10' },
  { name: 'Pale Lavender', bg: 'from-violet-50/20 to-purple-50/20', dark: 'from-violet-950/5 to-purple-950/5', border: 'border-violet-200/20 dark:border-purple-800/10' },
  { name: 'Light Lilac', bg: 'from-purple-50/20 to-pink-50/20', dark: 'from-purple-950/5 to-pink-950/5', border: 'border-purple-200/20 dark:border-pink-800/10' },
  { name: 'Misty Purple', bg: 'from-violet-50/20 to-indigo-50/20', dark: 'from-violet-950/5 to-indigo-950/5', border: 'border-violet-200/20 dark:border-indigo-800/10' },
  { name: 'Dusty Lavender', bg: 'from-purple-50/20 to-indigo-50/20', dark: 'from-purple-950/5 to-indigo-950/5', border: 'border-purple-200/20 dark:border-indigo-800/10' },
  
  // Soft Pastels - Light Green Tones
  { name: 'Soft Green', bg: 'from-green-50/20 to-emerald-50/20', dark: 'from-green-950/5 to-emerald-950/5', border: 'border-green-200/20 dark:border-emerald-800/10' },
  { name: 'Pale Mint', bg: 'from-emerald-50/20 to-teal-50/20', dark: 'from-emerald-950/5 to-teal-950/5', border: 'border-emerald-200/20 dark:border-teal-800/10' },
  { name: 'Light Sage', bg: 'from-teal-50/20 to-green-50/20', dark: 'from-teal-950/5 to-green-950/5', border: 'border-teal-200/20 dark:border-green-800/10' },
  { name: 'Pale Lime', bg: 'from-lime-50/20 to-green-50/20', dark: 'from-lime-950/5 to-green-950/5', border: 'border-lime-200/20 dark:border-green-800/10' },
  { name: 'Soft Emerald', bg: 'from-emerald-50/20 to-cyan-50/20', dark: 'from-emerald-950/5 to-cyan-950/5', border: 'border-emerald-200/20 dark:border-cyan-800/10' },
  
  // Soft Pastels - Light Yellow/Orange Tones
  { name: 'Soft Yellow', bg: 'from-yellow-50/20 to-amber-50/20', dark: 'from-yellow-950/5 to-amber-950/5', border: 'border-yellow-200/20 dark:border-amber-800/10' },
  { name: 'Pale Peach', bg: 'from-orange-50/20 to-pink-50/20', dark: 'from-orange-950/5 to-pink-950/5', border: 'border-orange-200/20 dark:border-pink-800/10' },
  { name: 'Light Honey', bg: 'from-amber-50/20 to-yellow-50/20', dark: 'from-amber-950/5 to-yellow-950/5', border: 'border-amber-200/20 dark:border-yellow-800/10' },
  { name: 'Soft Apricot', bg: 'from-orange-50/20 to-amber-50/20', dark: 'from-orange-950/5 to-amber-950/5', border: 'border-orange-200/20 dark:border-amber-800/10' },
  { name: 'Pale Butter', bg: 'from-yellow-50/20 to-lime-50/20', dark: 'from-yellow-950/5 to-lime-950/5', border: 'border-yellow-200/20 dark:border-lime-800/10' },
  
  // Soft Pastels - Light Neutral Tones
  { name: 'Soft Gray', bg: 'from-gray-50/20 to-slate-50/20', dark: 'from-gray-950/5 to-slate-950/5', border: 'border-gray-200/20 dark:border-slate-800/10' },
  { name: 'Pale Beige', bg: 'from-stone-50/20 to-amber-50/20', dark: 'from-stone-950/5 to-amber-950/5', border: 'border-stone-200/20 dark:border-amber-800/10' },
  { name: 'Light Taupe', bg: 'from-zinc-50/20 to-stone-50/20', dark: 'from-zinc-950/5 to-stone-950/5', border: 'border-zinc-200/20 dark:border-stone-800/10' },
  { name: 'Soft Ivory', bg: 'from-stone-50/20 to-yellow-50/20', dark: 'from-stone-950/5 to-yellow-950/5', border: 'border-stone-200/20 dark:border-yellow-800/10' },
  { name: 'Pale Cream', bg: 'from-yellow-50/20 to-stone-50/20', dark: 'from-yellow-950/5 to-stone-950/5', border: 'border-yellow-200/20 dark:border-stone-800/10' },
  
  // Soft Pastels - Light Mixed Tones
  { name: 'Soft Sunrise', bg: 'from-yellow-50/20 to-pink-50/20', dark: 'from-yellow-950/5 to-pink-950/5', border: 'border-yellow-200/20 dark:border-pink-800/10' },
  { name: 'Pale Sunset', bg: 'from-pink-50/20 to-orange-50/20', dark: 'from-pink-950/5 to-orange-950/5', border: 'border-pink-200/20 dark:border-orange-800/10' },
  { name: 'Light Ocean', bg: 'from-cyan-50/20 to-teal-50/20', dark: 'from-cyan-950/5 to-teal-950/5', border: 'border-cyan-200/20 dark:border-teal-800/10' },
  { name: 'Soft Meadow', bg: 'from-green-50/20 to-yellow-50/20', dark: 'from-green-950/5 to-yellow-950/5', border: 'border-green-200/20 dark:border-yellow-800/10' },
  { name: 'Pale Spring', bg: 'from-lime-50/20 to-cyan-50/20', dark: 'from-lime-950/5 to-cyan-950/5', border: 'border-lime-200/20 dark:border-cyan-800/10' },
  { name: 'Light Dream', bg: 'from-purple-50/20 to-cyan-50/20', dark: 'from-purple-950/5 to-cyan-950/5', border: 'border-purple-200/20 dark:border-cyan-800/10' },
  { name: 'Soft Petal', bg: 'from-pink-50/20 to-yellow-50/20', dark: 'from-pink-950/5 to-yellow-950/5', border: 'border-pink-200/20 dark:border-yellow-800/10' },
  { name: 'Pale Mist', bg: 'from-blue-50/20 to-purple-50/20', dark: 'from-blue-950/5 to-purple-950/5', border: 'border-blue-200/20 dark:border-purple-800/10' },
] as const;

// Extract emoji from category string (e.g., "📝 Productivity" -> "📝")
export function extractEmojiFromCategory(category: string): string {
  // Match emoji at the start of the string
  const emojiMatch = category.match(/^[\p{Emoji}\u200d]+/u);
  return emojiMatch ? emojiMatch[0] : '📋';
}

// Extract name from category string (e.g., "📝 Productivity" -> "Productivity")
export function extractNameFromCategory(category: string): string {
  // Remove emoji and color info, then trim
  let name = category.replace(/^[\p{Emoji}\u200d]+\s*/u, '').trim();
  // Remove color suffix if present (both |color:index and |rgb:r,g,b)
  name = name.replace(/\|color:\d+$/, '').trim();
  name = name.replace(/\|rgb:\d+,\d+,\d+$/, '').trim();
  return name || category;
}

// Extract color index from category string
export function getCategoryColorIndex(category: string): number {
  const colorMatch = category.match(/\|color:(\d+)$/);
  if (colorMatch) {
    const index = parseInt(colorMatch[1], 10);
    if (index >= 0 && index < PASTEL_COLORS.length) {
      return index;
    }
  }
  // Check for RGB color
  const rgbMatch = category.match(/\|rgb:(\d+),(\d+),(\d+)$/);
  if (rgbMatch) {
    // For RGB colors, return -1 to indicate custom color
    return -1;
  }
  // Fallback: use hash of category name
  const name = extractNameFromCategory(category);
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % PASTEL_COLORS.length;
}

// Convert RGB to Tailwind gradient classes and inline styles
export function rgbToTailwindGradient(r: number, g: number, b: number): { 
  bg: string; 
  dark: string; 
  border: string;
  bgStyle?: { background: string };
  darkStyle?: { background: string };
  borderStyle?: { borderColor: string };
} {
  // Create slightly lighter and darker variants for gradient
  const r2 = Math.min(255, r + 10);
  const g2 = Math.min(255, g + 10);
  const b2 = Math.min(255, b + 10);
  
  // For dark mode, use very dark versions
  const darkR = Math.floor(r * 0.1);
  const darkG = Math.floor(g * 0.1);
  const darkB = Math.floor(b * 0.1);
  const darkR2 = Math.floor(r2 * 0.1);
  const darkG2 = Math.floor(g2 * 0.1);
  const darkB2 = Math.floor(b2 * 0.1);
  
  return {
    bg: `from-[rgb(${r},${g},${b})/20] to-[rgb(${r2},${g2},${b2})/20]`,
    dark: `from-[rgb(${darkR},${darkG},${darkB})/5] to-[rgb(${darkR2},${darkG2},${darkB2})/5]`,
    border: `border-[rgb(${r},${g},${b})/20] dark:border-[rgb(${darkR},${darkG},${darkB})/10]`,
    bgStyle: {
      background: `linear-gradient(to bottom right, rgba(${r}, ${g}, ${b}, 0.2), rgba(${r2}, ${g2}, ${b2}, 0.2))`
    },
    darkStyle: {
      background: `linear-gradient(to bottom right, rgba(${darkR}, ${darkG}, ${darkB}, 0.05), rgba(${darkR2}, ${darkG2}, ${darkB2}, 0.05))`
    },
    borderStyle: {
      borderColor: `rgba(${r}, ${g}, ${b}, 0.2)`
    }
  };
}

// Extract RGB color from category string
export function getCategoryRGB(category: string): { r: number; g: number; b: number } | null {
  const rgbMatch = category.match(/\|rgb:(\d+),(\d+),(\d+)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  return null;
}

// Get color object for category (supports both preset and RGB)
export function getCategoryColor(category: string): typeof PASTEL_COLORS[number] | ReturnType<typeof rgbToTailwindGradient> {
  const rgb = getCategoryRGB(category);
  if (rgb) {
    return rgbToTailwindGradient(rgb.r, rgb.g, rgb.b);
  }
  const index = getCategoryColorIndex(category);
  return PASTEL_COLORS[index];
}

// Create category string from emoji and name
export function createCategoryString(emoji: string, name: string, colorIndex?: number, rgbColor?: { r: number; g: number; b: number }): string {
  // If RGB color is provided, use that
  if (rgbColor) {
    return `${emoji} ${name}|rgb:${rgbColor.r},${rgbColor.g},${rgbColor.b}`;
  }
  // Include color index in the category string if provided
  if (colorIndex !== undefined && colorIndex >= 0 && colorIndex < PASTEL_COLORS.length) {
    return `${emoji} ${name}|color:${colorIndex}`;
  }
  // Fallback: use emoji and name only (for backward compatibility)
  return `${emoji} ${name}`;
}


