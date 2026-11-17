import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  PlusCircle,
  Bell,
  Languages,
  Check,
  Clock,
} from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { useNotifications } from '../../context/NotificationContext';

export function Header({ currentSectionTitle, onOpenCapture }) {
  const { language, setLanguage, isVoiceActive, startVoiceInput, stopVoiceInput } = useAI();
  const { notifications, unreadCount, markAsRead, snooze } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>{currentSectionTitle}</h1>
      </div>

      <div style={styles.actions}>
        {/* Quick Universal Capture Button */}
        <button
          onClick={onOpenCapture}
          style={{ ...styles.btn, ...styles.captureBtn }}
          title="Universal Quick Capture (Text, Voice, Links)"
        >
          <PlusCircle size={16} />
          <span>Capture</span>
        </button>

        {/* Multilingual Voice Activation Button */}
        <button
          onClick={isVoiceActive ? stopVoiceInput : startVoiceInput}
          style={{
            ...styles.btn,
            ...(isVoiceActive ? styles.voiceBtnActive : styles.voiceBtn),
          }}
          title={isVoiceActive ? 'Listening... Click to send' : 'Speak to AI (English, Hindi, Telugu)'}
        >
          {isVoiceActive ? <MicOff size={16} /> : <Mic size={16} />}
          <span>{isVoiceActive ? 'Listening...' : 'Voice AI'}</span>
          {isVoiceActive && (
            <span style={styles.voicePulseDot} />
          )}
        </button>

        {/* Language Switcher */}
        <div style={styles.dropdownWrapper}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={styles.iconBtn}
            title="Switch Language (EN / HI / TE)"
          >
            <Languages size={18} color="#94a3b8" />
            <span style={styles.langTag}>{language.toUpperCase()}</span>
          </button>

          {showLangMenu && (
            <div style={styles.menu}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  style={{
                    ...styles.menuItem,
                    ...(language === l.code ? styles.menuItemActive : {}),
                  }}
                >
                  <span>{l.native} ({l.label})</span>
                  {language === l.code && <Check size={14} color="#818cf8" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div style={styles.dropdownWrapper}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={styles.iconBtn}
            title="Notifications"
          >
            <Bell size={18} color="#94a3b8" />
            {unreadCount > 0 && (
              <span style={styles.unreadBadge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div style={{ ...styles.menu, ...styles.notificationPanel }}>
              <div style={styles.notifHeader}>
                <span style={styles.notifTitle}>Notifications</span>
                <span style={styles.notifCount}>{unreadCount} unread</span>
              </div>
              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotifs}>No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        ...styles.notifItem,
                        opacity: n.isRead ? 0.6 : 1,
                      }}
                    >
                      <div style={styles.notifItemContent}>
                        <strong style={styles.notifItemTitle}>{n.title}</strong>
                        <p style={styles.notifItemMessage}>{n.message}</p>
                        <span style={styles.notifTime}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={styles.notifActions}>
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            style={styles.miniBtn}
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => snooze(n._id, 15)}
                          style={styles.miniBtn}
                          title="Snooze 15 mins"
                        >
                          <Clock size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 'var(--header-height)',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 15,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#f8fafc',
    margin: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.45rem 0.9rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all var(--transition-fast)',
  },
  captureBtn: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  voiceBtn: {
    background: 'rgba(6, 182, 212, 0.15)',
    color: '#22d3ee',
    border: '1px solid rgba(6, 182, 212, 0.3)',
  },
  voiceBtnActive: {
    background: 'var(--accent-danger)',
    color: '#fff',
    animation: 'pulseGlow 1.5s infinite',
  },
  voicePulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#fff',
  },
  dropdownWrapper: {
    position: 'relative',
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    color: '#94a3b8',
    gap: '0.2rem',
  },
  langTag: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#818cf8',
  },
  unreadBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: 'var(--accent-danger)',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: '42px',
    width: '180px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    padding: '0.4rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    zIndex: 50,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    color: '#94a3b8',
    fontSize: '0.85rem',
    textAlign: 'left',
  },
  menuItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    fontWeight: 600,
  },
  notificationPanel: {
    width: '320px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '0.75rem',
  },
  notifHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: '0.5rem',
  },
  notifTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#f8fafc',
  },
  notifCount: {
    fontSize: '0.75rem',
    color: '#818cf8',
  },
  notifList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  emptyNotifs: {
    fontSize: '0.8rem',
    color: '#64748b',
    textAlign: 'center',
    padding: '1rem 0',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '0.5rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-sm)',
    gap: '0.5rem',
  },
  notifItemContent: {
    flex: 1,
    overflow: 'hidden',
  },
  notifItemTitle: {
    fontSize: '0.8rem',
    color: '#f8fafc',
    display: 'block',
  },
  notifItemMessage: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: '0.2rem 0',
  },
  notifTime: {
    fontSize: '0.65rem',
    color: '#64748b',
  },
  notifActions: {
    display: 'flex',
    gap: '0.25rem',
  },
  miniBtn: {
    padding: '0.25rem',
    borderRadius: '4px',
    background: 'var(--bg-card)',
    color: '#94a3b8',
  },
};
