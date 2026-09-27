import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyProfile } from './pages/student/MyProfile';
import { PlacementDrives } from './pages/student/PlacementDrives';
import { Companies } from './pages/student/Companies';
import { PracticeHub } from './pages/student/PracticeHub';
import { QuizRunner } from './pages/student/QuizRunner';
import { QuizResult } from './pages/student/QuizResult';
import { InterviewPrep } from './pages/student/InterviewPrep';
import { MockInterview } from './pages/student/MockInterview';
import { MyResults } from './pages/student/MyResults';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StudentDirectory } from './pages/staff/StudentDirectory';
import { ManageDrives } from './pages/staff/ManageDrives';
import { ApplicationReview } from './pages/staff/ApplicationReview';
import { QuestionBank } from './pages/staff/QuestionBank';
import { Notifications } from './pages/common/Notifications';
import { Settings } from './pages/common/Settings';
import { StaffQuizResults } from './pages/staff/StaffQuizResults';
import { QuestionCategory, QuizAnswerDetail } from './types';
import { LoadingState } from './components/common/LoadingState';

const MainLayout: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Active quiz state
  const [activeQuizParams, setActiveQuizParams] = useState<{
    category: QuestionCategory | 'daily';
    topic?: string;
  } | null>(null);

  // Active quiz result state
  const [activeQuizResult, setActiveQuizResult] = useState<{
    category: string;
    topic?: string;
    score: number;
    total: number;
    percentage: number;
    answers: QuizAnswerDetail[];
  } | null>(null);

  // Mock interview custom role state
  const [mockRole, setMockRole] = useState('Associate Software Engineer');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingState message="Initializing CampusHire Portal..." />
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Strict role permission sets
  const staffOnlyTabs = new Set([
    'staff-dashboard',
    'staff-students',
    'manage-drives',
    'staff-applications',
    'question-bank',
    'quiz-results',
    'analytics',
  ]);

  const studentOnlyTabs = new Set([
    'student-dashboard',
    'my-profile',
    'placement-drives',
    'aptitude-practice',
    'technical-practice',
    'critical-thinking',
    'interview-prep',
    'mock-interview',
    'my-results',
    'quiz-runner',
    'quiz-result',
  ]);

  // Strict Role Guarding: Students cannot access staff portal
  let resolvedTab = currentTab;
  if (currentTab === 'dashboard') {
    resolvedTab = role === 'staff' ? 'staff-dashboard' : 'student-dashboard';
  } else if (role === 'student' && staffOnlyTabs.has(currentTab)) {
    resolvedTab = 'student-dashboard';
  } else if (role === 'staff' && studentOnlyTabs.has(currentTab)) {
    resolvedTab = 'staff-dashboard';
  }

  const handleStartQuiz = (category: QuestionCategory | 'daily', topic?: string) => {
    setActiveQuizParams({ category, topic });
    setCurrentTab('quiz-runner');
  };

  const handleQuizComplete = (resultData: {
    category: string;
    topic?: string;
    score: number;
    total: number;
    percentage: number;
    answers: QuizAnswerDetail[];
  }) => {
    setActiveQuizResult(resultData);
    setCurrentTab('quiz-result');
  };

  const handleStartMock = (targetRole: string) => {
    setMockRole(targetRole);
    setCurrentTab('mock-interview');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex">
        <Sidebar
          currentTab={resolvedTab}
          onSelectTab={tabId => {
            setCurrentTab(tabId);
            setIsMobileSidebarOpen(false);
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Student Tabs */}
          {resolvedTab === 'student-dashboard' && (
            <StudentDashboard
              onNavigate={(tabId, params) => {
                if (tabId === 'quiz-runner' && params) {
                  handleStartQuiz(params.category, params.topic);
                } else {
                  setCurrentTab(tabId);
                }
              }}
            />
          )}

          {resolvedTab === 'my-profile' && <MyProfile />}
          {resolvedTab === 'placement-drives' && <PlacementDrives />}
          {resolvedTab === 'companies' && (
            <Companies
              onStartCompanyPractice={(comp, cat) => handleStartQuiz(cat as QuestionCategory, comp)}
            />
          )}

          {resolvedTab === 'aptitude-practice' && (
            <PracticeHub category="aptitude" onStartQuiz={handleStartQuiz} />
          )}

          {resolvedTab === 'technical-practice' && (
            <PracticeHub category="technical" onStartQuiz={handleStartQuiz} />
          )}

          {resolvedTab === 'critical-thinking' && (
            <PracticeHub category="critical" onStartQuiz={handleStartQuiz} />
          )}

          {resolvedTab === 'interview-prep' && (
            <InterviewPrep onStartMockInterview={handleStartMock} />
          )}

          {resolvedTab === 'mock-interview' && (
            <MockInterview
              initialRole={mockRole}
              onGoHome={() => setCurrentTab('student-dashboard')}
            />
          )}

          {resolvedTab === 'my-results' && <MyResults />}

          {resolvedTab === 'quiz-runner' && activeQuizParams && (
            <QuizRunner
              category={activeQuizParams.category}
              topic={activeQuizParams.topic}
              onComplete={handleQuizComplete}
              onCancel={() => setCurrentTab('student-dashboard')}
            />
          )}

          {resolvedTab === 'quiz-result' && activeQuizResult && (
            <QuizResult
              result={activeQuizResult}
              onRetake={() => {
                if (activeQuizParams) {
                  handleStartQuiz(activeQuizParams.category, activeQuizParams.topic);
                } else {
                  setCurrentTab('student-dashboard');
                }
              }}
              onGoHome={() => setCurrentTab('student-dashboard')}
            />
          )}

          {/* Staff Tabs */}
          {resolvedTab === 'staff-dashboard' && (
            <StaffDashboard onNavigate={tabId => setCurrentTab(tabId)} />
          )}

          {resolvedTab === 'staff-students' && <StudentDirectory />}
          {resolvedTab === 'manage-drives' && <ManageDrives />}
          {resolvedTab === 'staff-applications' && <ApplicationReview />}
          {resolvedTab === 'question-bank' && <QuestionBank />}
          {resolvedTab === 'quiz-results' && <StaffQuizResults />}
          {resolvedTab === 'analytics' && (
            <StaffDashboard onNavigate={tabId => setCurrentTab(tabId)} />
          )}

          {/* Common Tabs */}
          {resolvedTab === 'notifications' && <Notifications />}
          {resolvedTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
