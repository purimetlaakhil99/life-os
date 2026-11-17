import React from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useAI } from '../../context/AIContext';

export function VoiceOverlay() {
  const {
    isVoiceActive,
    isSpeaking,
    liveTranscript,
    language,
    stopVoiceInput,
    stopSpeaking,
  } = useAI();

  if (!isVoiceActive && !isSpeaking) return null;

  const langLabels = {
    en: 'English',
    hi: 'हिन्दी (Hindi)',
    te: 'తెలుగు (Telugu)',
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.langBadge}>
            <span>Active Language: {langLabels[language] || 'English'}</span>
          </div>
          <button
            onClick={isVoiceActive ? stopVoiceInput : stopSpeaking}
            style={styles.closeBtn}
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Voice Waves */}
        <div style={styles.visualizerContainer}>
          <div style={styles.waves}>
            {[40, 70, 100, 60, 90, 50, 80, 45, 85, 60].map((h, i) => (
              <span
                key={i}
                style={{
                  ...styles.waveBar,
                  height: `${h * 0.4}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* State Information */}
        <div style={styles.statusBox}>
          {isVoiceActive && (
            <div style={styles.stateIndicator}>
              <Mic size={20} color="#ef4444" style={{ animation: 'pulse 1s infinite' }} />
              <span style={styles.stateText}>Listening... Speak now</span>
            </div>
          )}
          {isSpeaking && (
            <div style={styles.stateIndicator}>
              <Volume2 size={20} color="#22d3ee" />
              <span style={styles.stateText}>LIFE OS is speaking...</span>
            </div>
          )}

          <p style={styles.transcript}>
            {liveTranscript ? `"${liveTranscript}"` : 'Say something like: "Add task prepare presentation" or "Check my attendance margin"'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={styles.controls}>
          {isVoiceActive ? (
            <button
              onClick={stopVoiceInput}
              style={{ ...styles.btn, ...styles.btnStop }}
            >
              <MicOff size={16} />
              <span>Finish & Send</span>
            </button>
          ) : (
            <button
              onClick={stopSpeaking}
              style={{ ...styles.btn, ...styles.btnStop }}
            >
              <span>Stop Speaking</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 100,
  },
  card: {
    width: '380px',
    background: 'rgba(18, 21, 28, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
    padding: '1.25rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  langBadge: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#818cf8',
    background: 'rgba(99, 102, 241, 0.15)',
    padding: '0.2rem 0.6rem',
    borderRadius: 'var(--radius-full)',
  },
  closeBtn: {
    color: '#64748b',
    padding: '0.2rem',
  },
  visualizerContainer: {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  waves: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '100%',
  },
  waveBar: {
    width: '4px',
    background: 'var(--accent-gradient)',
    borderRadius: '4px',
    animation: 'waveBar 1s ease-in-out infinite',
  },
  statusBox: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  stateIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  stateText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#f8fafc',
  },
  transcript: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontStyle: 'italic',
    minHeight: '40px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  btnStop: {
    background: 'var(--accent-danger)',
    color: '#fff',
  },
};
