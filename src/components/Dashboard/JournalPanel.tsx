import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Image, Video, X, Upload, Save, Check, ZoomIn, ChevronLeft, ChevronRight, Sparkles, Mic, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import type { HealthMetrics, AudioRecording } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import AudioRecorder from './AudioRecorder';
import { summarizeDay } from '../../lib/openai';
import { logger } from '../../utils/logger';

// Media Carousel Component
interface MediaCarouselProps {
  mediaUrls: string[];
  dateStr: string;
  onViewMedia: (url: string, type: 'image' | 'video', index: number) => void;
  onRemoveMedia: (index: number) => void;
}

function MediaCarousel({ mediaUrls, dateStr, onViewMedia, onRemoveMedia }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentUrl = mediaUrls[currentIndex];
  const isImage = currentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < mediaUrls.length - 1;

  return (
    <div className="mt-2 flex-1">
      <div className="relative group">
        <div
          onClick={() => onViewMedia(currentUrl, isImage ? 'image' : 'video', currentIndex)}
          className="cursor-pointer hover:opacity-90 transition-opacity relative"
        >
          {isImage ? (
            <img
              src={currentUrl}
              alt={`Media ${currentIndex + 1}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow"
            />
          ) : (
            <video
              src={currentUrl}
              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow"
            />
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 rounded-lg flex items-center justify-center transition-colors">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        
        {mediaUrls.length > 1 && (
          <>
            {hasPrevious && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(currentIndex - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(currentIndex + 1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/50 text-white text-xs rounded-full z-10">
              {currentIndex + 1} / {mediaUrls.length}
            </div>
          </>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveMedia(currentIndex);
            if (currentIndex >= mediaUrls.length - 1 && currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
            }
          }}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg z-10"
          title="Remove media"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

interface JournalPanelProps {
  metrics: HealthMetrics | null;
  weeklyMetrics?: Map<string, HealthMetrics>;
  onUpdate: (updates: Partial<HealthMetrics>, date?: string) => void;
  date: Date;
  weekDays?: Date[];
}

export default function JournalPanel({
  metrics,
  weeklyMetrics,
  onUpdate,
  date,
  weekDays,
}: JournalPanelProps) {
  const { user } = useAuth();
  const [localValues, setLocalValues] = useState<Map<string, string>>(new Map());
  const [mediaUrls, setMediaUrls] = useState<Map<string, string[]>>(new Map());
  const [audioRecordings, setAudioRecordings] = useState<Map<string, AudioRecording[]>>(new Map());
  const [summaries, setSummaries] = useState<Map<string, string>>(new Map());
  const [uploading, setUploading] = useState<Map<string, boolean>>(new Map());
  const [saving, setSaving] = useState<Map<string, boolean>>(new Map());
  const [saved, setSaved] = useState<Map<string, boolean>>(new Map());
  const [summarizing, setSummarizing] = useState<Map<string, boolean>>(new Map());
  const [recording, setRecording] = useState<Map<string, boolean>>(new Map());
  const [expandedSummaries, setExpandedSummaries] = useState<Map<string, boolean>>(new Map());
  const [viewingMedia, setViewingMedia] = useState<{ url: string; type: 'image' | 'video'; dateStr: string; index: number } | null>(null);
  const [journalPopup, setJournalPopup] = useState<{ dateStr: string; value: string } | null>(null);
  const [summaryPopup, setSummaryPopup] = useState<{ dateStr: string; summary: string } | null>(null);
  const isWeeklyView = !!weekDays && weekDays.length > 0;
  
  // Get OpenAI API key from environment or user input
  const getOpenAIKey = () => {
    // Priority: environment variable > localStorage
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    const localKey = localStorage.getItem('openai_api_key');
    
    return envKey || localKey || '';
  };

  const getMetricsForDate = (dateStr: string): HealthMetrics | null => {
    if (isWeeklyView && weeklyMetrics) {
      return weeklyMetrics.get(dateStr) || null;
    }
    return metrics;
  };

  // Save journal entry manually - includes all data (journal, media, recordings, summary)
  const handleSaveJournal = async (dateStr: string) => {
    const value = localValues.get(dateStr) || '';
    const dayMedia = mediaUrls.get(dateStr) || [];
    const dayRecordings = audioRecordings.get(dateStr) || [];
    const daySummary = summaries.get(dateStr) || null;
    
    logger.info('JOURNAL', 'Saving journal entry', { 
      date: dateStr,
      journalLength: value.length,
      mediaCount: dayMedia.length,
      recordingsCount: dayRecordings.length,
      hasSummary: !!daySummary
    }, user?.id);
    
    setSaving(prev => new Map(prev).set(dateStr, true));
    setSaved(prev => new Map(prev).set(dateStr, false));
    
    try {
      // Upload any pending audio recordings (those with blobs)
      const recordingsToUpload = dayRecordings.filter(r => r.blob);
      const uploadedRecordings = [...dayRecordings.filter(r => !r.blob)]; // Keep already uploaded ones
      
      if (recordingsToUpload.length > 0 && user) {
        logger.info('JOURNAL', 'Uploading pending audio recordings', { 
          count: recordingsToUpload.length 
        }, user.id);
        
        for (const recording of recordingsToUpload) {
          try {
            const fileName = `audio-${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
            const filePath = `${user.id}/${dateStr}/${fileName}`;

            const { data, error } = await supabase.storage
              .from('journal-media')
              .upload(filePath, recording.blob!, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'audio/webm',
              });

            if (error) {
              logger.error('JOURNAL', 'Failed to upload audio recording', { 
                error: error.message,
                recordingId: recording.id 
              }, user.id);
              continue; // Skip this recording but continue with others
            }

            const { data: { publicUrl } } = supabase.storage
              .from('journal-media')
              .getPublicUrl(filePath);

            // Revoke the local URL
            if (recording.url.startsWith('blob:')) {
              URL.revokeObjectURL(recording.url);
            }

            // Add uploaded recording with public URL
            uploadedRecordings.push({
              ...recording,
              url: publicUrl,
              blob: undefined, // Remove blob after upload
            });
          } catch (error: any) {
            logger.error('JOURNAL', 'Error uploading audio recording', { 
              error: error.message,
              recordingId: recording.id 
            }, user.id);
            // Continue with other recordings
          }
        }
      }

      // Save everything together: journal, media, recordings, and summary
      const updates: Partial<HealthMetrics> = {
        journal_note: value || null,
        media_urls: dayMedia.length > 0 ? dayMedia : null,
        audio_recordings: uploadedRecordings.length > 0 ? uploadedRecordings.map(r => ({
          id: r.id,
          url: r.url,
          duration: r.duration,
          timestamp: r.timestamp,
        })) : null,
        summary: daySummary || null,
      };
      
      const result = await onUpdate(updates, dateStr);
      if (result) {
        // Update local state with uploaded recordings (remove blobs)
        setAudioRecordings(prev => {
          const newMap = new Map(prev);
          newMap.set(dateStr, uploadedRecordings);
          return newMap;
        });
        
        // Mark as initialized after successful save
        initializedRef.current.add(dateStr);
        // Update local state with saved values to ensure consistency
        setLocalValues(prev => new Map(prev).set(dateStr, value));
        setSaved(prev => new Map(prev).set(dateStr, true));
        setTimeout(() => {
          setSaved(prev => {
            const newMap = new Map(prev);
            newMap.set(dateStr, false);
            return newMap;
          });
        }, 2000);
        logger.info('JOURNAL', 'Journal entry saved successfully', { 
          date: dateStr,
          saved: true 
        }, user?.id);
        toast.success('Journal entry saved (including media and recordings)');
      } else {
        logger.error('JOURNAL', 'Save returned null', { date: dateStr }, user?.id);
        throw new Error('Save returned null - check console for errors');
      }
    } catch (error: any) {
      logger.error('JOURNAL', 'Failed to save journal entry', { 
        date: dateStr,
        error: error.message 
      }, user?.id);
      console.error('Error saving journal:', error);
      toast.error('Failed to save journal entry. Check console for details.');
    } finally {
      setSaving(prev => {
        const newMap = new Map(prev);
        newMap.set(dateStr, false);
        return newMap;
      });
    }
  };

  // Track if we've initialized from database to avoid overwriting user input
  const initializedRef = useRef<Set<string>>(new Set());

  // Sync local values with metrics when they update from database
  // Always sync from database on load/refresh - it's the source of truth
  useEffect(() => {
    if (isWeeklyView && weekDays && weeklyMetrics) {
      weekDays.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayMetrics = weeklyMetrics.get(dateStr);
        if (dayMetrics) {
          const dbValue = dayMetrics.journal_note || '';
          const isCurrentlySaving = saving.get(dateStr);
          const isInitialized = initializedRef.current.has(dateStr);
          
          // Always sync from database on first load
          // After initialization, only sync if not currently saving
          if (!isInitialized || !isCurrentlySaving) {
            setLocalValues(prev => {
              const current = prev.get(dateStr);
              if (current !== dbValue) {
                const newMap = new Map(prev);
                newMap.set(dateStr, dbValue);
                if (!isInitialized) {
                  initializedRef.current.add(dateStr);
                }
                return newMap;
              }
              if (!isInitialized) {
                initializedRef.current.add(dateStr);
              }
              return prev;
            });
          }
          
          if (dayMetrics.media_urls) {
            setMediaUrls(prev => new Map(prev).set(dateStr, dayMetrics.media_urls || []));
          }
          if (dayMetrics.audio_recordings) {
            setAudioRecordings(prev => new Map(prev).set(dateStr, dayMetrics.audio_recordings || []));
          }
          if (dayMetrics.summary) {
            setSummaries(prev => new Map(prev).set(dateStr, dayMetrics.summary || ''));
          }
        } else {
          // If no metrics exist for this date, clear local state
          setLocalValues(prev => {
            if (prev.has(dateStr)) {
              const newMap = new Map(prev);
              newMap.delete(dateStr);
              initializedRef.current.delete(dateStr);
              return newMap;
            }
            return prev;
          });
        }
      });
    } else if (metrics) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dbValue = metrics.journal_note || '';
      const isCurrentlySaving = saving.get(dateStr);
      const isInitialized = initializedRef.current.has(dateStr);
      
      // Always sync from database on first load
      if (!isInitialized || !isCurrentlySaving) {
        setLocalValues(prev => {
          const current = prev.get(dateStr);
          if (current !== dbValue) {
            const newMap = new Map(prev);
            newMap.set(dateStr, dbValue);
            if (!isInitialized) {
              initializedRef.current.add(dateStr);
            }
            return newMap;
          }
          if (!isInitialized) {
            initializedRef.current.add(dateStr);
          }
          return prev;
        });
      }
      
      if (metrics.media_urls) {
        setMediaUrls(prev => new Map(prev).set(dateStr, metrics.media_urls || []));
      }
      if (metrics.audio_recordings) {
        setAudioRecordings(prev => new Map(prev).set(dateStr, metrics.audio_recordings || []));
      }
      if (metrics.summary) {
        setSummaries(prev => new Map(prev).set(dateStr, metrics.summary || ''));
      }
    } else {
      // If no metrics exist, clear local state
      const dateStr = format(date, 'yyyy-MM-dd');
      setLocalValues(prev => {
        if (prev.has(dateStr)) {
          const newMap = new Map(prev);
          newMap.delete(dateStr);
          initializedRef.current.delete(dateStr);
          return newMap;
        }
        return prev;
      });
    }
    // Sync whenever metrics/weeklyMetrics change (from database load)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, weeklyMetrics, weekDays, date, isWeeklyView]);

  const getJournalValue = (dateStr: string): string => {
    // Check local state first (for immediate UI updates)
    if (localValues.has(dateStr)) {
      return localValues.get(dateStr)!;
    }
    // Then check metrics
    const dayMetrics = getMetricsForDate(dateStr);
    return dayMetrics?.journal_note ?? '';
  };

  const handleJournalChange = (dateStr: string, value: string) => {
    // Update local state immediately for responsive UI
    setLocalValues(new Map(localValues).set(dateStr, value));
    // Clear saved indicator when user starts typing
    setSaved(prev => {
      const newMap = new Map(prev);
      newMap.set(dateStr, false);
      return newMap;
    });
  };

  const handleMediaUpload = async (dateStr: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(prev => new Map(prev).set(dateStr, true));

    try {
      // Check if bucket exists by trying to list files (simpler than listing buckets)
      // If bucket doesn't exist, this will fail gracefully
      const { error: bucketCheckError } = await supabase.storage
        .from('journal-media')
        .list('', { limit: 1 });
      
      if (bucketCheckError) {
        // Bucket doesn't exist or we don't have access
        if (bucketCheckError.message.includes('not found') || bucketCheckError.message.includes('Bucket not found')) {
          toast.error(
            'Storage bucket "journal-media" not found. Please create it:\n' +
            '1. Go to Supabase Dashboard → Storage\n' +
            '2. Click "New bucket"\n' +
            '3. Name: journal-media\n' +
            '4. Check "Public bucket"\n' +
            '5. Click "Create bucket"\n' +
            '6. Refresh this page',
            { duration: 10000 }
          );
        } else {
          toast.error(`Storage error: ${bucketCheckError.message}. Please check your Supabase storage setup.`);
        }
        setUploading(prev => {
          const newMap = new Map(prev);
          newMap.set(dateStr, false);
          return newMap;
        });
        return;
      }

      const filesArray = Array.from(files);
      const totalFiles = filesArray.length;
      let completedFiles = 0;

      // Show initial progress
      toast.loading(`Uploading ${totalFiles} file(s)... This may take a moment for large files.`, { id: 'media-upload' });

      const uploadPromises = filesArray.map(async (file, index) => {
        // Validate file size (50MB limit)
        if (file.size > 52428800) {
          throw new Error(`File ${file.name} is too large. Maximum size is 50MB.`);
        }

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) {
          throw new Error(`File ${file.name} is not an image or video.`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        // Use user ID in path for better organization and security
        const filePath = user ? `${user.id}/${dateStr}/${fileName}` : `${dateStr}/${fileName}`;

        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
        logger.info('MEDIA', `Uploading file ${index + 1}/${totalFiles}: ${file.name} (${fileSizeMB}MB)`, { 
          fileName: file.name,
          fileSize: file.size,
          date: dateStr
        }, user?.id);

        const { data, error } = await supabase.storage
          .from('journal-media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          // If bucket doesn't exist, provide helpful error
          if (error.message.includes('Bucket not found') || error.message.includes('not found') || error.message.includes('The resource was not found')) {
            throw new Error('Storage bucket "journal-media" not found. Please create it in Supabase Dashboard → Storage → Create Bucket (name: journal-media, public: yes).');
          }
          // If permission error, provide helpful message
          if (error.message.includes('permission') || error.message.includes('policy') || error.message.includes('Row Level Security')) {
            throw new Error('Permission denied. Please check storage bucket RLS policies in Supabase. The bucket should allow authenticated users to upload.');
          }
          throw error;
        }

        completedFiles++;
        // Update progress
        if (totalFiles > 1) {
          toast.loading(`Uploading ${completedFiles}/${totalFiles} files...`, { id: 'media-upload' });
        }

        const { data: { publicUrl } } = supabase.storage
          .from('journal-media')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const currentMedia = mediaUrls.get(dateStr) || [];
      const newMediaUrls = [...currentMedia, ...uploadedUrls];
      
      setMediaUrls(new Map(mediaUrls).set(dateStr, newMediaUrls));
      
      logger.info('MEDIA', 'Media prepared locally (pending save)', { 
        date: dateStr,
        fileCount: uploadedUrls.length,
        totalMedia: newMediaUrls.length
      }, user?.id);
      
      // Don't save to database immediately - wait for user to click Save button
      toast.dismiss('media-upload');
      toast.success(`${uploadedUrls.length} file(s) uploaded! Click "Save" to save them.`);
    } catch (error: any) {
      console.error('Error uploading media:', error);
      const errorMessage = error.message || 'Failed to upload media';
      toast.error(errorMessage);
    } finally {
      setUploading(prev => {
        const newMap = new Map(prev);
        newMap.set(dateStr, false);
        return newMap;
      });
    }
  };

  const handleRemoveMedia = (dateStr: string, index: number) => {
    const currentMedia = mediaUrls.get(dateStr) || [];
    const newMediaUrls = currentMedia.filter((_, i) => i !== index);
    setMediaUrls(new Map(mediaUrls).set(dateStr, newMediaUrls));
    // Don't auto-save - user needs to click Save button
  };

  // Handle audio recording - store locally, upload on save
  const handleAudioRecord = async (dateStr: string, blob: Blob) => {
    if (!user) {
      toast.error('You must be logged in to record audio');
      return;
    }

    try {
      // Create a local URL for the blob so we can play it and get duration
      const localUrl = URL.createObjectURL(blob);
      
      // Get audio duration from the blob
      const audio = new Audio(localUrl);
      const duration = await new Promise<number>((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
          URL.revokeObjectURL(localUrl); // Clean up
        });
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(localUrl); // Clean up on error
          resolve(0);
        });
      });

      // Store recording locally with blob - will be uploaded when user clicks Save
      const newRecording: AudioRecording = {
        id: `recording-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        url: localUrl, // Temporary local URL
        duration: Math.round(duration),
        timestamp: new Date().toISOString(),
        blob: blob, // Store the blob for later upload
      };

      const currentRecordings = audioRecordings.get(dateStr) || [];
      const newRecordings = [...currentRecordings, newRecording];
      setAudioRecordings(new Map(audioRecordings).set(dateStr, newRecordings));
      
      logger.info('AUDIO', 'Recording stored locally (pending save)', { 
        date: dateStr,
        duration: newRecording.duration,
        recordingId: newRecording.id
      }, user.id);
      
      // Don't save to database yet - wait for user to click Save button
    } catch (error: any) {
      logger.error('AUDIO', 'Failed to prepare audio recording', { 
        date: dateStr,
        error: error.message 
      }, user?.id);
      console.error('Error preparing audio recording:', error);
      toast.error('Failed to prepare audio recording');
      throw error;
    }
  };

  // Handle audio recording deletion
  const handleDeleteAudio = (dateStr: string, recordingId: string) => {
    const currentRecordings = audioRecordings.get(dateStr) || [];
    const recording = currentRecordings.find(r => r.id === recordingId);
    
    if (recording) {
      // Revoke local URL if it's a blob URL
      if (recording.url.startsWith('blob:')) {
        URL.revokeObjectURL(recording.url);
      }
      
      // Remove from local state - don't auto-save
      const newRecordings = currentRecordings.filter(r => r.id !== recordingId);
      setAudioRecordings(new Map(audioRecordings).set(dateStr, newRecordings));
      // Don't auto-save - user needs to click Save button
    }
  };

  // Handle summarization
  const handleSummarize = async (dateStr: string) => {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      toast.error('OpenAI API key not found. Please set it in settings or localStorage.');
      return;
    }

    setSummarizing(prev => new Map(prev).set(dateStr, true));
    
    try {
      const recordings = audioRecordings.get(dateStr) || [];
      const journalText = localValues.get(dateStr) || null;
      const audioUrls = recordings.map(r => r.url);
      const dayMedia = mediaUrls.get(dateStr) || [];

      if (audioUrls.length === 0 && !journalText && dayMedia.length === 0) {
        toast.error('No content to summarize. Add recordings, journal text, or media first.');
        return;
      }

      const summary = await summarizeDay(audioUrls, journalText, dateStr, apiKey, user?.id, dayMedia);
      
      setSummaries(new Map(summaries).set(dateStr, summary));
      await onUpdate({ summary }, dateStr);
      
      logger.info('JOURNAL', 'Summary saved to database', { date: dateStr, summaryLength: summary.length }, user?.id);
      toast.success('Summary generated successfully!');
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(error.message || 'Failed to generate summary');
    } finally {
      setSummarizing(prev => {
        const newMap = new Map(prev);
        newMap.set(dateStr, false);
        return newMap;
      });
    }
  };

  if (isWeeklyView && weekDays) {
    return (
      <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/50 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Journal - Weekly View
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const journalNote = getJournalValue(dateStr);
            const isToday = isSameDay(day, new Date());
            const dayMedia = mediaUrls.get(dateStr) || [];
            const isUploading = uploading.get(dateStr) || false;
            const dayRecordings = audioRecordings.get(dateStr) || [];
            const isRecording = recording.get(dateStr) || false;
            const summary = summaries.get(dateStr) || '';
            const isSummarizing = summarizing.get(dateStr) || false;
            const journalText = localValues.get(dateStr) || '';
            const hasContent = dayRecordings.length > 0 || journalText.trim().length > 0;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: weekDays.indexOf(day) * 0.05 }}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 ${
                  isToday 
                    ? 'border-primary shadow-md ring-2 ring-primary/20' 
                    : 'border-gray-200 dark:border-slate-700'
                } overflow-hidden`}
              >
                {/* Day Header */}
                <div className={`px-4 py-3 border-b ${
                  isToday 
                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10' 
                    : 'bg-gray-50 dark:bg-slate-700/50'
                }`}>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-bold ${
                      isToday ? 'text-primary' : 'text-gray-900 dark:text-white'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Journal Entry */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Journal</span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={journalNote}
                        onChange={(e) => handleJournalChange(dateStr, e.target.value)}
                        onFocus={() => {
                          if (isWeeklyView) {
                            setJournalPopup({ dateStr, value: journalNote });
                          }
                        }}
                        className="w-full px-3 py-2 pr-16 text-xs border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                        rows={4}
                        placeholder="Your thoughts..."
                      />
                      <button
                        onClick={() => handleSaveJournal(dateStr)}
                        disabled={saving.get(dateStr) || false}
                        className="absolute top-1.5 right-1.5 flex items-center gap-1 px-2 py-1 md:px-1.5 md:py-0.5 text-xs md:text-[10px] font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
                        title="Save"
                      >
                        {saving.get(dateStr) ? (
                          <div className="w-3 h-3 md:w-2.5 md:h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : saved.get(dateStr) ? (
                          <Check className="w-3 h-3 md:w-2.5 md:h-2.5" />
                        ) : (
                          <>
                            <Save className="w-3 h-3 md:w-2.5 md:h-2.5" />
                            <span className="md:hidden">Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Media & Recordings */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" />
                        <span>Media</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleMediaUpload(dateStr, e.target.files)}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      {isUploading && (
                        <span className="text-[10px] text-gray-500">Uploading...</span>
                      )}
                    </div>
                    {dayMedia.length > 0 && (
                      <MediaCarousel
                        mediaUrls={dayMedia}
                        dateStr={dateStr}
                        onViewMedia={(url, type, index) => setViewingMedia({ url, type, dateStr, index })}
                        onRemoveMedia={(index) => handleRemoveMedia(dateStr, index)}
                      />
                    )}
                  </div>

                  {/* Voice Recordings */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Mic className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Voice</span>
                    </div>
                    <AudioRecorder
                      recordings={dayRecordings}
                      onRecord={(blob) => handleAudioRecord(dateStr, blob)}
                      onDelete={(id) => handleDeleteAudio(dateStr, id)}
                      dateStr={dateStr}
                      isRecording={isRecording}
                      onRecordingChange={(recording) => {
                        setRecording(prev => new Map(prev).set(dateStr, recording));
                      }}
                    />
                  </div>

                  {/* AI Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Summary</span>
                    </div>
                    {summary ? (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => setSummaryPopup({ dateStr, summary })}
                          className="w-full p-2.5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200/30 dark:border-purple-800/20 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all cursor-pointer text-left"
                        >
                          <p className={`text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${
                            expandedSummaries.get(dateStr) ? '' : 'line-clamp-4'
                          }`}>
                            {summary}
                          </p>
                        </button>
                        {summary.length > 200 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedSummaries(prev => {
                                const newMap = new Map(prev);
                                newMap.set(dateStr, !expandedSummaries.get(dateStr));
                                return newMap;
                              });
                            }}
                            className="w-full flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                          >
                            {expandedSummaries.get(dateStr) ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                <span>Show Less</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                <span>Show More</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 text-[10px] text-gray-500 dark:text-gray-400 text-center">
                        No summary
                      </div>
                    )}
                    <button
                      onClick={() => handleSummarize(dateStr)}
                      disabled={isSummarizing || !hasContent}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {isSummarizing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>{summary ? 'Regenerate' : 'Generate'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Summary Popup Modal for Weekly View */}
      <AnimatePresence>
        {summaryPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSummaryPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-2xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Daily Summary - {format(parseISO(summaryPopup.dateStr), 'EEEE, MMMM d')}
                  </h3>
                </div>
                <button
                  onClick={() => setSummaryPopup(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200/30 dark:border-purple-800/20">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {summaryPopup.summary}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Popup Modal for Weekly View */}
      <AnimatePresence>
        {journalPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setJournalPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-2xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Journal Entry - {format(parseISO(journalPopup.dateStr), 'EEEE, MMMM d')}
                  </h3>
                </div>
                <button
                  onClick={() => setJournalPopup(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <textarea
                  value={journalPopup.value}
                  onChange={(e) => {
                    setJournalPopup({ ...journalPopup, value: e.target.value });
                    handleJournalChange(journalPopup.dateStr, e.target.value);
                  }}
                  className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                  rows={12}
                  placeholder="Write your thoughts..."
                  autoFocus
                />
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => setJournalPopup(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSaveJournal(journalPopup.dateStr);
                    setJournalPopup(null);
                  }}
                  disabled={saving.get(journalPopup.dateStr) || false}
                  className="px-6 py-2.5 text-base font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving.get(journalPopup.dateStr) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {viewingMedia && (() => {
          const currentDateMedia = mediaUrls.get(viewingMedia.dateStr) || [];
          const currentIndex = viewingMedia.index;
          const hasPrevious = currentIndex > 0;
          const hasNext = currentIndex < currentDateMedia.length - 1;
          
          const navigateMedia = (direction: 'prev' | 'next') => {
            if (direction === 'prev' && hasPrevious) {
              const newIndex = currentIndex - 1;
              const newUrl = currentDateMedia[newIndex];
              const isImage = newUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              setViewingMedia({ url: newUrl, type: isImage ? 'image' : 'video', dateStr: viewingMedia.dateStr, index: newIndex });
            } else if (direction === 'next' && hasNext) {
              const newIndex = currentIndex + 1;
              const newUrl = currentDateMedia[newIndex];
              const isImage = newUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              setViewingMedia({ url: newUrl, type: isImage ? 'image' : 'video', dateStr: viewingMedia.dateStr, index: newIndex });
            }
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
              onClick={() => setViewingMedia(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setViewingMedia(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {hasPrevious && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMedia('prev');
                    }}
                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                    title="Previous"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}
                
                {hasNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMedia('next');
                    }}
                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                    title="Next"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}
                
                {viewingMedia.type === 'image' ? (
                  <img
                    src={viewingMedia.url}
                    alt="Media viewer"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={viewingMedia.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-lg"
                  />
                )}
                
                {currentDateMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full z-10">
                    {currentIndex + 1} / {currentDateMedia.length}
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      </>
    );
  }

  // Daily view
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/50 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Journal
          </h3>
        </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={localValues.get(format(date, 'yyyy-MM-dd')) ?? metrics?.journal_note ?? ''}
            onChange={(e) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              handleJournalChange(dateStr, e.target.value);
            }}
            className="w-full px-4 py-3 pr-24 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
            rows={8}
            placeholder="Express your thoughts, reflections, gratitude, goals, or anything on your mind..."
          />
          <button
            onClick={() => handleSaveJournal(format(date, 'yyyy-MM-dd'))}
            disabled={saving.get(format(date, 'yyyy-MM-dd')) || false}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed rounded transition-colors"
            title="Save journal entry"
          >
            {saving.get(format(date, 'yyyy-MM-dd')) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved.get(format(date, 'yyyy-MM-dd')) ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-lg cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Add Media</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => handleMediaUpload(format(date, 'yyyy-MM-dd'), e.target.files)}
              className="hidden"
              disabled={uploading.get(format(date, 'yyyy-MM-dd')) || false}
            />
          </label>
          {uploading.get(format(date, 'yyyy-MM-dd')) && (
            <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
          )}
        </div>
        {mediaUrls.get(format(date, 'yyyy-MM-dd')) && mediaUrls.get(format(date, 'yyyy-MM-dd'))!.length > 0 && (
          <MediaCarousel
            mediaUrls={mediaUrls.get(format(date, 'yyyy-MM-dd'))!}
            dateStr={format(date, 'yyyy-MM-dd')}
            onViewMedia={(url, type, index) => setViewingMedia({ url, type, dateStr: format(date, 'yyyy-MM-dd'), index })}
            onRemoveMedia={(index) => handleRemoveMedia(format(date, 'yyyy-MM-dd'), index)}
          />
        )}
      </div>
      </motion.div>

      {/* Audio Recordings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl shadow-sm border border-blue-200/50 dark:border-blue-800/50 p-6 mt-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Voice Recordings
          </h3>
        </div>
        <AudioRecorder
          recordings={audioRecordings.get(format(date, 'yyyy-MM-dd')) || []}
          onRecord={(blob) => handleAudioRecord(format(date, 'yyyy-MM-dd'), blob)}
          onDelete={(id) => handleDeleteAudio(format(date, 'yyyy-MM-dd'), id)}
          dateStr={format(date, 'yyyy-MM-dd')}
          isRecording={recording.get(format(date, 'yyyy-MM-dd')) || false}
          onRecordingChange={(recording) => {
            setRecording(prev => new Map(prev).set(format(date, 'yyyy-MM-dd'), recording));
          }}
        />
      </motion.div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl shadow-sm border border-purple-200/30 dark:border-purple-800/20 p-6 mt-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Summary
          </h3>
        </div>
        <div className="space-y-4">
          {summaries.get(format(date, 'yyyy-MM-dd')) ? (
            <div className="space-y-2">
              <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-purple-200/30 dark:border-purple-800/20">
                <p className={`text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${
                  expandedSummaries.get(format(date, 'yyyy-MM-dd')) ? '' : 'line-clamp-6'
                }`}>
                  {summaries.get(format(date, 'yyyy-MM-dd'))}
                </p>
              </div>
              {summaries.get(format(date, 'yyyy-MM-dd')) && summaries.get(format(date, 'yyyy-MM-dd'))!.length > 300 && (
                <button
                  onClick={() => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    setExpandedSummaries(prev => {
                      const newMap = new Map(prev);
                      newMap.set(dateStr, !expandedSummaries.get(dateStr));
                      return newMap;
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                >
                  {expandedSummaries.get(format(date, 'yyyy-MM-dd')) ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Show More</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-500 dark:text-gray-400 text-center">
              No summary yet. Record audio or write journal entries, then click "Generate Summary".
            </div>
          )}
          <button
            onClick={() => handleSummarize(format(date, 'yyyy-MM-dd'))}
            disabled={summarizing.get(format(date, 'yyyy-MM-dd')) || false || (audioRecordings.get(format(date, 'yyyy-MM-dd'))?.length === 0 && !localValues.get(format(date, 'yyyy-MM-dd'))?.trim())}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {summarizing.get(format(date, 'yyyy-MM-dd')) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Summary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{summaries.get(format(date, 'yyyy-MM-dd')) ? 'Regenerate Summary' : 'Generate Summary'}</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {viewingMedia && (() => {
          const currentDateMedia = mediaUrls.get(viewingMedia.dateStr) || [];
          const currentIndex = viewingMedia.index;
          const hasPrevious = currentIndex > 0;
          const hasNext = currentIndex < currentDateMedia.length - 1;
          
          const navigateMedia = (direction: 'prev' | 'next') => {
            if (direction === 'prev' && hasPrevious) {
              const newIndex = currentIndex - 1;
              const newUrl = currentDateMedia[newIndex];
              const isImage = newUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              setViewingMedia({ url: newUrl, type: isImage ? 'image' : 'video', dateStr: viewingMedia.dateStr, index: newIndex });
            } else if (direction === 'next' && hasNext) {
              const newIndex = currentIndex + 1;
              const newUrl = currentDateMedia[newIndex];
              const isImage = newUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
              setViewingMedia({ url: newUrl, type: isImage ? 'image' : 'video', dateStr: viewingMedia.dateStr, index: newIndex });
            }
          };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
              onClick={() => setViewingMedia(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setViewingMedia(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
                
                {hasPrevious && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMedia('prev');
                    }}
                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                    title="Previous"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}
                
                {hasNext && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMedia('next');
                    }}
                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
                    title="Next"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}
                
                {viewingMedia.type === 'image' ? (
                  <img
                    src={viewingMedia.url}
                    alt="Media viewer"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={viewingMedia.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-lg"
                  />
                )}
                
                {currentDateMedia.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full z-10">
                    {currentIndex + 1} / {currentDateMedia.length}
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}

