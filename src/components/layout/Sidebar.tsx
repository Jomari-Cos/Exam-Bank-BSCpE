import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderTree,
  Users,
  Settings,
  ShieldCheck,
  FileQuestion,
  FilePlus,
  BookMarked,
  CheckSquare,
  History,
  FileText,
  Printer,
  ListFilter,
  Sparkles,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  /** Mobile/tablet drawer visibility (below the lg breakpoint). */
  isOpen: boolean;
  /** Closes the mobile drawer (backdrop click, Escape, navigation, resize to lg). */
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    questions,
    signOut,
  } = useApp();

  // Compute badge counts
  const pendingReviewCount = questions.filter(
    (q) => q.status === 'Submitted' || q.status === 'Under Review'
  ).length;

  const myDraftCount = questions.filter(
    (q) => q.authorId === currentUser.id && q.status === 'Draft'
  ).length;

  const approvedCount = questions.filter(
    (q) => q.status === 'Approved' || q.status === 'Published'
  ).length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  const getNavItems = (): { section: string; items: NavItem[] }[] => {
    switch (currentUser.role) {
      case 'admin':
        return [
          {
            section: 'Core System',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'courses', label: 'Course Management', icon: FolderTree },
              { id: 'topics', label: 'Topic & Syllabus', icon: ListFilter },
            ],
          },
          {
            section: 'Question Repository',
            items: [
              {
                id: 'question_bank',
                label: 'Question Bank',
                icon: FileQuestion,
                badge: approvedCount,
                badgeColor: 'bg-success-soft text-success-fg',
              },
              {
                id: 'review_queue',
                label: 'Review Queue',
                icon: CheckSquare,
                badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
                badgeColor: 'bg-warning-soft text-warning-fg',
              },
              { id: 'create_question', label: 'Create Question', icon: FilePlus },
              { id: 'exam_generator', label: 'Exam Generator', icon: FileText },
            ],
          },
          {
            section: 'Administration',
            items: [
              { id: 'audit_logs', label: 'Audit Logs', icon: ShieldCheck },
              { id: 'settings', label: 'System Settings', icon: Settings },
            ],
          },
        ];

      case 'faculty':
        return [
          {
            section: 'Author Workspace',
            items: [
              { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
              {
                id: 'my_questions',
                label: 'My Questions',
                icon: BookMarked,
                badge: myDraftCount > 0 ? `${myDraftCount} drafts` : undefined,
                badgeColor: 'bg-info-soft text-info-fg',
              },
              { id: 'create_question', label: 'Create Question', icon: FilePlus },
            ],
          },
          {
            section: 'Department Bank',
            items: [
              {
                id: 'question_bank',
                label: 'Question Bank',
                icon: FileQuestion,
                badge: approvedCount,
                badgeColor: 'bg-success-soft text-success-fg',
              },
              { id: 'exam_generator', label: 'Exam Generator', icon: FileText },
              { id: 'exam_list', label: 'Examination Sets', icon: Printer },
            ],
          },
        ];

      case 'reviewer':
        return [
          {
            section: 'Review Committee',
            items: [
              { id: 'dashboard', label: 'Reviewer Dashboard', icon: LayoutDashboard },
              {
                id: 'review_queue',
                label: 'Questions for Review',
                icon: CheckSquare,
                badge: pendingReviewCount > 0 ? `${pendingReviewCount} pending` : undefined,
                badgeColor: 'bg-warning-soft text-warning-fg font-bold animate-pulse',
              },
              { id: 'review_history', label: 'Review History', icon: History },
            ],
          },
          {
            section: 'Reference Repository',
            items: [
              {
                id: 'question_bank',
                label: 'Question Bank',
                icon: FileQuestion,
                badge: approvedCount,
                badgeColor: 'bg-success-soft text-success-fg',
              },
            ],
          },
        ];

      case 'examiner':
        return [
          {
            section: 'Assessment & Testing',
            items: [
              { id: 'dashboard', label: 'Examiner Dashboard', icon: LayoutDashboard },
              {
                id: 'question_bank',
                label: 'Question Bank',
                icon: FileQuestion,
                badge: approvedCount,
                badgeColor: 'bg-success-soft text-success-fg',
              },
              { id: 'exam_generator', label: 'Exam Generator', icon: FileText },
              { id: 'exam_list', label: 'Examination Sets', icon: Printer },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const navSections = getNavItems();

  // Drawer behavior: lock background scroll while open, close on Escape,
  // and collapse automatically when the viewport grows to desktop width (lg+),
  // where the sidebar renders statically again.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleResize = () => {
      if (window.innerWidth >= 1024) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNavClick = (id: string) => {
    if (id === 'create_question') {
      setCurrentView(id, { editingQuestionId: null });
      onClose();
      return;
    }
    setCurrentView(id);
    onClose();
  };

  return (
    <>
      {/* Mobile / tablet backdrop: closes the drawer when tapped */}
      {isOpen && (
        <div
          className="no-print lg:hidden fixed inset-0 top-14 z-30 bg-ink/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Primary navigation"
        className={`no-print w-64 shrink-0 bg-navy-900 text-navy-text flex flex-col min-h-[calc(100vh-3.5rem)] border-r border-navy-800 fixed top-14 bottom-0 left-0 z-40 transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
      {/* Active Role Card */}
      <div className="p-4 border-b border-navy-800 bg-navy-950/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-300 border border-primary-500/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
            {currentUser.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-semibold text-white truncate">{currentUser.name}</h3>
            <span className="text-[10px] text-navy-muted capitalize block truncate">
              {currentUser.role} Workspace
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden tap-target -mr-1 p-1.5 rounded-lg text-navy-muted hover:text-white hover:bg-navy-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close navigation menu"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h4 className="nav-group-label">{section.section}</h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`nav-link group ${isActive ? 'nav-link-active' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-navy-muted group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`nav-badge font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-navy-800 text-navy-text'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out & User Profile in Sidebar */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/50 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
            {currentUser.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <p className="text-[10px] text-navy-muted font-mono truncate">{currentUser.username ? `@${currentUser.username}` : currentUser.email}</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="tap-target w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-danger-accent hover:text-white bg-danger/10 hover:bg-danger border border-danger/30 hover:border-danger transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Footer System Info */}
      <div className="p-3 border-t border-navy-800 text-[11px] text-navy-muted">
        <div className="flex items-center justify-between">
          <span>BSCpE Accreditation</span>
          <span className="text-success-accent font-mono">v1.2</span>
        </div>
        <p className="text-[10px] text-navy-muted mt-0.5">CHED CMO 92 Compliant</p>
      </div>
      </aside>
    </>
  );
};
