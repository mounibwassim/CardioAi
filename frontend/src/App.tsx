
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy Load Pages for Performance
const PatientPortal = lazy(() => import('./pages/PatientPortal'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Predict = lazy(() => import('./pages/Predict'));
const Results = lazy(() => import('./pages/Results'));
const PatientManagement = lazy(() => import('./pages/PatientManagement'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const ComprehensiveCare = lazy(() => import('./pages/services/ComprehensiveCare'));
const AIRiskAnalysis = lazy(() => import('./pages/services/AIRiskAnalysis'));
const ExpertConsultation = lazy(() => import('./pages/services/ExpertConsultation'));
const OngoingMonitoring = lazy(() => import('./pages/services/OngoingMonitoring'));
const PatientReviews = lazy(() => import('./pages/PatientReviews'));
const DoctorLogin = lazy(() => import('./pages/DoctorLogin'));

// Loading Screen
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      <p className="text-slate-500 font-medium">Loading CardioAI...</p>
    </div>
  </div>
);

// Protected Route Guard
const DoctorRoute = ({ children }: { children: React.ReactNode }) => {
  const userRole = localStorage.getItem('user_role');
  const token = localStorage.getItem('auth_token');

  const isAuthenticated = userRole === 'doctor' && !!token;

  if (!isAuthenticated) {
    // Redirect to Home (or secret login if we wanted, but for security simply deny access)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Patient Routes */}
          <Route path="/" element={<Layout><PatientPortal /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
          <Route path="/reviews" element={<Layout><PatientReviews /></Layout>} />

          {/* Doctor Login - Hidden Secure Route */}
          <Route path="/doctor-secure-access-portal" element={<DoctorLogin />} />

          {/* Service Pages */}
          <Route path="/services/comprehensive-care" element={<Layout><ComprehensiveCare /></Layout>} />
          <Route path="/services/ai-risk-analysis" element={<Layout><AIRiskAnalysis /></Layout>} />
          <Route path="/services/expert-consultation" element={<Layout><ExpertConsultation /></Layout>} />
          <Route path="/services/ongoing-monitoring" element={<Layout><OngoingMonitoring /></Layout>} />

          {/* Protected Doctor Routes */}
          <Route path="/doctor" element={
            <DoctorRoute>
              <Layout />
            </DoctorRoute>
          }>
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="patient/:id" element={<PatientDetails />} />
            <Route path="predict" element={<Predict />} />
            <Route path="results" element={<Results />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
