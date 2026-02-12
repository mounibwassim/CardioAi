import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, AlertCircle, Activity, TrendingUp, Plus, RefreshCw, ChevronRight } from 'lucide-react';
import { useParallax } from '../hooks/useParallax';
import {
    getDashboardStats,
    getPatients,
    getAnalyticsSummary,
    getMonthlyTrends,
    getRiskDistribution,
    getDoctorPerformance,
    type Patient,
    type AnalyticsSummary,
    type MonthlyTrend,
    type RiskDistribution,
    type DoctorPerformance
} from '../lib/api';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardSkeleton from '../components/DashboardSkeleton';
import GenderDistributionChart from '../components/charts/GenderDistributionChart';
import AgeDistributionChart from '../components/charts/AgeDistributionChart';
// NEW: 3D Premium Charts
import AssessmentTrendsGlow from '../components/charts/AssessmentTrendsGlow';
import RiskTrends3D from '../components/charts/RiskTrends3D';
import DoctorPerformance3D from '../components/charts/DoctorPerformance3D';
import Monthly3DChart from '../components/charts/Monthly3DChart';
import RiskDistribution3D from '../components/charts/RiskDistribution3D';
import { safeArray, safeNumber } from '../lib/utils';

// Define StatCard with Glassmorphism
const StatCard = ({ title, value, icon: Icon, color, delay, onClick }: { title: string, value: string | number, icon: any, color: string, delay: number, onClick?: () => void }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4 }}
        onClick={onClick}
        className="glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 cursor-pointer hover:shadow-2xl hover:bg-white/10"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-125 transition-transform duration-500" />

        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</p>
                <motion.p
                    className="text-3xl font-extrabold text-gray-800 mt-2 tracking-tight"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: delay + 0.2 }}
                >
                    {value}
                </motion.p>
            </div>
            <div className={`p-4 rounded-xl ${color} bg-opacity-20 backdrop-blur-md border border-white/10 shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                <Icon className={`h-7 w-7 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>

        <div className="mt-4 flex items-center text-xs font-bold text-gray-500 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">
            <span>View detailed analytics</span>
            <ChevronRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all font-bold" />
        </div>
    </motion.div>
);

