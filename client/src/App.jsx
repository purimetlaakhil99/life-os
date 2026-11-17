import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AIProvider } from './context/AIContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout & Overlays
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { VoiceOverlay } from './components/voice/VoiceOverlay';
import { UniversalCaptureModal } from './components/capture/UniversalCaptureModal';

// Pages
import { AuthPage } from './pages/Auth/AuthPage';
import { HomePage } from './pages/Home/HomePage';
import { AIAssistantPage } from './pages/AIAssistant/AIAssistantPage';
import { MyDayPage } from './pages/MyDay/MyDayPage';
import { PlannerPage } from './pages/Planner/PlannerPage';
import { StudentLifePage } from './pages/StudentLife/StudentLifePage';
import { MyMemoryPage } from './pages/MyMemory/MyMemoryPage';
import { GoalsPage } from './pages/Goals/GoalsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentSection, setCurrentSection] = useState('home');
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Initializing LIFE OS Core Engine...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const sectionTitles = {
    'home': 'Home Dashboard',
    'ai-assistant': 'Unified AI & Multilingual Voice Assistant',
    'my-day': 'My Day & Tasks',
    'planner': 'Smart Planner & Schedule',
    'student-life': 'Student Life & Academic Intelligence',
    'my-memory': 'Personal AI Memory (Private Vault)',
    'goals': 'Goals, Habits & Consistency Streaks',
    'settings': 'Settings & Integrations',
  };

  return (
    <div className="app-container">
      {/* 8 Primary Navigation Sections Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={(section) => setCurrentSection(section)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          currentSectionTitle={sectionTitles[currentSection] || 'LIFE OS'}
          onOpenCapture={() => setIsCaptureModalOpen(true)}
        />

        <main className="content-body">
          {currentSection === 'home' && <HomePage onNavigate={(sec) => setCurrentSection(sec)} />}
          {currentSection === 'ai-assistant' && <AIAssistantPage />}
          {currentSection === 'my-day' && <MyDayPage />}
          {currentSection === 'planner' && <PlannerPage />}
          {currentSection === 'student-life' && <StudentLifePage />}
          {currentSection === 'my-memory' && <MyMemoryPage />}
          {currentSection === 'goals' && <GoalsPage />}
          {currentSection === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Unified Voice Assistant Overlay */}
      <VoiceOverlay />

      {/* Universal Quick Capture Modal */}
      <UniversalCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onCaptured={(res) => {
          // Can show notification or refresh
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AIProvider>
          <MainApp />
        </AIProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    gap: '1rem',
  },
  spinner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTopColor: '#6366f1',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
};
