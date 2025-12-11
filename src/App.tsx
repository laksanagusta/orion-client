import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import CertificateInputV2Page from "@/features/certificates/CertificateInputV2Page";
import CertificateListPage from "@/features/certificates/CertificateListPage";
import CertificateDetailPage from "@/features/certificates/CertificateDetailPage";
import ProfilePage from "@/features/profile/ProfilePage";
import MonitoringPage from "@/features/monitoring/MonitoringPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/certificates/input" element={<CertificateInputV2Page />} />
          <Route path="/certificates/list" element={<CertificateListPage />} />
          <Route path="/certificates/:id" element={<CertificateDetailPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/notifications" element={<div>Notifications Page</div>} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

