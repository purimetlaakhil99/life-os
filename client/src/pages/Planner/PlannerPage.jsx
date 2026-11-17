import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  MapPin,
  Trash2,
} from 'lucide-react';
import { api } from '../../utils/api';

export function PlannerPage() {
  const [schedule, setSchedule] = useState({ events: [], tasks: [], classes: [] });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // New Event Form
  const [newTitle, setNewTitle] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState('personal');
  const [location, setLocation] = useState('');
  const [conflictWarning, setConflictWarning] = useState(null);

  useEffect(() => {
    loadSchedule();
  }, [selectedDate]);

  async function loadSchedule() {
    try {
      setLoading(true);
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);

      const data = await api.getSchedule(start.toISOString(), end.toISOString());
      setSchedule(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setConflictWarning(null);
    try {
      const start = new Date(`${selectedDate}T${startTime}:00`);
      const end = new Date(`${selectedDate}T${endTime}:00`);

      const res = await api.createEvent({
        title: newTitle,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        category,
        location,
      });

      if (res.conflictWarning) {
        setConflictWarning(res.conflictWarning);
      }

      setNewTitle('');
      setLocation('');
      loadSchedule();
    } catch (err) {
      alert(`Error scheduling event: ${err.message}`);
    }
  }

  async function handleDeleteEvent(id) {
    try {
      await api.deleteEvent(id);
      loadSchedule();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={styles.container}>
      {/* Header & Date Picker */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Smart Planner & Schedule</h2>
          <p style={styles.subtitle}>Unified timeline merging personal events, classes, and deadlines with conflict alerts</p>
        </div>

        <div style={styles.datePickerWrap}>
          <CalendarIcon size={16} color="#818cf8" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {conflictWarning && (
        <div style={styles.conflictAlert}>
          <AlertTriangle size={18} color="#f59e0b" />
          <span>{conflictWarning}</span>
        </div>
      )}

      {/* Main Grid: Schedule List & Event Creation */}
      <div className="grid-2">
        {/* Timeline View */}
        <div className="card">
          <h3 style={styles.cardHeading}>
            Timeline for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>

          <div style={styles.timeline}>
            {loading ? (
              <div style={styles.loading}>Loading schedule...</div>
            ) : schedule.classes.length === 0 && schedule.events.length === 0 && schedule.tasks.length === 0 ? (
              <div style={styles.empty}>No scheduled events, classes, or tasks due on this date.</div>
            ) : (
              <>
                {/* Academic Classes */}
                {schedule.classes.map((cls) => (
                  <div key={cls.id} style={{ ...styles.timelineItem, borderLeftColor: '#06b6d4' }}>
                    <div style={styles.timelineTime}>
                      {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={styles.timelineDetails}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <GraduationCap size={15} color="#06b6d4" />
                        <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{cls.title}</strong>
                      </div>
                      {cls.faculty && <span style={styles.metaSub}>Faculty: {cls.faculty}</span>}
                    </div>
                  </div>
                ))}

                {/* Calendar Events */}
                {schedule.events.map((ev) => (
                  <div key={ev._id} style={{ ...styles.timelineItem, borderLeftColor: '#6366f1' }}>
                    <div style={styles.timelineTime}>
                      {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={styles.timelineDetails}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{ev.title}</strong>
                        <button onClick={() => handleDeleteEvent(ev._id)} style={styles.miniDelete}>
                          <Trash2 size={13} color="#64748b" />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                        <span style={styles.metaSub}>Category: {ev.category}</span>
                        {ev.location && (
                          <span style={styles.metaSub}>
                            <MapPin size={11} /> {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Due Tasks */}
                {schedule.tasks.map((tsk) => (
                  <div key={tsk._id} style={{ ...styles.timelineItem, borderLeftColor: '#10b981' }}>
                    <div style={styles.timelineTime}>Task Due</div>
                    <div style={styles.timelineDetails}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{tsk.title}</span>
                      <span className={`badge badge-${tsk.priority === 'urgent' ? 'danger' : 'primary'}`} style={{ marginTop: '0.2rem' }}>
                        {tsk.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Schedule an Event Form */}
        <div className="card">
          <h3 style={styles.cardHeading}>Schedule Event / Focus Session</h3>
          <form onSubmit={handleCreateEvent} style={styles.eventForm}>
            <div>
              <label style={styles.label}>Event Title:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Deep Focus: Data Structures or Team Sync"
                style={styles.input}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Start Time:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>End Time:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.input}
                >
                  <option value="personal">Personal</option>
                  <option value="focus_session">Focus Session</option>
                  <option value="meeting">Meeting</option>
                  <option value="routine">Routine</option>
                  <option value="exam">Exam Preparation</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={styles.label}>Location / Link:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Library, Zoom, Lab 3"
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>
              <Plus size={16} />
              <span>Add to Schedule</span>
            </button>
          </form>
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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.4rem',
    color: '#f8fafc',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  datePickerWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.4rem 0.75rem',
  },
  dateInput: {
    background: 'transparent',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.85rem',
  },
  conflictAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    color: '#fbbf24',
    fontSize: '0.85rem',
  },
  cardHeading: {
    fontSize: '1.05rem',
    color: '#f8fafc',
    marginBottom: '1.25rem',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  loading: {
    textAlign: 'center',
    color: '#64748b',
    padding: '2rem 0',
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    padding: '2rem 0',
    fontStyle: 'italic',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    background: 'var(--bg-surface)',
    borderLeft: '4px solid #6366f1',
    borderRadius: '0 var(--radius-md) var(--radius-md) 0',
    padding: '0.75rem 1rem',
  },
  timelineTime: {
    minWidth: '70px',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#818cf8',
  },
  timelineDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  metaSub: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  miniDelete: {
    padding: '0.2rem',
  },
  eventForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.35rem',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.65rem 0.85rem',
    color: '#f8fafc',
    fontSize: '0.85rem',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
};
