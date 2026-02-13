
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
const ComprehensiveCare = lazy(() => import('./pages/services/ComprehensiveCare'));
const AIRiskAnalysis = lazy(() => import('./pages/services/AIRiskAnalysis'));
const ExpertConsultation = lazy(() => import('./pages/services/ExpertConsultation'));
const OngoingMonitoring = lazy(() => import('./pages/services/OngoingMonitoring'));
const PatientReviews = lazy(() => import('./pages/PatientReviews'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading Screen
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">CardioAI</span>
        {/* Assuming isDoctor is a prop or context value, for now, it's hardcoded to false to avoid errors */}
        {false && <span className="block text-xs font-semibold text-primary-600 uppercase tracking-wider">Clinical Portal</span>}
      </div>
      <p className="text-slate-500 font-medium">Loading CardioAI...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Main Application - Direct Dashboard Access */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<PatientManagement />} />
            <Route path="patient/:id" element={<PatientDetails />} />
            <Route path="predict" element={<Predict />} />
            <Route path="results" element={<Results />} />
            <Route path="settings" element={<Settings />} />

            {/* Additional Public Views Redirection */}
            <Route path="feedback" element={<Feedback />} />
            <Route path="reviews" element={<PatientReviews />} />
            <Route path="contact" element={<Contact />} />
          </Route>

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
