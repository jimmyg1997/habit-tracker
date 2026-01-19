import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export interface AudioRecording {
  id: string;
  url: string;
  duration: number; // in seconds
  timestamp: string;
  blob?: Blob; // For new recordings before upload
}

interface AudioRecorderProps {
  recordings: AudioRecording[];
  onRecord: (blob: Blob) => Promise<void>;
  onDelete: (id: string) => void;
  dateStr: string;
  isRecording: boolean;
  onRecordingChange: (isRecording: boolean) => void;
}

export default function AudioRecorder({
  recordings,
  onRecord,
  onDelete,
  dateStr,
  isRecording,
  onRecordingChange,
}: AudioRecorderProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    return () => {
      // Cleanup: stop all recordings and audio playback
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try different mimeTypes for better mobile compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        } else {
          mimeType = ''; // Use default
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Store the blob locally - don't upload immediately
        // The blob will be uploaded when user clicks "Save"
        try {
          await onRecord(audioBlob);
          toast.success('Recording ready! Click "Save" to save it.');
        } catch (error) {
          console.error('Error preparing recording:', error);
          toast.error('Failed to prepare recording');
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      onRecordingChange(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone. Please check permissions.');
      onRecordingChange(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      onRecordingChange(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
  };

  const togglePlay = (recording: AudioRecording) => {
    const audioId = recording.id;
    const audio = audioRefs.current.get(audioId);

    if (audio) {
      if (playingId === audioId) {
        // Pause
        audio.pause();
        setPlayingId(null);
      } else {
        // Play
        // Pause any other playing audio
        audioRefs.current.forEach((a, id) => {
          if (id !== audioId) {
            a.pause();
            a.currentTime = 0;
          }
        });
        audio.play();
        setPlayingId(audioId);
      }
    } else {
      // Create new audio element
      const newAudio = new Audio(recording.url);
      newAudio.onended = () => setPlayingId(null);
      newAudio.onerror = () => {
        toast.error('Failed to play recording');
        setPlayingId(null);
      };
      audioRefs.current.set(audioId, newAudio);
      newAudio.play();
      setPlayingId(audioId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {/* Record Button */}
      <div className="flex items-center gap-1.5">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-[10px]"
            title="Start recording"
          >
            <Mic className="w-3 h-3" />
            <span>Record</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-[10px] animate-pulse"
            title="Stop recording"
          >
            <Square className="w-3 h-3" />
            <span>Stop {formatTime(recordingTime)}</span>
          </button>
        )}
      </div>

      {/* Recordings List */}
      <AnimatePresence>
        {recordings.length > 0 && (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {recordings.map((recording) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-slate-700/50 rounded border border-gray-200 dark:border-slate-600"
              >
                <button
                  onClick={() => togglePlay(recording)}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors flex-shrink-0"
                  title={playingId === recording.id ? 'Pause' : 'Play'}
                >
                  {uploading === recording.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : playingId === recording.id ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                    {formatTime(recording.duration || 0)}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(recording.id)}
                  className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

