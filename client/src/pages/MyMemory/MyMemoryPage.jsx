import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Tag,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../../utils/api';

export function MyMemoryPage() {
  const [memories, setMemories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // New Memory Modal/Form
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('preference');
  const [newImportance, setNewImportance] = useState(3);

  useEffect(() => {
    loadMemories();
  }, [selectedCategory]);

  async function loadMemories() {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? `category=${selectedCategory}` : '';
      const data = await api.getMemories(params);
      setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await api.getMemories(searchTerm);
      setMemories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMemory(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const created = await api.createMemory({
        title: newTitle,
        content: newContent,
        category: newCategory,
        importance: Number(newImportance),
        tags: [newCategory],
      });
      setMemories(prev => [created, ...prev]);
      setIsAdding(false);
      setNewTitle('');
      setNewContent('');
    } catch (err) {
      alert(`Error saving memory: ${err.message}`);
    }
  }

  async function handleDeleteMemory(id) {
    if (!window.confirm('Delete this memory? The AI will no longer recall this knowledge.')) return;
    try {
      await api.deleteMemory(id);
      setMemories(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  const categories = [
    { id: 'all', label: 'All Memories' },
    { id: 'preference', label: 'Preferences' },
    { id: 'routine', label: 'Routines' },
    { id: 'relationship', label: 'People & Family' },
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'student_fact', label: 'Student Facts' },
    { id: 'idea', label: 'Ideas & Thoughts' },
    { id: 'reference', label: 'Saved References' },
  ];

  return (
    <div style={styles.container}>
      {/* Privacy Notice Banner */}
      <div style={styles.privacyBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Lock size={18} color="#818cf8" />
          <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
            Zero-Leakage Private Isolated Memory Store
          </strong>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
          All personal information, routines, and preferences recorded here are strictly isolated to your user account and only retrieved when relevant to your authorized AI requests. You can inspect, edit, or delete any record at any time.
        </p>
      </div>

      {/* Header, Search & Add Action */}
      <div style={styles.actionHeader}>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search memories, routines, people, facts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </form>

        <button
          onClick={() => setIsAdding(!isAdding)}
          style={styles.addBtn}
        >
          <Plus size={16} />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Categories Filter Bar */}
      <div style={styles.catNav}>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            style={{
              ...styles.catPill,
              ...(selectedCategory === c.id ? styles.catPillActive : {}),
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Add Memory Modal / Form */}
      {isAdding && (
        <form onSubmit={handleCreateMemory} className="card" style={styles.addCard}>
          <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Store New Personal Fact or Preference</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1.5, minWidth: '220px' }}>
              <label style={styles.label}>Memory Title:</label>
              <input
                type="text"
                placeholder="e.g. Study Preference, Sister's Birthday, Exam Goal"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={styles.label}>Category:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={styles.input}
              >
                <option value="preference">Preference</option>
                <option value="routine">Routine</option>
                <option value="relationship">People & Relationship</option>
                <option value="personal_info">Personal Info</option>
                <option value="student_fact">Student Fact</option>
                <option value="idea">Idea</option>
                <option value="reference">Reference</option>
              </select>
            </div>
            <div style={{ width: '120px' }}>
              <label style={styles.label}>Importance:</label>
              <select
                value={newImportance}
                onChange={(e) => setNewImportance(e.target.value)}
                style={styles.input}
              >
                <option value={5}>5 (High)</option>
                <option value={4}>4</option>
                <option value={3}>3 (Normal)</option>
                <option value={2}>2</option>
                <option value={1}>1 (Low)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={styles.label}>Memory Content & Instructions for AI:</label>
            <textarea
              placeholder="e.g. I study best early in the morning before 8 AM. Remind me to review algorithms during morning focus sessions."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
              style={{ ...styles.input, resize: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              Save to Memory
            </button>
          </div>
        </form>
      )}

      {/* Memory Cards Grid */}
      <div style={styles.grid}>
        {loading ? (
          <div style={styles.loading}>Loading private memories...</div>
        ) : memories.length === 0 ? (
          <div style={styles.empty}>
            <Brain size={32} color="#64748b" style={{ margin: '0 auto 0.75rem auto' }} />
            <p>No memories stored in this category yet. Click "+ Add Memory" to store facts, routines, or preferences.</p>
          </div>
        ) : (
          memories.map((m) => (
            <div key={m._id} className="card" style={styles.memCard}>
              <div style={styles.memCardHeader}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '0.35rem' }}>
                    {m.category.replace('_', ' ')}
                  </span>
                  <strong style={styles.memTitle}>{m.title}</strong>
                </div>
                <button
                  onClick={() => handleDeleteMemory(m._id)}
                  style={styles.deleteBtn}
                  title="Delete memory"
                >
                  <Trash2 size={15} color="#64748b" />
                </button>
              </div>

              <p style={styles.memContent}>{m.content}</p>

              <div style={styles.memFooter}>
                <span style={styles.sourceTag}>
                  Source: {m.source}
                </span>
                <span style={styles.importanceTag}>
                  ★ Importance: {m.importance}/5
                </span>
              </div>
            </div>
          ))
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
  privacyBanner: {
    background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(18, 21, 28, 0.9) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
  },
  actionHeader: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem 0.85rem',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#f8fafc',
    fontSize: '0.9rem',
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
  catNav: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '0.35rem',
  },
  catPill: {
    padding: '0.4rem 0.85rem',
    borderRadius: 'var(--radius-full)',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  catPillActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.4)',
    color: '#818cf8',
  },
  addCard: {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  loading: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#64748b',
    padding: '3rem 0',
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#64748b',
    padding: '3rem 0',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
  },
  memCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    background: 'var(--bg-card)',
  },
  memCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  memTitle: {
    fontSize: '1rem',
    color: '#f8fafc',
    display: 'block',
  },
  memContent: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    lineHeight: 1.5,
    flex: 1,
  },
  memFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.65rem',
    borderTop: '1px solid var(--border-subtle)',
    fontSize: '0.7rem',
    color: '#64748b',
  },
  sourceTag: {
    textTransform: 'capitalize',
  },
  importanceTag: {
    color: '#fbbf24',
    fontWeight: 600,
  },
  deleteBtn: {
    padding: '0.3rem',
  },
};
