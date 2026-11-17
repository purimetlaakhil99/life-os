import React, { useState, useEffect } from 'react';
import {
  Target,
  Flame,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../utils/api';

export function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // New Goal / Habit Form
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('habit');
  const [category, setCategory] = useState('personal');
  const [targetMetric, setTargetMetric] = useState(100);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      setLoading(true);
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const created = await api.createGoal({
        title,
        type,
        category,
        targetMetric: { current: 0, target: Number(targetMetric), unit: '%' },
      });
      setGoals(prev => [created, ...prev]);
      setIsAdding(false);
      setTitle('');
    } catch (err) {
      alert(`Error creating goal: ${err.message}`);
    }
  }

  async function handleLogHabit(id) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const updated = await api.logHabit(id, today);
      setGoals(prev => prev.map(g => g._id === id ? updated : g));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteGoal(id);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const filteredGoals = goals.filter(g => {
    if (activeCategory !== 'all' && g.category !== activeCategory) return false;
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Goals, Habits & Routines</h2>
          <p style={styles.subtitle}>Track daily consistency streaks, milestones, and personal aspirations</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          style={styles.addBtn}
        >
          <Plus size={16} />
          <span>New Habit / Goal</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="card" style={styles.addForm}>
          <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Create Trackable Objective</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '220px' }}>
              <label style={styles.label}>Title:</label>
              <input
                type="text"
                placeholder="e.g. Read 20 pages of Computer Networks, 30 min morning walk..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={styles.label}>Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={styles.input}
              >
                <option value="habit">Daily Habit</option>
                <option value="goal">Long-term Goal</option>
                <option value="routine">Routine</option>
                <option value="dsa_tracker">DSA Coding Goal</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={styles.label}>Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.input}
              >
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
                <option value="career">Career</option>
                <option value="health">Health & Fitness</option>
                <option value="coding">Coding / Technical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              Save Objective
            </button>
          </div>
        </form>
      )}

      {/* Objectives Grid */}
      <div className="grid-3">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
            Loading objectives...
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', padding: '3rem 0' }}>
            <Target size={32} color="#64748b" style={{ margin: '0 auto 0.75rem auto' }} />
            <p>No habits or goals created yet. Click "+ New Habit / Goal" to begin your consistency streak!</p>
          </div>
        ) : (
          filteredGoals.map((g) => {
            const completedToday = g.history && g.history.some(h => h.date === today && h.completed);
            return (
              <div key={g._id} className="card" style={styles.goalCard}>
                <div style={styles.cardTop}>
                  <span className="badge badge-primary">{g.category}</span>
                  <button onClick={() => handleDelete(g._id)} style={styles.deleteBtn}>
                    <Trash2 size={14} color="#64748b" />
                  </button>
                </div>

                <strong style={styles.goalTitle}>{g.title}</strong>

                {/* Habit Streak Display */}
                <div style={styles.streakBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Flame size={18} color="#f59e0b" />
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                      {g.streak || 0}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>days streak</span>
                  </div>

                  <button
                    onClick={() => handleLogHabit(g._id)}
                    style={{
                      ...styles.checkHabitBtn,
                      background: completedToday ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)',
                      color: completedToday ? '#34d399' : '#94a3b8',
                      borderColor: completedToday ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)',
                    }}
                  >
                    <CheckCircle size={15} color={completedToday ? '#34d399' : '#64748b'} />
                    <span>{completedToday ? 'Completed Today!' : 'Mark Today Done'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
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
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  addForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.35rem',
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
  cancelBtn: {
    padding: '0.55rem 1rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  saveBtn: {
    padding: '0.55rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  goalCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    background: 'var(--bg-card)',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitle: {
    fontSize: '1.02rem',
    color: '#f8fafc',
  },
  streakBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--border-subtle)',
  },
  checkHabitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  deleteBtn: {
    padding: '0.2rem',
  },
};
