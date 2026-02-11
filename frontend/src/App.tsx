import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientPortal from './pages/PatientPortal';
import Dashboard from './pages/Dashboard';
import Predict from './pages/Predict';
import Results from './pages/Results';
import PatientManagement from './pages/PatientManagement';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import ComprehensiveCare from './pages/services/ComprehensiveCare';
import AIRiskAnalysis from './pages/services/AIRiskAnalysis';
import ExpertConsultation from './pages/services/ExpertConsultation';
import OngoingMonitoring from './pages/services/OngoingMonitoring';
import PatientReviews from './pages/PatientReviews';

// Mock Guard for Doctor Routes
const DoctorRoute = ({ children }: { children: React.ReactNode }) => {
  const isDoctor = true; // Mock Authentication
  return isDoctor ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Patient Routes */}
        <Route path="/" element={<Layout><PatientPortal /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
        <Route path="/reviews" element={<Layout><PatientReviews /></Layout>} />

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
          <Route path="predict" element={<Predict />} />
          <Route path="results" element={<Results />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
