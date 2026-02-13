import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from './context/ThemeContext';

// Lazy Load Pages for Performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Predict = lazy(() => import('./pages/Predict'));
const Results = lazy(() => import('./pages/Results'));
const PatientManagement = lazy(() => import('./pages/PatientManagement'));
const PatientOverview = lazy(() => import('./pages/PatientOverview'));
const Contact = lazy(() => import('./pages/Contact'));
const Feedback = lazy(() => import('./pages/Feedback'));
const PatientPortal = lazy(() => import('./pages/PatientPortal'));
const PatientFAQ = lazy(() => import('./pages/PatientFAQ'));
const ComprehensiveCare = lazy(() => import('./pages/services/ComprehensiveCare'));
const AIRiskAnalysis = lazy(() => import('./pages/services/AIRiskAnalysis'));
const ExpertConsultation = lazy(() => import('./pages/services/ExpertConsultation'));
const OngoingMonitoring = lazy(() => import('./pages/services/OngoingMonitoring'));
const PatientReviews = lazy(() => import('./pages/PatientReviews'));
const Settings = lazy(() => import('./pages/Settings'));

const DoctorLoginPage = lazy(() => import('./pages/DoctorLoginPage'));

// Loading Screen
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight">CardioAI</span>
        <span className="block text-xs font-semibold text-primary-600 uppercase tracking-wider">Loading System...</span>
      </div>
    </div>
  </div>
);

// Protected Doctor Route Guard
const ProtectedDoctorRoute = ({ children }: { children: React.ReactNode }) => {
  const session = localStorage.getItem('doctorSession');
  return session ? <>{children}</> : <Navigate to="/doctor/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Patient Portal Routes (Default) */}
            <Route element={<PatientLayout />}>
              <Route index element={<PatientPortal />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="reviews" element={<PatientReviews />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<PatientFAQ />} />
              <Route path="services/comprehensive-care" element={<ComprehensiveCare />} />
              <Route path="services/ai-risk-analysis" element={<AIRiskAnalysis />} />
              <Route path="services/expert-consultation" element={<ExpertConsultation />} />
              <Route path="services/ongoing-monitoring" element={<OngoingMonitoring />} />
            </Route>

            {/* Doctor Portal Routes (Strict Separation) */}
            <Route path="/doctor/login" element={<DoctorLoginPage />} />
            <Route path="/doctor" element={<ProtectedDoctorRoute><DoctorLayout /></ProtectedDoctorRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Navigate to="/doctor" replace />} />
              <Route path="patients" element={<PatientManagement />} />
              <Route path="patients/:id" element={<PatientOverview />} />
              <Route path="new-assessment" element={<Predict />} />
              <Route path="results" element={<Results />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Global Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
