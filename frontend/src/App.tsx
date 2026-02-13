
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import ScrollToTop from './components/ScrollToTop';

// Lazy Load Pages for Performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Predict = lazy(() => import('./pages/Predict'));
const Results = lazy(() => import('./pages/Results'));
const PatientManagement = lazy(() => import('./pages/PatientManagement'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const PatientPortal = lazy(() => import('./pages/PatientPortal'));
const ComprehensiveCare = lazy(() => import('./pages/services/ComprehensiveCare'));
const AIRiskAnalysis = lazy(() => import('./pages/services/AIRiskAnalysis'));
const ExpertConsultation = lazy(() => import('./pages/services/ExpertConsultation'));
const OngoingMonitoring = lazy(() => import('./pages/services/OngoingMonitoring'));
const PatientReviews = lazy(() => import('./pages/PatientReviews'));
const Settings = lazy(() => import('./pages/Settings'));
const PatientNotFound = lazy(() => import('./pages/patient/PatientNotFound'));
const DoctorNotFound = lazy(() => import('./pages/doctor/DoctorNotFound'));

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

// Architectural Safeguard: Doctor Route Guard (Simple validation)
const DoctorRoute = ({ children }: { children: React.ReactNode }) => {
  const isDoctorView = window.location.pathname.startsWith("/doctor") ||
    window.location.pathname.startsWith("/patients") ||
    window.location.pathname.startsWith("/patient") ||
    window.location.pathname.startsWith("/predict") ||
    window.location.pathname.startsWith("/settings") ||
    window.location.pathname.startsWith("/results");
  return isDoctorView ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Patient Portal Routes */}
          <Route element={<PatientLayout />}>
            <Route path="/" element={<PatientPortal />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reviews" element={<PatientReviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services/comprehensive-care" element={<ComprehensiveCare />} />
            <Route path="/services/ai-risk-analysis" element={<AIRiskAnalysis />} />
            <Route path="/services/expert-consultation" element={<ExpertConsultation />} />
            <Route path="/services/ongoing-monitoring" element={<OngoingMonitoring />} />
            <Route path="*" element={<PatientNotFound />} />
          </Route>

          {/* Doctor Analytics Routes (Guarded & Isolated) */}
          <Route element={<DoctorRoute><DoctorLayout /></DoctorRoute>}>
            <Route path="/doctor" element={<Dashboard />} />
            <Route path="/patients" element={<PatientManagement />} />
            <Route path="/patient/:id" element={<PatientDetails />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/results" element={<Results />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/doctor/*" element={<DoctorNotFound />} />
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
