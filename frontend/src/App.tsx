
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy Load Pages for Performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Predict = lazy(() => import('./pages/Predict'));
const Results = lazy(() => import('./pages/Results'));
const PatientManagement = lazy(() => import('./pages/PatientManagement'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const PatientPortal = lazy(() => import('./pages/PatientPortal')); // Re-added PatientPortal
const ComprehensiveCare = lazy(() => import('./pages/services/ComprehensiveCare'));
const AIRiskAnalysis = lazy(() => import('./pages/services/AIRiskAnalysis'));
const ExpertConsultation = lazy(() => import('./pages/services/ExpertConsultation'));
const OngoingMonitoring = lazy(() => import('./pages/services/OngoingMonitoring'));
const PatientReviews = lazy(() => import('./pages/PatientReviews'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading Screen
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-white tracking-tight">CardioAI</span>
        <span className="block text-xs font-semibold text-primary-600 uppercase tracking-wider">Loading System...</span>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Default Route - Patient Dashboard */}
          <Route path="/" element={<Layout><PatientPortal /></Layout>} />

          {/* Hidden/Specific Routing */}
          <Route path="/doctor" element={<Layout><Dashboard /></Layout>} />
          <Route path="/patients" element={<Layout><PatientManagement /></Layout>} />
          <Route path="/patient/:id" element={<Layout><PatientDetails /></Layout>} />
          <Route path="/predict" element={<Layout><Predict /></Layout>} />
          <Route path="/results" element={<Layout><Results /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />

          {/* Public Views */}
          <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
          <Route path="/reviews" element={<Layout><PatientReviews /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />

          {/* Service Pages */}
          <Route path="/services/comprehensive-care" element={<Layout><ComprehensiveCare /></Layout>} />
          <Route path="/services/ai-risk-analysis" element={<Layout><AIRiskAnalysis /></Layout>} />
          <Route path="/services/expert-consultation" element={<Layout><ExpertConsultation /></Layout>} />
          <Route path="/services/ongoing-monitoring" element={<Layout><OngoingMonitoring /></Layout>} />

          {/* Wildcard Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
