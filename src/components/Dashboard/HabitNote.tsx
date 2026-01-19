import { useState, useEffect, useRef } from 'react';
import { debounce } from '../../utils/debounce';
import type { HabitCompletion } from '../../types';

interface HabitNoteProps {
  completion: HabitCompletion | undefined;
  onUpdate: (completionId: string, updates: Partial<HabitCompletion>) => void;
}

export default function HabitNote({ completion, onUpdate }: HabitNoteProps) {
  const [note, setNote] = useState(completion?.note ?? '');
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    // Only update from completion if we haven't initialized yet, or if completion ID changed
    if (completion && (initializedRef.current !== completion.id || !initializedRef.current)) {
      setNote(completion?.note ?? '');
      initializedRef.current = completion.id;
    }
  }, [completion?.id, completion?.note]);

  const debouncedSave = debounce((value: string) => {
    if (completion) {
      onUpdate(completion.id, { note: value || null });
    }
  }, 500);

  const handleChange = (value: string) => {
    setNote(value);
    debouncedSave(value);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
        Note:
      </label>
      <textarea
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-xs resize-none"
        rows={3}
        placeholder="Add a note..."
      />
    </div>
  );
}


