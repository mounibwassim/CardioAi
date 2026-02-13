import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    AlertTriangle,
    Activity,
    TrendingUp,
    Plus,
    RefreshCw
} from 'lucide-react';
import {
    getDashboardStats,
    getPatients,
    getAnalyticsSummary,
    getMonthlyTrends,
    getRiskDistribution,
    type Patient,
    type AnalyticsSummary,
    type MonthlyTrend,
    type RiskDistribution
} from '../lib/api';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { safeArray, safeNumber, safeToFixed } from '../lib/utils';

// Modular Components
import AssessmentTrend from '../components/dashboard/AssessmentTrend';
import MonthlyTrendChart from '../components/dashboard/MonthlyTrend';
import RiskDistributionChart from '../components/dashboard/RiskDistribution';
import ModelAccuracyChart from '../components/dashboard/ModelAccuracy';
import WeeklyTrend from '../components/dashboard/WeeklyTrend';
import GenderDistribution from '../components/dashboard/GenderDistribution';

// Isolated 3D Visualization (Lazy Loaded)
const AIVisualization3D = React.lazy(() => import('../components/dashboard/AIVisualization3D'));

// Define StatCard props to match usage
interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
    delay?: number;
    subtitle?: string;
    type?: string;
    onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, color = "text-blue-500", delay = 0.1, subtitle, onClick }: StatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            onClick={onClick}
            role="region"
            aria-label={title}
            className="relative p-6 rounded-2xl shadow-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group"
        >
            <div className="flex items-center justify-between">
                <Icon className={`w-10 h-10 ${color} drop-shadow-lg transition-transform group-hover:rotate-12 duration-300`} />
                <span className="text-4xl font-bold tracking-tight">{value}</span>
            </div>

            <p className="mt-4 text-lg font-semibold tracking-tight">{title}</p>
            {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                    {subtitle}
                </p>
            )}

            {/* Subtle gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
        </motion.div>
    );
};


// Memoized Dashboard component for performance
const Dashboard = React.memo(function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);

    const [summary, setSummary] = useState<AnalyticsSummary>({
        critical_cases: 0,
        avg_accuracy: 0,
        total_assessments: 0,
        monthly_growth: 0
    });
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
    const [riskDist, setRiskDist] = useState<RiskDistribution[]>([]);

    const [stats, setStats] = useState<any>({
        gender_distribution: [],
        age_distribution: [],
        assessment_trends: [],
        risk_trends: [],
        recent_activity: [],
        monthly_stats: []
    });

    const fetchAllData = useCallback(async (showLoading = false, signal?: AbortSignal) => {
        if (showLoading) setLoading(true);
        try {
            const [
                summaryData,
                trendsData,
                riskData,
                patientsData,
                legacyStats
            ] = await Promise.all([
                getAnalyticsSummary(),
                getMonthlyTrends(),
                getRiskDistribution(),
                getPatients(),
                getDashboardStats()
            ]);

            if (signal?.aborted) return;

            setSummary(summaryData && typeof summaryData === 'object' ? summaryData : {
                critical_cases: 0,
                avg_accuracy: 0,
                total_assessments: 0,
                monthly_growth: 0
            });
            setMonthlyTrends(Array.isArray(trendsData) ? trendsData : []);
            setRiskDist(Array.isArray(riskData) ? riskData : []);
            setPatients(Array.isArray(patientsData) ? patientsData : []);

            setStats({
                gender_distribution: safeArray(legacyStats?.gender_distribution),
                age_distribution: safeArray(legacyStats?.age_distribution),
                assessment_trends: safeArray(legacyStats?.assessment_trends),
                risk_trends: safeArray(legacyStats?.risk_trends),
                recent_activity: safeArray(legacyStats?.recent_activity),
                monthly_stats: safeArray(legacyStats?.monthly_stats)
            });
        } catch (error) {
            if (signal?.aborted) return;
            console.error("Failed to fetch dashboard data", error);
            setSummary({ critical_cases: 0, avg_accuracy: 0, total_assessments: 0, monthly_growth: 0 });
            setMonthlyTrends([]);
            setRiskDist([]);
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
        fetchAllData(true, controller.signal);
        const interval = setInterval(() => {
            if (!controller.signal.aborted) {
                fetchAllData(false, controller.signal);
            }
        }, 30000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [fetchAllData]);

    const computedMetrics = useMemo(() => {
        const safePatients = patients || [];
        const total = summary.total_assessments || safePatients.length;
        const critical = summary?.critical_cases ?? 0;
        const accuracy = `${safeToFixed(summary?.avg_accuracy, 1, "0.0")}%`;
        const growthVal = summary?.monthly_growth ?? 0;
        const growth = growthVal >= 0 ? `+${growthVal}%` : `${growthVal}%`;

        return {
            total,
            critical,
            accuracy,
            growth
        };
    }, [summary, patients]);

    const riskDistData = useMemo(() => safeArray<RiskDistribution>(riskDist).map((r) => ({
        name: r?.level || 'Unknown',
        value: safeNumber(r?.count)
    })), [riskDist]);

    // Mock/Transformed data for Clinical Charts
    const assessmentTrendData = useMemo(() => {
        // Transform recent activity into a trend line
        return safeArray(stats?.recent_activity).slice(0, 10).reverse().map((item: any) => ({
            date: item?.date ? new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A',
            score: item?.risk_score || (item?.risk_level === 'High' ? 85 : item?.risk_level === 'Medium' ? 45 : 15)
        }));
    }, [stats?.recent_activity]);

    const accuracyTrendData = useMemo(() => {
        // Generate a synthetic trend based on current accuracy
        const baseAcc = summary?.avg_accuracy || 98.2;
        return [
            { timestamp: '08:00', accuracy: baseAcc - 0.5 },
            { timestamp: '10:00', accuracy: baseAcc - 0.2 },
            { timestamp: '12:00', accuracy: baseAcc + 0.1 },
            { timestamp: '14:00', accuracy: baseAcc },
            { timestamp: '16:00', accuracy: baseAcc + 0.3 },
            { timestamp: '18:00', accuracy: baseAcc }
        ];
    }, [summary?.avg_accuracy]);

    const weeklyTrendData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            day,
            count: Math.floor(Math.random() * 5) + (day === 'Mon' || day === 'Wed' ? 3 : 1)
        }));
    }, []);

    const genderDistData = useMemo(() => {
        const males = stats.gender_distribution?.find((g: any) => g.sex === 1)?.count || 0;
        const females = stats.gender_distribution?.find((g: any) => g.sex === 0)?.count || 0;
        return [
            { name: 'Male', value: males },
            { name: 'Female', value: females }
        ];
    }, [stats.gender_distribution]);

    const handleAddPatient = () => {
        navigate('/doctor/patients');
    };

    // CRITICAL: Early return must be AFTER all hooks
    if (loading && patients.length === 0) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-10 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Clinical Header */}
            <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute inset-0 z-0 opacity-10">
                    <img
                        src="/assets/images/medical abstract background blue.jpg"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <Activity className="h-6 w-6 text-primary-400" />
                            <span className="text-primary-400 font-bold uppercase tracking-widest text-xs">Clinical Intelligence</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight">System Dashboard</h1>
                        <p className="text-slate-400 mt-2 text-lg">Cardiovascular Analysis & Patient Monitoring</p>
                    </div>
                    <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={handleAddPatient}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 group font-bold"
                        >
                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                            <span>New Assessment</span>
                        </button>

                        <button
                            onClick={() => fetchAllData(true)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Top: 4 Floating Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Patients"
                    value={computedMetrics.total}
                    subtitle="Clinical records"
                    icon={Users}
                    color="text-blue-500"
                    onClick={() => navigate('/doctor/patients')}
                    delay={0.1}
                />
                <StatCard
                    title="Critical Alerts"
                    value={computedMetrics.critical}
                    subtitle="Immediate attention"
                    icon={AlertTriangle}
                    color="text-red-500"
                    onClick={() => navigate('/doctor/patients?filter=critical')}
                    delay={0.2}
                />
                <StatCard
                    title="AI Accuracy"
                    value={computedMetrics.accuracy}
                    subtitle="Model confidence"
                    icon={Activity}
                    color="text-emerald-500"
                    delay={0.3}
                />
                <StatCard
                    title="Growth Rate"
                    value={computedMetrics.growth}
                    subtitle="Monthly volume"
                    icon={TrendingUp}
                    color="text-amber-500"
                    delay={0.4}
                />
            </div>

            {/* Middle: 2D Clinical Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AssessmentTrend data={assessmentTrendData} />
                <WeeklyTrend data={weeklyTrendData} />
                <MonthlyTrendChart data={monthlyTrends} />
                <GenderDistribution data={genderDistData} />
                <RiskDistributionChart data={riskDistData} />
                <ModelAccuracyChart data={accuracyTrendData} />
            </div>

            {/* Divider */}
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase tracking-widest font-bold">
                    <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-500">Visualization Layer</span>
                </div>
            </div>

            {/* Bottom: 3D AI Visualization Section (isolated) */}
            <div className="relative">
                <Suspense fallback={
                    <div className="h-[400px] w-full bg-slate-900 rounded-2xl flex items-center justify-center animate-pulse border border-slate-800">
                        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Initializing Neural Surface...</p>
                    </div>
                }>
                    <AIVisualization3D />
                </Suspense>
            </div>
        </div>
    );
});

export default Dashboard;