// Parallax Wrapper for Charts
const ChartParallaxWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const parallax = useParallax(cardRef, 0.5);

    return (
        <div ref={cardRef} className={`card-3d-tilt ${className || ''}`} style={{
            '--tilt-x': `${parallax.rotateX}deg`,
            '--tilt-y': `${parallax.rotateY}deg`
        } as React.CSSProperties}>
            {children}
        </div>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);

    // PHASE 3: Use typed analytics state instead of generic stats
    const [summary, setSummary] = useState<AnalyticsSummary>({
        critical_cases: 0,
        avg_accuracy: 0,
        total_assessments: 0,
        monthly_growth: 0
    });
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
    const [riskDist, setRiskDist] = useState<RiskDistribution[]>([]);
    const [doctorPerf, setDoctorPerf] = useState<DoctorPerformance[]>([]);

    // Keep legacy data temporarily for charts not yet migrated
    const [stats, setStats] = useState<any>({
        gender_distribution: [],
        age_distribution: [],
        assessment_trends: [],
        risk_trends: [],
        recent_activity: [],
        monthly_stats: []
    });

    // PHASE 3: Fetch using new standardized analytics endpoints
    const fetchAllData = useCallback(async (showLoading = false, signal?: AbortSignal) => {
        if (showLoading) setLoading(true);
        try {
            // Parallel fetch all analytics data
            const [
                summaryData,
                trendsData,
                riskData,
                perfData,
                patientsData,
                legacyStats  // Temporary: for charts not yet migrated
            ] = await Promise.all([
                getAnalyticsSummary(),
                getMonthlyTrends(),
                getRiskDistribution(),
                getDoctorPerformance(),
                getPatients(),
                getDashboardStats()  // Temporary: for gender/age/assessment trends
            ]);

            // Check if request was aborted before updating state
            if (signal?.aborted) return;

            // BULLETPROOF: Use Array.isArray instead of || for type safety
            setSummary(summaryData && typeof summaryData === 'object' ? summaryData : {
                critical_cases: 0,
                avg_accuracy: 0,
                total_assessments: 0,
                monthly_growth: 0
            });
            setMonthlyTrends(Array.isArray(trendsData) ? trendsData : []);
            setRiskDist(Array.isArray(riskData) ? riskData : []);
            setDoctorPerf(Array.isArray(perfData) ? perfData : []);
            setPatients(Array.isArray(patientsData) ? patientsData : []);

            // Keep legacy charts data temporarily with BULLETPROOF safe arrays
            setStats({
                gender_distribution: safeArray(legacyStats?.gender_distribution),
                age_distribution: safeArray(legacyStats?.age_distribution),
                assessment_trends: safeArray(legacyStats?.assessment_trends),
                risk_trends: safeArray(legacyStats?.risk_trends),
                recent_activity: safeArray(legacyStats?.recent_activity),
                monthly_stats: safeArray(legacyStats?.monthly_stats)
            });
        } catch (error) {
            if (signal?.aborted) return; // Ignore errors from aborted requests
            console.error("Failed to fetch dashboard data", error);

            // CRITICAL: Reset ALL state to safe defaults on error
            setSummary({ critical_cases: 0, avg_accuracy: 0, total_assessments: 0, monthly_growth: 0 });
            setMonthlyTrends([]);
            setRiskDist([]);
            setDoctorPerf([]);
            setPatients([]);
            setStats({
                gender_distribution: [],
                age_distribution: [],
                assessment_trends: [],
                risk_trends: [],
                recent_activity: [],
                monthly_stats: []
            });
        } finally {
            if (showLoading && !signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        // Initial load with loading indicator
        fetchAllData(true, controller.signal);

        // Auto-refresh metrics every 30 seconds (background sync)
        const interval = setInterval(() => {
            if (!controller.signal.aborted) {
                fetchAllData(false, controller.signal);
            }
        }, 30000);

        // Cleanup: abort pending requests and clear interval
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [fetchAllData]);

    // PHASE 3: Enhanced Memoized Metrics using new analytics state
    const computedMetrics = useMemo(() => {
        const safePatients = patients || [];
        const total = summary.total_assessments || safePatients.length;  // Use analytics total

        // Use summary data from new endpoint
        const critical = summary.critical_cases;
        const accuracy = `${summary.avg_accuracy.toFixed(1)}%`;
        const growth = summary.monthly_growth >= 0 ? `+${summary.monthly_growth}%` : `${summary.monthly_growth}%`;

        // Calculate Gender Dist from real patients (legacy until chart migration)
        const maleCount = safePatients.filter(p => p.sex === 1).length;
        const femaleCount = safePatients.filter(p => p.sex === 0).length;
        const genderDist = [
            { name: "Male", value: maleCount },
            { name: "Female", value: femaleCount }
        ];

        // Calculate Age Dist from real patients (legacy until chart migration)
        const ageGroups = [
            { ageGroup: '< 30', count: 0 },
            { ageGroup: '30-39', count: 0 },
            { ageGroup: '40-49', count: 0 },
            { ageGroup: '50-59', count: 0 },
            { ageGroup: '60+', count: 0 }
        ];

        safePatients.forEach(p => {
            const age = parseInt(String(p.age));
            if (isNaN(age)) return;

            if (age < 30) ageGroups[0].count++;
            else if (age < 40) ageGroups[1].count++;
            else if (age < 50) ageGroups[2].count++;
            else if (age < 60) ageGroups[3].count++;
            else ageGroups[4].count++;
        });

        return {
            total,
            critical,
            accuracy,
            growth,
            genderDist,
            ageGroups
        };
    }, [summary, patients]);

    const handleAddPatient = () => {
        // Navigating to Patient Management where the modal is
        navigate('/doctor/patients');
    };

    // Skeleton Loading State (Production Pattern)
    if (loading && patients.length === 0) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-10 py-8">
            {/* Header Section - REMOVED 3D */}
            <div className="relative bg-slate-900 rounded-2xl p-8 overflow-hidden mb-8">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img
                        src="/assets/images/medical abstract background blue.jpg"
                        alt="Background"
                        className="w-full h-full object-cover mix-blend-overlay"
                    />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Medical Overview</h1>
                        <p className="text-slate-300 mt-1">Hospital Administration Dashboard</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={handleAddPatient}
                            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg shadow-primary-500/20 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Patient</span>
                        </button>

                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-md">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium text-white">System Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={computedMetrics.total}
                    icon={Users}
                    color="bg-blue-500"
                    delay={0.1}
                    onClick={() => navigate('/doctor/patients')}
                />
                <StatCard
                    title="Critical Cases"
                    value={computedMetrics.critical}
                    icon={AlertCircle}
                    color="bg-red-500"
                    delay={0.2}
                    onClick={() => navigate('/doctor/patients?filter=critical')}
                />
                <StatCard
                    title="Avg. Accuracy"
                    value={computedMetrics.accuracy}
                    icon={Activity}
                    color="bg-green-500"
                    delay={0.3}
                    onClick={() => navigate('/doctor/analytics')}
                />
                <StatCard
                    title="Monthly Growth"
                    value={computedMetrics.growth}
                    icon={TrendingUp}
                    color="bg-purple-500"
                    delay={0.4}
                    onClick={() => navigate('/doctor/analytics?view=monthly')}
                />
            </div>

            {/* 3D Risk Distribution - Full Width */}
            <ChartParallaxWrapper className="grid grid-cols-1 gap-8 dashboard-column mt-8">
                <ErrorBoundary fallbackTitle="3D Chart Display Failed">
                    <RiskDistribution3D
                        data={safeArray(riskDist).map((r: any) => ({
                            level: r?.level || 'Unknown',
                            count: safeNumber(r?.count)
                        }))}
                    />
                </ErrorBoundary>
            </ChartParallaxWrapper>

            {/* Additional Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 dashboard-column mt-8">
                <ChartParallaxWrapper>
                    <ErrorBoundary fallbackTitle="Gender Chart Error">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="h-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-4"
                        >
                            <GenderDistributionChart data={computedMetrics.genderDist} />
                        </motion.div>
                    </ErrorBoundary>
                </ChartParallaxWrapper>

                <ChartParallaxWrapper>
                    <ErrorBoundary fallbackTitle="Age Chart Error">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="h-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 p-4"
                        >
                            <AgeDistributionChart data={computedMetrics.ageGroups} />
                        </motion.div>
                    </ErrorBoundary>
                </ChartParallaxWrapper>
            </div>

            {/* 3D Trends Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <ChartParallaxWrapper>
                    <ErrorBoundary fallbackTitle="Assessment Trend Error">
                        <AssessmentTrendsGlow
                            data={safeArray(stats?.assessment_trends).map((d: any) => ({
                                date: d?.date || 'N/A',
                                assessments: safeNumber(d?.total || d?.assessments || d?.count)
                            }))}
                        />
                    </ErrorBoundary>
                </ChartParallaxWrapper>

                <ChartParallaxWrapper>
                    <ErrorBoundary fallbackTitle="Risk Trend Error">
                        <RiskTrends3D
                            data={safeArray(stats?.risk_trends).map((d: any) => ({
                                date: d?.date || 'N/A',
                                low: safeNumber(d?.low),
                                medium: safeNumber(d?.medium),
                                high: safeNumber(d?.high)
                            }))}
                        />
                    </ErrorBoundary>
                </ChartParallaxWrapper>
            </div>

            {/* 3D Doctor Performance Chart - Full Width */}
            <ChartParallaxWrapper className="mt-8">
                <ErrorBoundary fallbackTitle="Doctor Performance Error">
                    <DoctorPerformance3D
                        data={safeArray(doctorPerf).map((d: any) => ({
                            doctor: d?.name || 'Unknown',
                            patients: safeNumber(d?.assessments),
                            criticalCases: safeNumber(d?.high_risk_cases)
                        }))}
                    />
                </ErrorBoundary>
            </ChartParallaxWrapper>

            {/* 3D Monthly Analytics Chart - NEW! */}
            <ChartParallaxWrapper className="mt-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                >
                    <Monthly3DChart data={safeArray(monthlyTrends).map((d: any) => ({
                        month: d?.month || 'N/A',
                        assessments: safeNumber(d?.count || d?.assessments || d?.value)
                    }))} />
                </motion.div>
            </ChartParallaxWrapper>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Recent Patient Assessments</h3>
                    <button onClick={() => fetchAllData(false)} className="text-slate-400 hover:text-primary-600 transition-colors">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name / Demographics</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {safeArray(stats?.recent_activity).length > 0 ? (
                                safeArray(stats?.recent_activity).map((item: any) => (
                                    <tr key={item?.id || Math.random()} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#REC-{item?.id || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {item?.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="font-medium text-slate-900">{item?.name || 'Unknown'}</div>
                                            <div className="text-xs">
                                                {item?.age || 'N/A'} yrs / {item?.sex === 1 ? 'M' : 'F'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item?.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                                                item?.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {item?.risk_level || 'Unknown'} Risk
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {item?.doctor || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No recent assessments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
