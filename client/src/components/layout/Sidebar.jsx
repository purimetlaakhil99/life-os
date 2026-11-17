import React from 'react';
import {
  Home,
  Bot,
  CalendarCheck,
  Calendar,
  GraduationCap,
  Brain,
  Target,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ currentSection, onNavigate }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'Voice' },
    { id: 'my-day', label: 'My Day', icon: CalendarCheck, badge: null },
    { id: 'planner', label: 'Planner', icon: Calendar, badge: null },
    { id: 'student-life', label: 'Student Life', icon: GraduationCap, badge: 'Academic' },
    { id: 'my-memory', label: 'My Memory', icon: Brain, badge: null },
    { id: 'goals', label: 'Goals', icon: Target, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandContainer}>
        <div style={styles.logoBadge}>
          <Sparkles size={20} color="#818cf8" />
        </div>
        <div>
          <h2 style={styles.brandTitle}>LIFE OS</h2>
          <span style={styles.brandSubtitle}>Personal & Student OS</span>
        </div>
      </div>

      {/* Primary Navigation List */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {}),
              }}
            >
              <div style={styles.navButtonContent}>
                <Icon size={19} color={isActive ? '#818cf8' : '#94a3b8'} />
                <span style={{ fontWeight: isActive ? 600 : 500, color: isActive ? '#f8fafc' : '#94a3b8' }}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span style={{
                  ...styles.badge,
                  background: isActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(38, 44, 61, 0.8)',
                  color: isActive ? '#818cf8' : '#64748b'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div style={styles.userFooter}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.name || 'User'}</span>
            <span style={styles.userEmail}>{user?.email || 'Student'}</span>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          style={styles.logoutButton}
        >
          <LogOut size={16} color="#94a3b8" />
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    zIndex: 20,
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-subtle)',
  },
  logoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1.15rem',
    letterSpacing: '-0.02em',
    color: '#f8fafc',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  nav: {
    flex: 1,
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    overflowY: 'auto',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
    textAlign: 'left',
    width: '100%',
  },
  navButtonActive: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-highlight)',
  },
  navButtonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  badge: {
    fontSize: '0.65rem',
    padding: '0.15rem 0.45rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: 600,
  },
  userFooter: {
    padding: '1rem',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-card)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    overflow: 'hidden',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--accent-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.7rem',
    color: '#64748b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutButton: {
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
