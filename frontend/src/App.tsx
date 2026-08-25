import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetsPage } from './pages/AssetsPage';
import { AssetDetailPage } from './pages/AssetDetailPage';
import { MapPage } from './pages/MapPage';
import { PrioritiesPage } from './pages/PrioritiesPage';
import { BudgetPage } from './pages/BudgetPage';
import { SimulationPage } from './pages/SimulationPage';
import { ReportsPage } from './pages/ReportsPage';
import { CivicReportsPage } from './pages/CivicReportsPage';
import { CitizenPortalPage } from './pages/citizen/CitizenPortalPage';
import { CitizenReportPage } from './pages/citizen/CitizenReportPage';
import { CitizenReportsPage } from './pages/citizen/CitizenReportsPage';
import { CitizenReportDetailPage } from './pages/citizen/CitizenReportDetailPage';
import { CitizenRewardsPage } from './pages/citizen/CitizenRewardsPage';
import { CitizenLeaderboardPage } from './pages/citizen/CitizenLeaderboardPage';
import { CitizenImpactPage } from './pages/citizen/CitizenImpactPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* Public Landing & Auth Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />

            {/* Public Citizen Civic Intelligence Layer */}
            <Route path="citizen" element={<CitizenPortalPage />} />
            <Route path="citizen/portal" element={<CitizenPortalPage />} />
            <Route path="citizen/report" element={<CitizenReportPage />} />
            <Route path="citizen/reports" element={<CitizenReportsPage />} />
            <Route path="citizen/my-reports" element={<CitizenReportsPage />} />
            <Route path="citizen/report/:reportId" element={<CitizenReportDetailPage />} />
            <Route path="citizen/reports/:reportId" element={<CitizenReportDetailPage />} />
            <Route path="citizen/rewards" element={<CitizenRewardsPage />} />
            <Route path="citizen/leaderboard" element={<CitizenLeaderboardPage />} />
            <Route path="citizen/impact" element={<CitizenImpactPage />} />

            {/* Public / Semi-protected GIS Map */}
            <Route path="map" element={<MapPage />} />

            {/* Protected Decision Intelligence Government Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assets"
              element={
                <ProtectedRoute>
                  <AssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assets/:id"
              element={
                <ProtectedRoute>
                  <AssetDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="priorities"
              element={
                <ProtectedRoute>
                  <PrioritiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="budget"
              element={
                <ProtectedRoute>
                  <BudgetPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="simulation"
              element={
                <ProtectedRoute>
                  <SimulationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="civic-reports"
              element={
                <ProtectedRoute>
                  <CivicReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="actions"
              element={
                <ProtectedRoute>
                  <CivicReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
