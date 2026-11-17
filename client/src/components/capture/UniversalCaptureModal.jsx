import React, { useState } from 'react';
import { X, Send, Link as LinkIcon, Mic, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../utils/api';

export function UniversalCaptureModal({ isOpen, onClose, onCaptured }) {
  const [content, setContent] = useState('');
  const [captureType, setCaptureType] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.universalCapture({
        rawInput: content,
        captureType,
      });
      setResult(res);
      if (onCaptured) onCaptured(res);
      setTimeout(() => {
        setContent('');
        setResult(null);
        onClose();
      }, 1500);
    } catch (err) {
      alert(`Capture failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Universal Capture</h3>
            <p style={styles.subtitle}>Drop any thought, to-do, link, or class schedule. AI categorizes it automatically.</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Input Mode Selector */}
        <div style={styles.modeTabs}>
          {[
            { id: 'text', label: 'Quick Note', icon: FileText },
            { id: 'link', label: 'Save Link', icon: LinkIcon },
            { id: 'voice', label: 'Voice Note', icon: Mic },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = captureType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCaptureType(tab.id)}
                style={{
                  ...styles.modeTab,
                  ...(active ? styles.modeTabActive : {}),
                }}
              >
                <Icon size={14} color={active ? '#818cf8' : '#94a3b8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              captureType === 'link'
                ? 'Paste URL: https://github.com/repository...'
                : 'Type anything (e.g. "Remind me to finish OS lab assignment by Thursday 5 PM" or "Rahul birthday on Nov 24")'
            }
            rows={4}
            style={styles.textarea}
            autoFocus
          />

          {result && (
            <div style={styles.resultNotice}>
              <CheckCircle2 size={16} color="#10b981" />
              <span>Captured & classified as: <strong>{result.classifiedAs.toUpperCase()}</strong></span>
            </div>
          )}

          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.btn, ...styles.cancelBtn }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              style={{ ...styles.btn, ...styles.submitBtn }}
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Classifying...' : 'Capture'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 110,
    padding: '1rem',
  },
  modal: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    maxWidth: '540px',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.15rem',
    color: '#f8fafc',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  closeBtn: {
    color: '#64748b',
    padding: '0.2rem',
  },
  modeTabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  modeTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.8rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  modeTabActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    border: '1px solid rgba(99, 102, 241, 0.4)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  textarea: {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    resize: 'none',
  },
  resultNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.8rem',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 'var(--radius-md)',
    color: '#34d399',
    fontSize: '0.8rem',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.6rem 1.2rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  cancelBtn: {
    background: 'var(--bg-surface)',
    color: '#94a3b8',
  },
  submitBtn: {
    background: 'var(--accent-primary)',
    color: '#fff',
  },
};
