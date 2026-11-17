import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Tag,
  Clock,
  Filter,
} from 'lucide-react';
import { api } from '../../utils/api';

export function MyDayPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newCategory, setNewCategory] = useState('personal');
  const [newDueDate, setNewDueDate] = useState('');
  const [newIsRecurring, setNewIsRecurring] = useState(false);
  const [newRecurrence, setNewRecurrence] = useState('none');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.createTask({
        title: newTitle,
        priority: newPriority,
        category: newCategory,
        dueDate: newDueDate || null,
        isRecurring: newIsRecurring,
        recurrenceRule: newRecurrence,
      });
      setTasks(prev => [created, ...prev]);
      setNewTitle('');
      setNewDueDate('');
      setNewIsRecurring(false);
      setNewRecurrence('none');
    } catch (err) {
      alert(`Error creating task: ${err.message}`);
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await api.toggleTask(id);
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    } catch (err) {
      alert(`Failed to update task: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus === 'pending' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Header with Filters */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Day & Tasks</h2>
          <p style={styles.subtitle}>Actionable priorities, recurring routines, and context-aware tasks</p>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <Filter size={14} color="#94a3b8" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={handleCreateTask} style={styles.createCard}>
        <div style={styles.inputRow}>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task or reminder..."
            style={styles.mainInput}
          />
          <button type="submit" style={styles.addBtn}>
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>

        <div style={styles.optionsRow}>
          <div style={styles.optionItem}>
            <span style={styles.optionLabel}>Priority:</span>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              style={styles.miniSelect}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div style={styles.optionItem}>
            <span style={styles.optionLabel}>Category:</span>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={styles.miniSelect}
            >
              <option value="personal">Personal</option>
              <option value="academic">Academic</option>
              <option value="career">Career</option>
              <option value="health">Health</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div style={styles.optionItem}>
            <span style={styles.optionLabel}>Due Date:</span>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          <div style={styles.optionItem}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8' }}>
              <input
                type="checkbox"
                checked={newIsRecurring}
                onChange={(e) => setNewIsRecurring(e.target.checked)}
              />
              Recurring
            </label>
            {newIsRecurring && (
              <select
                value={newRecurrence}
                onChange={(e) => setNewRecurrence(e.target.value)}
                style={styles.miniSelect}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>
        </div>
      </form>

      {/* Task Items List */}
      <div style={styles.taskList}>
        {loading ? (
          <div style={styles.loading}>Loading your tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No tasks found for the current filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task._id}
                style={{
                  ...styles.taskCard,
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                <button
                  onClick={() => handleToggle(task._id)}
                  style={styles.checkBtn}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <Circle size={20} color="#64748b" />
                  )}
                </button>

                <div style={styles.taskContent}>
                  <span
                    style={{
                      ...styles.taskTitle,
                      textDecoration: isCompleted ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </span>

                  <div style={styles.taskBadges}>
                    <span className={`badge badge-${task.priority === 'urgent' ? 'danger' : (task.priority === 'high' ? 'warning' : 'primary')}`}>
                      {task.priority}
                    </span>

                    <span style={styles.categoryBadge}>
                      <Tag size={10} />
                      {task.category}
                    </span>

                    {task.dueDate && (
                      <span style={styles.dueDateBadge}>
                        <Calendar size={10} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    {task.isRecurring && (
                      <span style={styles.recurringBadge}>
                        🔄 {task.recurrenceRule}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task._id)}
                  style={styles.deleteBtn}
                  title="Delete task"
                >
                  <Trash2 size={16} color="#64748b" />
                </button>
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
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.2rem 0.5rem',
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.8rem',
  },
  createCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  mainInput: {
    flex: 1,
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    color: '#f8fafc',
    fontSize: '0.95rem',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.75rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    background: 'var(--accent-primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  optionsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1.25rem',
  },
  optionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  optionLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  miniSelect: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    color: '#f8fafc',
  },
  dateInput: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    color: '#f8fafc',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  loading: {
    textAlign: 'center',
    color: '#64748b',
    padding: '2rem 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 0',
    color: '#64748b',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
  },
  taskCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.85rem 1.15rem',
    transition: 'all var(--transition-fast)',
  },
  checkBtn: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  taskTitle: {
    fontSize: '0.95rem',
    color: '#f8fafc',
    fontWeight: 500,
  },
  taskBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
    background: 'var(--bg-surface)',
    padding: '0.15rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
  },
  dueDateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    color: '#06b6d4',
    background: 'rgba(6, 182, 212, 0.1)',
    padding: '0.15rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
  },
  recurringBadge: {
    fontSize: '0.75rem',
    color: '#a855f7',
    background: 'rgba(168, 85, 247, 0.1)',
    padding: '0.15rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
  },
  deleteBtn: {
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
