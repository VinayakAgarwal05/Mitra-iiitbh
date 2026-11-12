import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { CareerRoomsPage } from './pages/CareerRoomsPage';
import { CareerRoomDetailPage } from './pages/CareerRoomDetailPage';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage';
import { CollegeContactsPage } from './pages/CollegeContactsPage';
import { CalendarPage } from './pages/CalendarPage';
import { SlotBookingPage } from './pages/SlotBookingPage';
import { StudentConnectPage } from './pages/StudentConnectPage';
import { StudentIssuesPage } from './pages/StudentIssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { TermsPage } from './pages/TermsPage';
import { VisionPage } from './pages/VisionPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="career-rooms" element={<CareerRoomsPage />} />
              <Route path="career-rooms/:id" element={<CareerRoomDetailPage />} />
              <Route path="study-materials" element={<StudyMaterialsPage />} />
              <Route path="contacts" element={<CollegeContactsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="slot-booking" element={<SlotBookingPage />} />
              <Route path="student-connect" element={<StudentConnectPage />} />
              <Route path="student-issues" element={<StudentIssuesPage />} />
              <Route path="student-issues/:identifier" element={<IssueDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="vision" element={<VisionPage />} />
              <Route path="terms" element={<TermsPage />} />

              {/* Admin Protected Dashboard */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
