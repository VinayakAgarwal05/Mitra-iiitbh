import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

// Code-splitting via React.lazy for optimized First Contentful Paint & minimal initial JS bundle
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CareerRoomsPage = lazy(() => import('./pages/CareerRoomsPage').then(m => ({ default: m.CareerRoomsPage })));
const CareerRoomDetailPage = lazy(() => import('./pages/CareerRoomDetailPage').then(m => ({ default: m.CareerRoomDetailPage })));
const StudyMaterialsPage = lazy(() => import('./pages/StudyMaterialsPage').then(m => ({ default: m.StudyMaterialsPage })));
const CollegeContactsPage = lazy(() => import('./pages/CollegeContactsPage').then(m => ({ default: m.CollegeContactsPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const SlotBookingPage = lazy(() => import('./pages/SlotBookingPage').then(m => ({ default: m.SlotBookingPage })));
const StudentConnectPage = lazy(() => import('./pages/StudentConnectPage').then(m => ({ default: m.StudentConnectPage })));
const StudentIssuesPage = lazy(() => import('./pages/StudentIssuesPage').then(m => ({ default: m.StudentIssuesPage })));
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage').then(m => ({ default: m.IssueDetailPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const VisionPage = lazy(() => import('./pages/VisionPage').then(m => ({ default: m.VisionPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

// Accessible, zero-CLS loading fallback skeleton
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8" role="status" aria-label="Loading page content">
    <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-brand-600 dark:border-t-brand-400 rounded-full animate-spin mb-3" />
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase animate-pulse">
      Loading Module...
    </span>
    <span className="sr-only">Please wait, content is loading.</span>
  </div>
);

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" role="status">
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" role="status">
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
          <Suspense fallback={<PageLoadingFallback />}>
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
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
