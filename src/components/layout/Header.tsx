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
    <header className="no-print h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-2 sticky top-0 z-30">
      {/* Zone 0: Mobile hamburger + Zone 1: Wordmark */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden tap-target -ml-1 p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden focus:bg-slate-100 transition-colors shrink-0 cursor-pointer"
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
          className="min-w-0 flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">BSCpE</span>
            <span className="hidden sm:inline md:hidden">BSCpE Data Bank</span>
            <span className="hidden md:inline">BSCpE Question Data Bank</span>
          </span>
        </a>
        <span className="text-slate-300 hidden 2xl:inline shrink-0">|</span>
        <span className="text-xs text-slate-500 font-mono hidden 2xl:inline shrink-0 whitespace-nowrap">
          A.Y. {systemSettings.academicYear} · {systemSettings.currentSemester}
        </span>
      </div>

      {/* Zone 2: Navigation Links / Contextual Breadcrumb (shown when there is room for it) */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-medium text-slate-600 shrink-0">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`hover:text-slate-900 transition-colors ${
            currentView === 'dashboard' ? 'text-indigo-600 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentView('question_bank')}
          className={`hover:text-slate-900 transition-colors ${
            currentView === 'question_bank' ? 'text-indigo-600 font-semibold' : ''
          }`}
        >
          Question Bank
        </button>
        {(currentUser.role === 'faculty' || currentUser.role === 'admin') && (
          <button
            onClick={() => setCurrentView('my_questions')}
            className={`hover:text-slate-900 transition-colors ${
              currentView === 'my_questions' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            My Questions
          </button>
        )}
        {(currentUser.role === 'examiner' || currentUser.role === 'admin' || currentUser.role === 'faculty') && (
          <button
            onClick={() => setCurrentView('exam_generator')}
            className={`hover:text-slate-900 transition-colors ${
              currentView === 'exam_generator' ? 'text-indigo-600 font-semibold' : ''
            }`}
          >
            Exam Generator
          </button>
        )}
        {(currentUser.role === 'reviewer' || currentUser.role === 'admin') && (
          <button
            onClick={() => setCurrentView('review_queue')}
            className={`hover:text-slate-900 transition-colors ${
              currentView === 'review_queue' ? 'text-indigo-600 font-semibold' : ''
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
            className="tap-target flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New Question</span>
          </button>
        )}

        {/* Current Authenticated User (Read-only status badge - no perspective switching) */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 text-slate-800 text-xs font-medium">
          <div className="relative">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-[11px] font-semibold">
              {currentUser.avatarInitials}
            </span>
            {isFirebaseConnected && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Connected to Firebase Cloud Database"
              />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
              {currentUser.name.split(',')[0]}
            </p>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* High-visibility Sign Out button (icon-only on small screens) */}
        <button
          onClick={signOut}
          className="tap-target flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
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
