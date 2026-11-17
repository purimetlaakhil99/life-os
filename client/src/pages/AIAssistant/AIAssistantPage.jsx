import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Brain,
  CheckCircle,
  HelpCircle,
  Languages,
} from 'lucide-react';
import { useAI } from '../../context/AIContext';

export function AIAssistantPage() {
  const {
    messages,
    sendMessage,
    isProcessing,
    language,
    setLanguage,
    isVoiceActive,
    startVoiceInput,
    stopVoiceInput,
    stopSpeaking,
    isSpeaking,
    pendingPreview,
    confirmAction,
  } = useAI();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  function handleSend(e) {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    sendMessage(inputText, 'chat');
    setInputText('');
  }

  function handleQuickPrompt(prompt) {
    sendMessage(prompt, 'chat');
  }

  return (
    <div style={styles.container}>
      {/* Assistant Header & Language Control Bar */}
      <div style={styles.headerBar}>
        <div style={styles.assistantIdentity}>
          <div style={styles.aiAvatar}>
            <Bot size={22} color="#fff" />
          </div>
          <div>
            <h2 style={styles.title}>Unified AI Brain & Multilingual Assistant</h2>
            <p style={styles.subtitle}>
              Shared context, memory retrieval & authorized tool execution in English, हिन्दी, and తెలుగు
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div style={styles.langSelector}>
          <Languages size={16} color="#818cf8" />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Voice & Chat Language:</span>
          {['en', 'hi', 'te'].map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              style={{
                ...styles.langPill,
                ...(language === l ? styles.langPillActive : {}),
              }}
            >
              {l === 'en' ? 'English' : (l === 'hi' ? 'हिन्दी' : 'తెలుగు')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div style={styles.chatStream}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.sender === 'assistant' && (
              <div style={styles.msgAvatarAi}>
                <Sparkles size={16} color="#818cf8" />
              </div>
            )}

            <div
              style={{
                ...styles.bubble,
                ...(msg.sender === 'user' ? styles.userBubble : styles.aiBubble),
                ...(msg.isError ? styles.errorBubble : {}),
              }}
            >
              {/* Message Header */}
              <div style={styles.bubbleMeta}>
                <span>{msg.sender === 'user' ? 'You' : 'LIFE OS Brain'}</span>
                {msg.mode === 'voice' && (
                  <span style={styles.voiceBadge}>🎤 Spoken</span>
                )}
              </div>

              {/* Message Content */}
              <div style={styles.bubbleText}>
                {msg.text.split('\n').map((paragraph, idx) => (
                  <p key={idx} style={{ margin: paragraph ? '0.35rem 0' : 0 }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Memory Retrieved Notice */}
              {msg.memoryRetrieved && msg.memoryRetrieved.length > 0 && (
                <div style={styles.memoryTag}>
                  <Brain size={12} color="#06b6d4" />
                  <span>Retrieved Memory: {msg.memoryRetrieved.join(', ')}</span>
                </div>
              )}

              {/* Executed Authorized Actions Card */}
              {msg.executedActions && msg.executedActions.length > 0 && (
                <div style={styles.actionsBox}>
                  <div style={styles.actionsBoxHeader}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Authorized Tools Executed:</span>
                  </div>
                  {msg.executedActions.map((act, i) => (
                    <div key={i} style={styles.actionItem}>
                      <CheckCircle size={13} color="#10b981" />
                      <code>{act.action}</code>
                      {act.conflictWarning && (
                        <span style={styles.conflictWarn}>({act.conflictWarning})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Suggestions */}
              {msg.suggestedQuickReplies && msg.suggestedQuickReplies.length > 0 && (
                <div style={styles.quickReplies}>
                  {msg.suggestedQuickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(reply)}
                      style={styles.quickReplyBtn}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div style={styles.msgAvatarUser}>
                <User size={16} color="#fff" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div style={{ ...styles.messageWrapper, justifyContent: 'flex-start' }}>
            <div style={styles.msgAvatarAi}>
              <Sparkles size={16} color="#818cf8" />
            </div>
            <div style={{ ...styles.bubble, ...styles.aiBubble }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Analyzing intent and coordinating authorized tools...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sensitive Action Preview & Confirmation Banner */}
      {pendingPreview && (
        <div style={styles.previewCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#f59e0b" />
            <strong>Confirmation Required: Sensitive Action</strong>
          </div>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0', color: '#cbd5e1' }}>
            {pendingPreview.preview}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => confirmAction(pendingPreview.actionToken)}
              style={styles.confirmBtn}
            >
              Approve & Execute
            </button>
            <button
              onClick={() => setPendingPreview(null)}
              style={styles.rejectBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Speech / Typing Input Bar */}
      <form onSubmit={handleSend} style={styles.inputContainer}>
        <button
          type="button"
          onClick={isVoiceActive ? stopVoiceInput : startVoiceInput}
          style={{
            ...styles.micButton,
            ...(isVoiceActive ? styles.micActive : {}),
          }}
          title={isVoiceActive ? 'Listening... click to send' : 'Speak (EN, HI, TE)'}
        >
          {isVoiceActive ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type or speak in ${language === 'en' ? 'English' : (language === 'hi' ? 'Hindi' : 'Telugu')}...`}
          style={styles.textInput}
          disabled={isProcessing}
        />

        {isSpeaking && (
          <button
            type="button"
            onClick={stopSpeaking}
            style={styles.stopSpeakingBtn}
            title="Mute spoken response"
          >
            Mute AI
          </button>
        )}

        <button
          type="submit"
          disabled={isProcessing || !inputText.trim()}
          style={styles.sendButton}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - var(--header-height) - 4rem)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
  },
  headerBar: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-secondary)',
  },
  assistantIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  aiAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'var(--accent-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.1rem',
    margin: 0,
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.15rem',
  },
  langSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-surface)',
    padding: '0.35rem 0.65rem',
    borderRadius: 'var(--radius-full)',
  },
  langPill: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
    padding: '0.2rem 0.5rem',
    borderRadius: 'var(--radius-full)',
  },
  langPillActive: {
    background: 'var(--accent-primary)',
    color: '#fff',
  },
  chatStream: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  messageWrapper: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  msgAvatarAi: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '4px',
  },
  msgAvatarUser: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '4px',
  },
  bubble: {
    borderRadius: 'var(--radius-lg)',
    padding: '0.85rem 1.15rem',
    fontSize: '0.92rem',
    lineHeight: 1.5,
  },
  aiBubble: {
    background: 'var(--bg-surface)',
    color: '#f8fafc',
    border: '1px solid var(--border-subtle)',
  },
  userBubble: {
    background: 'var(--accent-primary)',
    color: '#ffffff',
  },
  errorBubble: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
  },
  bubbleMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    opacity: 0.7,
    marginBottom: '0.35rem',
    fontWeight: 600,
  },
  voiceBadge: {
    background: 'rgba(6, 182, 212, 0.2)',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  bubbleText: {
    whiteSpace: 'pre-wrap',
  },
  memoryTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '0.65rem',
    padding: '0.3rem 0.5rem',
    background: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    color: '#22d3ee',
  },
  actionsBox: {
    marginTop: '0.75rem',
    padding: '0.6rem 0.8rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: 'var(--radius-md)',
  },
  actionsBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#34d399',
    marginBottom: '0.3rem',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    color: '#cbd5e1',
  },
  conflictWarn: {
    color: '#fbbf24',
    fontSize: '0.7rem',
  },
  quickReplies: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginTop: '0.75rem',
  },
  quickReplyBtn: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-full)',
    padding: '0.25rem 0.65rem',
    fontSize: '0.75rem',
    color: '#818cf8',
    fontWeight: 500,
  },
  previewCard: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    margin: '0.75rem 1.5rem',
  },
  confirmBtn: {
    background: 'var(--accent-warning)',
    color: '#000',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 700,
    fontSize: '0.8rem',
  },
  rejectBtn: {
    background: 'var(--bg-surface)',
    color: '#94a3b8',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
  },
  inputContainer: {
    padding: '1rem 1.5rem',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  micButton: {
    width: '42px',
    height: '42px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    color: '#22d3ee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  micActive: {
    background: 'var(--accent-danger)',
    color: '#fff',
    animation: 'pulseGlow 1.5s infinite',
  },
  textInput: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    color: '#f8fafc',
    fontSize: '0.92rem',
  },
  stopSpeakingBtn: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  sendButton: {
    width: '42px',
    height: '42px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};
