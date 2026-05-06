import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { fetchCurrentUser } from './features/auth/authSlice';

import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PaymentsPage from './pages/PaymentsPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import AuditLogsPage from './pages/AuditLogsPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchCurrentUser());
  }, [dispatch, isLoggedIn]);

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="patients"     element={<PatientsPage />} />
        <Route path="doctors"      element={<DoctorsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="payments"     element={<PaymentsPage />} />
        <Route path="diagnostics"  element={<DiagnosticsPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="departments"   element={<DepartmentsPage />} />
        <Route path="audit-logs"    element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
