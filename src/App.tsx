import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { QuestionPreviewModal } from './components/common/QuestionPreviewModal';
import { LoginPage } from './components/auth/LoginPage';

// Admin views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CourseManagement } from './components/admin/CourseManagement';
import { TopicManagement } from './components/admin/TopicManagement';
import { UserManagement } from './components/admin/UserManagement';
import { AuditLogView } from './components/admin/AuditLogView';
import { SystemSettingsView } from './components/admin/SystemSettingsView';

// Faculty views
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { MyQuestions } from './components/faculty/MyQuestions';
import { QuestionEditor } from './components/faculty/QuestionEditor';

// Reviewer views
import { ReviewerDashboard } from './components/reviewer/ReviewerDashboard';
import { ReviewQueue } from './components/reviewer/ReviewQueue';
import { ReviewHistory } from './components/reviewer/ReviewHistory';

// Bank & Examiner views
import { QuestionBankView } from './components/bank/QuestionBankView';
import { ExaminerDashboard } from './components/examiner/ExaminerDashboard';
import { ExamGenerator } from './components/examiner/ExamGenerator';
import { ExamListView } from './components/examiner/ExamListView';
import { ExamPrintView } from './components/examiner/ExamPrintView';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    currentView,
    viewingQuestionId,
    setViewingQuestionId,
    setCurrentView,
    submitQuestionForReview,
    questions,
    isAuthenticated,
    sessionRestored,
  } = useApp();

  // Mobile / tablet: sidebar is rendered as an off-canvas drawer.
  // It is toggled by the hamburger button in the header (visible below lg).
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = React.useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = React.useCallback(() => setIsSidebarOpen((open) => !open), []);

  // While the signed-in account is being restored, render a neutral loading
  // screen. This prevents a reload from flashing the default administrator.
  if (isAuthenticated && !sessionRestored) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-ink-secondary">
          <span className="w-5 h-5 rounded-full border-2 border-line-strong border-t-indigo-600 animate-spin" />
          <span className="text-sm font-medium">Restoring your workspace…</span>
        </div>
      </div>
    );
  }

  // If not authenticated, display login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Find question if currently previewing
  const viewingQuestion = viewingQuestionId
    ? questions.find((q) => q.id === viewingQuestionId) || null
    : null;

  const renderContent = () => {
    // Routes accessible across roles
    if (currentView === 'question_bank') return <QuestionBankView />;
    if (currentView === 'exam_generator') return <ExamGenerator />;
    if (currentView === 'exam_list') return <ExamListView />;
    if (currentView === 'exam_view') return <ExamPrintView />;
    if (currentView === 'create_question') return <QuestionEditor />;

    // Role-specific routing
    switch (currentUser.role) {
      case 'admin':
        switch (currentView) {
          case 'dashboard':
            return <AdminDashboard />;
          case 'courses':
            return <CourseManagement />;
          case 'topics':
            return <TopicManagement />;
          case 'users':
            return <UserManagement />;
          case 'audit_logs':
            return <AuditLogView />;
          case 'settings':
            return <SystemSettingsView />;
          case 'review_queue':
            return <ReviewQueue />;
          case 'review_history':
            return <ReviewHistory />;
          case 'my_questions':
            return <MyQuestions />;
          default:
            return <AdminDashboard />;
        }

      case 'faculty':
        switch (currentView) {
          case 'dashboard':
            return <FacultyDashboard />;
          case 'my_questions':
            return <MyQuestions />;
          default:
            return <FacultyDashboard />;
        }

      case 'reviewer':
        switch (currentView) {
          case 'dashboard':
            return <ReviewerDashboard />;
          case 'review_queue':
            return <ReviewQueue />;
          case 'review_history':
            return <ReviewHistory />;
          default:
            return <ReviewerDashboard />;
        }

      case 'examiner':
        switch (currentView) {
          case 'dashboard':
            return <ExaminerDashboard />;
          default:
            return <ExaminerDashboard />;
        }

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      <div className="flex-1 flex min-w-0">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto print:p-0 print:m-0 print:max-w-none">
          {renderContent()}
        </main>
      </div>

      {/* Global Question Inspection Modal */}
      {viewingQuestion && (
        <QuestionPreviewModal
          question={viewingQuestion}
          onClose={() => setViewingQuestionId(null)}
          onEdit={(id) => {
            setViewingQuestionId(null);
            setCurrentView('create_question', { editingQuestionId: id });
          }}
          onSubmitForReview={(id) => {
            submitQuestionForReview(id);
            setViewingQuestionId(null);
          }}
          onReview={() => {
            setViewingQuestionId(null);
            setCurrentView('review_queue');
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
