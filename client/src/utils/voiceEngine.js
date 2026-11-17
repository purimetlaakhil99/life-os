// LIFE OS Unified Multilingual Voice Engine (English, Hindi, Telugu)

class VoiceEngine {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentLanguage = 'en-US'; // 'en-US', 'hi-IN', 'te-IN'
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStateChangeCallback = null;
    this.audioContext = null;
    this.mediaStream = null;

    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = this.currentLanguage;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyState();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (this.onTranscriptCallback) {
          this.onTranscriptCallback({
            text: finalTranscript || interimTranscript,
            isFinal: Boolean(finalTranscript),
            language: this.currentLanguage
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        this.isListening = false;
        this.notifyState();
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyState();
      };
    }
  }

  setLanguage(langCode) {
    // Map simplified codes to BCP 47
    const langMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'en-US': 'en-US',
      'hi-IN': 'hi-IN',
      'te-IN': 'te-IN'
    };
    this.currentLanguage = langMap[langCode] || 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.currentLanguage;
    }
  }

  async startListening(onTranscript, onError, onStateChange) {
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.onStateChangeCallback = onStateChange;

    // Interrupt any ongoing speech synthesis first
    this.stopSpeaking();

    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    try {
      this.recognition.start();
    } catch (err) {
      // If already started, restart
      try {
        this.recognition.stop();
        this.recognition.start();
      } catch (e) {
        if (onError) onError(e.message);
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    this.isListening = false;
    this.notifyState();
  }

  speak(text, language = null, onEnd = null) {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    if (!text || text.trim().length === 0) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = language ? (language.length === 2 ? `${language}-IN` : language) : this.currentLanguage;
    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Attempt to pick a matching voice
    const voices = this.synthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.substring(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyState();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notifyState();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.notifyState();
      if (onEnd) onEnd();
    };

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.notifyState();
    }
  }

  notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isListening: this.isListening,
        isSpeaking: this.isSpeaking,
        language: this.currentLanguage
      });
    }
  }
}

export const voiceEngine = new VoiceEngine();
