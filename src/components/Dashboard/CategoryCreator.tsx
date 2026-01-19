import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import ColorPaletteSlider from './ColorPaletteSlider';

interface CategoryCreatorProps {
  onCreate: (categoryName: string, emoji: string, colorIndex: number, rgbColor?: { r: number; g: number; b: number } | null) => void;
  onClose: () => void;
}

export default function CategoryCreator({ onCreate, onClose }: CategoryCreatorProps) {
  const [categoryName, setCategoryName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedRGB, setSelectedRGB] = useState<{ r: number; g: number; b: number } | null>(null);

  const handleColorChange = (index: number, rgbColor?: { r: number; g: number; b: number } | null) => {
    setSelectedColorIndex(index);
    setSelectedRGB(rgbColor || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    onCreate(categoryName.trim(), emoji, selectedColorIndex, selectedRGB);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-lg shadow-xl border border-violet-200/50 dark:border-violet-800/50 p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Category</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="e.g., Creative Projects"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Emoji
            </label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Color
            </label>
            <ColorPaletteSlider
              selectedColorIndex={selectedColorIndex}
              selectedRGB={selectedRGB}
              onColorChange={handleColorChange}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              Create Category
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}


