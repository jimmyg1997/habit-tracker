// OpenAI API integration for summarization
import { logger, LogLevel } from '../utils/logger';

interface SummarizeRequest {
  audioUrls: string[];
  journalText?: string;
  date: string;
}

export async function summarizeDay(
  audioUrls: string[],
  journalText: string | null,
  date: string,
  apiKey: string,
  userId?: string,
  mediaUrls?: string[]
): Promise<string> {
  const startTime = Date.now();
  logger.info('SUMMARIZATION', `Starting summarization for ${date}`, { 
    audioCount: audioUrls.length, 
    hasJournalText: !!journalText,
    mediaCount: mediaUrls?.length || 0,
    date 
  }, userId);

  try {
    // Step 1: Transcribe all audio files
    const transcriptions: string[] = [];
    
    logger.info('TRANSCRIPTION', `Starting transcription of ${audioUrls.length} audio file(s)`, { 
      audioCount: audioUrls.length 
    }, userId);

    for (let i = 0; i < audioUrls.length; i++) {
      const audioUrl = audioUrls[i];
      const transcriptionStart = Date.now();
      
      try {
        logger.debug('TRANSCRIPTION', `Transcribing audio ${i + 1}/${audioUrls.length}`, { 
          url: audioUrl.substring(0, 50) + '...',
          index: i 
        }, userId);

        // Fetch the audio file
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        
        logger.debug('TRANSCRIPTION', `Fetched audio blob`, { 
          size: audioBlob.size,
          type: audioBlob.type 
        }, userId);

        // Create form data for Whisper API
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');
        
        // Transcribe using Whisper
        const transcriptResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData,
        });
        
        if (!transcriptResponse.ok) {
          const error = await transcriptResponse.json();
          logger.error('TRANSCRIPTION', `Transcription failed for audio ${i + 1}`, { 
            error: error.error?.message || error.message,
            status: transcriptResponse.status,
            index: i 
          }, userId);
          continue;
        }
        
        const transcriptData = await transcriptResponse.json();
        const transcriptionTime = Date.now() - transcriptionStart;
        
        if (transcriptData.text) {
          transcriptions.push(transcriptData.text);
          logger.info('TRANSCRIPTION', `Successfully transcribed audio ${i + 1}/${audioUrls.length}`, { 
            textLength: transcriptData.text.length,
            duration: `${transcriptionTime}ms`,
            preview: transcriptData.text.substring(0, 100) + '...'
          }, userId);
        } else {
          logger.warn('TRANSCRIPTION', `No text returned for audio ${i + 1}`, { index: i }, userId);
        }
      } catch (error: any) {
        logger.error('TRANSCRIPTION', `Error transcribing audio ${i + 1}`, { 
          error: error.message,
          index: i 
        }, userId);
        // Continue with other recordings
      }
    }

    const totalTranscriptions = transcriptions.length;
    logger.info('TRANSCRIPTION', `Completed transcription`, { 
      successful: totalTranscriptions,
      total: audioUrls.length,
      totalTextLength: transcriptions.join(' ').length
    }, userId);
    
    // Step 2: Combine all content
    const allContent = [
      ...transcriptions,
      journalText || '',
    ].filter(Boolean).join('\n\n');
    
    if (!allContent.trim()) {
      logger.warn('SUMMARIZATION', 'No content to summarize', { 
        transcriptionCount: transcriptions.length,
        hasJournalText: !!journalText 
      }, userId);
      return 'No content to summarize.';
    }

    logger.info('SUMMARIZATION', 'Combined content for summarization', { 
      totalLength: allContent.length,
      transcriptionCount: transcriptions.length,
      journalTextLength: journalText?.length || 0,
      mediaCount: mediaUrls?.length || 0
    }, userId);
    
    // Step 3: Generate summary using GPT
    // Get model from environment or default to gpt-3.5-turbo-0125
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-3.5-turbo-0125';
    
    // Build content description including media
    let contentDescription = `Journal entries and voice recordings from ${date}:\n\n${allContent}`;
    
    if (mediaUrls && mediaUrls.length > 0) {
      contentDescription += `\n\nNote: There ${mediaUrls.length === 1 ? 'is' : 'are'} ${mediaUrls.length} image${mediaUrls.length === 1 ? '' : 's'} or video${mediaUrls.length === 1 ? '' : 's'} attached to this day's journal entry. Please mention the presence of these visual elements in your summary.`;
    }
    
    logger.info('SUMMARIZATION', 'Sending request to GPT for summarization', { 
      model,
      contentLength: allContent.length,
      mediaCount: mediaUrls?.length || 0,
      maxTokens: 500
    }, userId);

    const summaryStart = Date.now();
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, insightful summaries of daily journal entries, voice recordings, and visual content. You are multilingual and can understand and combine content in ANY language (English, Russian, Greek, Spanish, etc.). Focus on key themes, emotions, and important events. Always format your response as bullet points for easy reading. Include direct quotes from the user in brackets to make it personal and unique. DO NOT use markdown formatting like **bold** or ## headers - use plain text only with emojis. When content is in multiple languages, combine them seamlessly and preserve quotes in their original language.',
          },
          {
            role: 'user',
            content: `Please summarize the following content from ${date}. The content may be in multiple languages (e.g., English journal entries and Russian voice recordings). Combine ALL languages effectively into one cohesive summary.\n\n${contentDescription}\n\nProvide a clear, concise summary in bullet point format (use • or - for each point). IMPORTANT: Start each bullet point with a relevant emoji, and include emojis throughout the summary to make it engaging. Most importantly, include direct quotes and phrases from the journal entries or audio recordings in brackets "" to make it personal and unique to the user. Preserve quotes in their original language.\n\nFormat each section like this:\n• 😊 Emotions and feelings: [description] with quotes like "user's exact words in original language"\n• 🎯 Main themes: [description] with quotes like "user's exact words in original language"\n• 📅 Events: [description] with quotes like "user's exact words in original language"\n• 💡 Insights: [description] with quotes like "user's exact words in original language"\n• 📸 Visual content: [description]\n• 💬 Memorable quotes: "exact quote 1 in original language", "exact quote 2 in original language"\n\nCRITICAL REQUIREMENTS:\n- Start EVERY bullet point with an emoji\n- Use emojis throughout (😊 😢 🎉 💭 📸 🎯 📅 💡 💬 ❤️ 🌟 ✨ 🎨 🏃 💪 🍕 ☕ etc.)\n- Include at least 2-3 direct quotes in brackets "" from the user's own words (preserve original language)\n- DO NOT use markdown formatting (**bold**, ## headers, etc.) - use plain text only\n- Combine content from ALL languages seamlessly - if journal is in English and audio is in Russian, combine both effectively\n- Keep each bullet point concise and focused\n- Make it personal and unique with the user's actual words in their original language`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });
    
    if (!summaryResponse.ok) {
      const error = await summaryResponse.json();
      logger.error('SUMMARIZATION', 'GPT API request failed', { 
        error: error.error?.message || error.message,
        status: summaryResponse.status,
        model 
      }, userId);
      throw new Error(error.error?.message || 'Failed to generate summary');
    }
    
    const summaryData = await summaryResponse.json();
    const summaryText = summaryData.choices[0]?.message?.content || 'Failed to generate summary.';
    const summaryTime = Date.now() - summaryStart;
    const totalTime = Date.now() - startTime;

    logger.info('SUMMARIZATION', 'Successfully generated summary', { 
      summaryLength: summaryText.length,
      duration: `${summaryTime}ms`,
      totalDuration: `${totalTime}ms`,
      tokensUsed: summaryData.usage?.total_tokens,
      model
    }, userId);

    return summaryText;
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    logger.error('SUMMARIZATION', 'Failed to generate summary', { 
      error: error.message,
      duration: `${totalTime}ms`,
      audioCount: audioUrls.length,
      hasJournalText: !!journalText
    }, userId);
    throw new Error(error.message || 'Failed to generate summary');
  }
}

