import React from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, Search, Sparkles, LogOut, Database, Menu, X } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    systemSettings,
    signOut,
    isFirebaseConnected,
  } = useApp();

  const handleCreateNew = () => {
    setCurrentView('create_question', { editingQuestionId: null });
  };

  return (
    <header className="no-print h-14 bg-white border-b border-line px-3 sm:px-6 flex items-center justify-between gap-2 sticky top-0 z-30">
      {/* Zone 0: Mobile hamburger + Zone 1: Wordmark */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden tap-target -ml-1 p-2 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-secondary focus:outline-hidden focus:bg-surface-secondary transition-colors shrink-0 cursor-pointer"
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
          title="Menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('dashboard');
          }}
          className="min-w-0 flex items-center gap-2 text-base font-bold tracking-tight text-ink hover:text-primary-600 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-primary-600 shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">BSCpE</span>
            <span className="hidden sm:inline md:hidden">BSCpE Data Bank</span>
            <span className="hidden md:inline">BSCpE Question Data Bank</span>
          </span>
        </a>
        <span className="text-line-strong hidden 2xl:inline shrink-0">|</span>
        <span className="text-xs text-ink-muted font-mono hidden 2xl:inline shrink-0 whitespace-nowrap">
          A.Y. {systemSettings.academicYear} · {systemSettings.currentSemester}
        </span>
      </div>

      {/* Zone 2: Navigation Links / Contextual Breadcrumb (shown when there is room for it) */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-medium text-ink-secondary shrink-0">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`hover:text-ink transition-colors ${
            currentView === 'dashboard' ? 'text-primary-600 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentView('question_bank')}
          className={`hover:text-ink transition-colors ${
            currentView === 'question_bank' ? 'text-primary-600 font-semibold' : ''
          }`}
        >
          Question Bank
        </button>
        {(currentUser.role === 'faculty' || currentUser.role === 'admin') && (
          <button
            onClick={() => setCurrentView('my_questions')}
            className={`hover:text-ink transition-colors ${
              currentView === 'my_questions' ? 'text-primary-600 font-semibold' : ''
            }`}
          >
            My Questions
          </button>
        )}
        {(currentUser.role === 'examiner' || currentUser.role === 'admin' || currentUser.role === 'faculty') && (
          <button
            onClick={() => setCurrentView('exam_generator')}
            className={`hover:text-ink transition-colors ${
              currentView === 'exam_generator' ? 'text-primary-600 font-semibold' : ''
            }`}
          >
            Exam Generator
          </button>
        )}
        {(currentUser.role === 'reviewer' || currentUser.role === 'admin') && (
          <button
            onClick={() => setCurrentView('review_queue')}
            className={`hover:text-ink transition-colors ${
              currentView === 'review_queue' ? 'text-primary-600 font-semibold' : ''
            }`}
          >
            Review Queue
          </button>
        )}
      </nav>

      {/* Zone 3: 1-2 Primary Actions & Static Current User Badge & Sign Out */}
      <div className="flex items-center gap-2 shrink-0">
        {(currentUser.role === 'faculty' || currentUser.role === 'admin') && (
          <button
            onClick={handleCreateNew}
            className="tap-target flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New Question</span>
          </button>
        )}

        {/* Current Authenticated User (Read-only status badge - no perspective switching) */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-line bg-background/80 text-ink text-xs font-medium">
          <div className="relative">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-ink text-white font-mono text-[11px] font-semibold">
              {currentUser.avatarInitials}
            </span>
            {isFirebaseConnected && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-success ring-2 ring-white"
                title="Connected to Firebase Cloud Database"
              />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-ink leading-tight truncate max-w-[130px]">
              {currentUser.name.split(',')[0]}
            </p>
            <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* High-visibility Sign Out button (icon-only on small screens) */}
        <button
          onClick={signOut}
          className="tap-target flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-danger-fg hover:text-white bg-danger-soft hover:bg-danger border border-danger-border hover:border-danger rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
          title={`Signed in as ${currentUser.name} (${currentUser.role}). Click to Sign Out`}
          aria-label={`Sign out ${currentUser.name}`}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="font-semibold hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
