import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/Home/HomePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import CategoriesPage from '../pages/Categories/CategoriesPage';
import CategoryDetailPage from '../pages/Categories/CategoryDetailPage';
import JobsPage from '../pages/Jobs/JobsPage';
import JobDetailPage from '../pages/Jobs/JobDetailPage';
import FreelancersPage from '../pages/Freelancers/FreelancersPage';
import FreelancerDetailPage from '../pages/Freelancers/FreelancerDetailPage';
import ClientDashboardPage from '../pages/ClientDashboard/ClientDashboardPage';
import FreelancerDashboardPage from '../pages/FreelancerDashboard/FreelancerDashboardPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';
import LegalPage from '../pages/Legal/LegalPage';
import ProtectedRoute from './ProtectedRoute';

// <Navigate to="/signup"> would drop the query string (e.g. ?role=freelancer); keep it
const RedirectWithQuery = ({ to }) => {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Discovery Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:slug" element={<CategoryDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/freelancers" element={<FreelancersPage />} />
        <Route path="/freelancers/:id" element={<FreelancerDetailPage />} />

        {/* Authentication Routes (Primary and Aliases) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/login" element={<RedirectWithQuery to="/login" />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/auth/register" element={<RedirectWithQuery to="/signup" />} />

        {/* Policies (footer links) */}
        <Route path="/legal" element={<LegalPage />} />

        {/* Dashboard Routes with ProtectedRoute Guards */}
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/client/dashboard" element={<Navigate to="/dashboard/client" replace />} />

        <Route
          path="/dashboard/freelancer"
          element={
            <ProtectedRoute allowedRoles={['freelancer']}>
              <FreelancerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/freelancer/dashboard" element={<Navigate to="/dashboard/freelancer" replace />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
