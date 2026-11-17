import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  Calendar,
  CheckCircle,
  Cake,
  Clock,
  BookOpen,
  AlertCircle,
  ArrowRight,
  Send,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useAI } from '../../context/AIContext';

export function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const { sendMessage, startVoiceInput } = useAI();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    loadBriefing();
  }, []);

  async function loadBriefing() {
    try {
      setLoading(true);
      const data = await api.getBriefing();
      setBriefing(data);
    } catch (err) {
      console.error('Error fetching briefing:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput, 'chat');
    setChatInput('');
    onNavigate('ai-assistant');
  }

  return (
    <div style={styles.container}>
      {/* 1. Personal Greeting and Date */}
      <div style={styles.welcomeBanner}>
        <div>
          <h2 style={styles.greetingTitle}>
            Good day, {user?.name || 'Friend'} 👋
          </h2>
          <p style={styles.dateSubtitle}>
            {briefing?.date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Voice Activation */}
        <button
          onClick={() => {
            startVoiceInput();
          }}
          style={styles.voiceActivationBtn}
          title="Activate Multilingual Voice Assistant"
        >
          <Mic size={18} color="#22d3ee" />
          <span>Speak with AI</span>
        </button>
      </div>

      {/* 2. AI Daily Briefing Banner */}
      <div style={styles.briefingCard}>
        <div style={styles.briefingHeader}>
          <div style={styles.briefingIconWrap}>
            <Sparkles size={18} color="#818cf8" />
          </div>
          <span style={styles.briefingHeading}>AI Daily Briefing</span>
        </div>
        <p style={styles.briefingText}>
          {briefing?.summary || 'Preparing your personal digital agenda and academic schedule...'}
        </p>

        {/* AI Chat Entry Point */}
        <form onSubmit={handleQuickChat} style={styles.chatEntryBar}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask AI anything (e.g. 'What is my next class?' or 'Remind me to finish lab record')..."
            style={styles.chatInput}
          />
          <button type="submit" style={styles.chatSendBtn}>
            <Send size={15} />
            <span>Ask</span>
          </button>
        </form>
      </div>

      {/* Academic Highlights when Student Profile exists */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Next Class */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="#06b6d4" />
              <h3>Next Class</h3>
            </div>
            <button onClick={() => onNavigate('student-life')} style={styles.linkAction}>
              Timetable <ArrowRight size={14} />
            </button>
          </div>

          {briefing?.nextClass ? (
            <div style={styles.highlightBox}>
              <div style={styles.classDetails}>
                <span style={styles.classSubject}>{briefing.nextClass.subjectName}</span>
                <span style={styles.classMeta}>
                  {briefing.nextClass.startTime} – {briefing.nextClass.endTime} • Room: {briefing.nextClass.classroom || 'Main Block'}
                </span>
                {briefing.nextClass.faculty && (
                  <span style={styles.classFaculty}>Faculty: {briefing.nextClass.faculty}</span>
                )}
              </div>
            </div>
          ) : (
            <p style={styles.emptyNote}>No classes scheduled for the remainder of today.</p>
          )}

          {/* Attendance Margin Warning if Shortage */}
          {briefing?.attendanceAlert && (
            <div style={styles.alertNotice}>
              <AlertCircle size={16} color="#f59e0b" />
              <span>
                <strong>{briefing.attendanceAlert.subject}</strong> is at {briefing.attendanceAlert.percentage}%. Attend next {briefing.attendanceAlert.classesNeeded} classes to hit {briefing.attendanceAlert.target}%.
              </span>
            </div>
          )}
        </div>

        {/* Upcoming Birthdays */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cake size={18} color="#ec4899" />
              <h3>Upcoming Birthdays</h3>
            </div>
            <button onClick={() => onNavigate('settings')} style={styles.linkAction}>
              Automations <ArrowRight size={14} />
            </button>
          </div>

          {briefing?.upcomingBirthdays && briefing.upcomingBirthdays.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {briefing.upcomingBirthdays.map((b) => (
                <div key={b._id} style={styles.birthdayRow}>
                  <div>
                    <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{b.name}</strong>
                    <span style={styles.relationshipTag}>({b.relationship})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={styles.bdayDate}>
                      {new Date(b.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {b.autoBirthdayEmail && (
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                        Auto Gmail Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyNote}>No birthdays coming up in the immediate next week.</p>
          )}
        </div>
      </div>

      {/* Today's Schedule & Pending Tasks */}
      <div className="grid-2">
        {/* Today's Important Schedules */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#6366f1" />
              <h3>Today's Schedule</h3>
            </div>
            <button onClick={() => onNavigate('planner')} style={styles.linkAction}>
              Full Planner <ArrowRight size={14} />
            </button>
          </div>

          {briefing?.todayEvents && briefing.todayEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {briefing.todayEvents.map((ev) => (
                <div key={ev._id} style={styles.eventRow}>
                  <Clock size={15} color="#94a3b8" />
                  <span style={styles.eventTime}>
                    {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={styles.eventTitle}>{ev.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyNote}>No calendar events scheduled for today.</p>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} color="#10b981" />
              <h3>Pending Tasks</h3>
            </div>
            <button onClick={() => onNavigate('my-day')} style={styles.linkAction}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {briefing?.pendingTasks && briefing.pendingTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {briefing.pendingTasks.map((t) => (
                <div key={t._id} style={styles.taskRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: t.priority === 'urgent' ? '#ef4444' : (t.priority === 'high' ? '#f59e0b' : '#6366f1'),
                      }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{t.title}</span>
                  </div>
                  <span className={`badge badge-${t.priority === 'urgent' ? 'danger' : 'primary'}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyNote}>All tasks completed for today! Well done.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  welcomeBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
  },
  greetingTitle: {
    fontSize: '1.65rem',
    color: '#f8fafc',
    margin: 0,
  },
  dateSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  voiceActivationBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(6, 182, 212, 0.12)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    color: '#22d3ee',
    fontWeight: 600,
    fontSize: '0.85rem',
    transition: 'all var(--transition-fast)',
  },
  briefingCard: {
    background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(18, 21, 28, 0.95) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-md)',
  },
  briefingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.75rem',
  },
  briefingIconWrap: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  briefingHeading: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  briefingText: {
    fontSize: '1.02rem',
    lineHeight: 1.6,
    color: '#e2e8f0',
    marginBottom: '1.25rem',
  },
  chatEntryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.35rem 0.5rem',
  },
  chatInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.9rem',
    boxShadow: 'none',
  },
  chatSendBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 1rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  linkAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.8rem',
    color: '#818cf8',
    fontWeight: 600,
  },
  highlightBox: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
  },
  classDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  classSubject: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#f8fafc',
  },
  classMeta: {
    fontSize: '0.8rem',
    color: '#06b6d4',
  },
  classFaculty: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  alertNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
    padding: '0.6rem 0.8rem',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#fbbf24',
    fontSize: '0.8rem',
  },
  emptyNote: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontStyle: 'italic',
    padding: '0.5rem 0',
  },
  birthdayRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 0.8rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
  },
  relationshipTag: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginLeft: '0.4rem',
  },
  bdayDate: {
    fontSize: '0.8rem',
    color: '#ec4899',
    fontWeight: 600,
  },
  eventRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.8rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
  },
  eventTime: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#818cf8',
    minWidth: '65px',
  },
  eventTitle: {
    fontSize: '0.85rem',
    color: '#f8fafc',
  },
  taskRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 0.8rem',
    background: 'var(--bg-surface)',
    borderRadius: 'var(--radius-md)',
  },
};
