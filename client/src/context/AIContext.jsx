import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { voiceEngine } from '../utils/voiceEngine';

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      sender: 'assistant',
      text: 'Hello! I am your LIFE OS AI Assistant. I manage your daily tasks, university timetable, attendance calculations, notes, and reminders. You can chat with me or speak in English, Hindi, or Telugu.',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en', 'hi', 'te'
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [pendingPreview, setPendingPreview] = useState(null);

  // Synchronize language with voice engine
  useEffect(() => {
    voiceEngine.setLanguage(language);
  }, [language]);

  // Hydrate persisted conversation history on mount
  useEffect(() => {
    api.getConversations()
      .then((data) => {
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m, idx) => ({
            id: m._id || `hist-${idx}`,
            sender: m.sender,
            text: m.text,
            mode: m.mode || 'chat',
            executedActions: m.executedActions || [],
            memoryRetrieved: m.memoryRetrieved || [],
            timestamp: m.timestamp,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const sendMessage = useCallback(async (userText, mode = 'chat') => {
    if (!userText || !userText.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      mode,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const data = await api.chat({
        message: userText,
        language,
        mode,
      });

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        executedActions: data.executedActions || [],
        memoryRetrieved: data.memoryRetrieved || [],
        suggestedQuickReplies: data.suggestedQuickReplies || [],
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If voice mode or autoSpeechOutput is requested, speak response
      if (mode === 'voice' || isVoiceActive) {
        voiceEngine.speak(data.audioText || data.reply, language, () => {
          setIsSpeaking(false);
        });
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `I encountered an error processing your request: ${err.message}`,
          isError: true,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [language, isVoiceActive]);

  // Multilingual Voice Activation Controls
  const startVoiceInput = useCallback(() => {
    setLiveTranscript('');
    setIsVoiceActive(true);

    voiceEngine.startListening(
      (result) => {
        setLiveTranscript(result.text);
        if (result.isFinal && result.text.trim()) {
          setIsVoiceActive(false);
          setLiveTranscript('');
          sendMessage(result.text, 'voice');
        }
      },
      (error) => {
        console.warn('Voice error:', error);
        setIsVoiceActive(false);
      },
      (state) => {
        setIsVoiceActive(state.isListening);
        setIsSpeaking(state.isSpeaking);
      }
    );
  }, [sendMessage]);

  const stopVoiceInput = useCallback(() => {
    voiceEngine.stopListening();
    setIsVoiceActive(false);
    if (liveTranscript.trim()) {
      sendMessage(liveTranscript, 'voice');
      setLiveTranscript('');
    }
  }, [liveTranscript, sendMessage]);

  const stopSpeaking = useCallback(() => {
    voiceEngine.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const confirmAction = useCallback(async (actionToken) => {
    try {
      const result = await api.confirmAction({ actionToken });
      setPendingPreview(null);
      return result;
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  }, []);

  return (
    <AIContext.Provider value={{
      messages,
      isProcessing,
      language,
      setLanguage,
      isVoiceActive,
      isSpeaking,
      liveTranscript,
      pendingPreview,
      setPendingPreview,
      sendMessage,
      startVoiceInput,
      stopVoiceInput,
      stopSpeaking,
      confirmAction,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within an AIProvider');
  return ctx;
}
