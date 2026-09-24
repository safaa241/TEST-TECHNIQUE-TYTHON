import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PatientsPage from '../pages/PatientsPage';
import PatientDetailsPage from '../pages/PatientDetailsPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/patients"
      element={
        <ProtectedRoute>
          <PatientsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/patients/:id"
      element={
        <ProtectedRoute>
          <PatientDetailsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/appointments"
      element={
        <ProtectedRoute>
          <AppointmentsPage />
        </ProtectedRoute>
      }
    />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;