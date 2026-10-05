import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import IdeaAnalysisPage from './pages/IdeaAnalysisPage';
import ApprovedProjectsPage from './pages/ApprovedProjectsPage';
import FacultyProjectsPage from './pages/FacultyProjectsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminIdeasPage from './pages/AdminIdeasPage';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // State for active analysis view
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null);
  const [selectedAnalysisData, setSelectedAnalysisData] = useState(null);

  // Set default page on login according to user role
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        setCurrentPage('dashboard');
      } else if (user.role === 'faculty') {
        setCurrentPage('faculty-hub');
      } else if (user.role === 'admin') {
        setCurrentPage('admin-users');
      }
    }
  }, [user]);

  // Navigate to analysis page
  const handleOpenAnalysis = (ideaId, analysisData = null) => {
    setSelectedAnalysisId(ideaId);
    setSelectedAnalysisData(analysisData);
    setCurrentPage('analysis-detail');
  };

  // Back from analysis to dashboard
  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedAnalysisId(null);
    setSelectedAnalysisData(null);
  };

  // Edit idea from analysis page
  const handleEditIdea = (idea) => {
    setCurrentPage('dashboard');
    // Dashboard can receive the idea to edit
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center">
        <LoadingSpinner text="Initializing IdeaVault workspace..." />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-vault-bg text-vault-text flex flex-col lg:flex-row">
      {/* Role-Aware Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={(page) => setCurrentPage(page)} />

      {/* Main Content View */}
      <main className="flex-1 min-w-0 overflow-y-auto min-h-screen">
        {currentPage === 'dashboard' && (
          <StudentDashboard onSelectAnalysis={handleOpenAnalysis} />
        )}

        {currentPage === 'analysis-detail' && (
          <IdeaAnalysisPage
            ideaId={selectedAnalysisId}
            initialAnalysis={selectedAnalysisData}
            onBack={handleBackToDashboard}
            onEditIdea={handleEditIdea}
          />
        )}

        {currentPage === 'analyses' && (
          <StudentDashboard onSelectAnalysis={handleOpenAnalysis} />
        )}

        {currentPage === 'catalog' && (
          <ApprovedProjectsPage />
        )}

        {currentPage === 'faculty-hub' && (
          <FacultyProjectsPage />
        )}

        {currentPage === 'admin-users' && (
          <AdminUsersPage />
        )}

        {currentPage === 'admin-ideas' && (
          <AdminIdeasPage onSelectAnalysis={handleOpenAnalysis} />
        )}
      </main>
    </div>
  );
}
