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
    getPatients,
    getAnalyticsSummary,
    getMonthlyTrends,
    type Patient,
    type AnalyticsSummary,
    type MonthlyTrend
} from '../lib/api';
import { safeArray, safeToFixed } from '../lib/utils';

// Modular Components
import MonthlyTrendChart from '../components/dashboard/MonthlyTrend';
import RiskDistributionChart from '../components/dashboard/RiskDistribution';
import ModelAccuracyChart from '../components/dashboard/ModelAccuracy';
import WeeklyTrend from '../components/dashboard/WeeklyTrend';
import GenderDistribution from '../components/dashboard/GenderDistribution';
import DashboardSkeleton from '../components/DashboardSkeleton';
import DoctorPerformance from '../components/dashboard/DoctorPerformance';
import CalendarView from '../components/dashboard/CalendarView';

// Isolated 3D Visualization (Lazy Loaded)
const AIVisualization3D = React.lazy(() => import('../components/dashboard/AIVisualization3D'));
const LiveSystemPulse = React.lazy(() => import('../components/dashboard/LiveSystemPulse'));

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
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            role="button"
            tabIndex={0}
            aria-label={`${title}: ${value}. ${subtitle || ''}`}
            className="relative p-6 rounded-2xl shadow-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group"
        >
            <div className="flex items-center justify-between">
                <Icon className={`w-10 h-10 ${color} drop-shadow-lg transition-transform group-hover:rotate-12 duration-300`} aria-hidden="true" />
                <span className="text-4xl font-bold tracking-tight">{value}</span>
            </div>

            <p className="mt-4 text-lg font-semibold tracking-tight">{title}</p>
            {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                    {subtitle}
                </p>
            )}

            {/* Subtle gloss effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" aria-hidden="true" />
        </motion.div>
    );
};


// Memoized Dashboard component for performance
const Dashboard = React.memo(function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isGPUUnstable, setIsGPUUnstable] = useState(false);

    const [summary, setSummary] = useState<AnalyticsSummary>({
        critical_cases: 0,
        avg_accuracy: 0,
        total_assessments: 0,
        monthly_growth: 0
    });
    const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);


    const fetchAllData = useCallback(async (showLoading = false, signal?: AbortSignal) => {
        if (showLoading) setLoading(true);
        try {
            const [
                summaryData,
                trendsData,
                patientsData
            ] = await Promise.all([
                getAnalyticsSummary(),
                getMonthlyTrends(),
                getPatients()
            ]);

            if (signal?.aborted) return;

            setSummary(summaryData && typeof summaryData === 'object' ? summaryData : {
                critical_cases: 0,
                avg_accuracy: 0,
                total_assessments: 0,
                monthly_growth: 0
            });
            setMonthlyTrends(Array.isArray(trendsData) ? trendsData : []);
            setPatients(Array.isArray(patientsData) ? patientsData : []);
        } catch (error) {
            if (signal?.aborted) return;
            console.error("Failed to fetch dashboard data", error);
            setSummary({ critical_cases: 0, avg_accuracy: 0, total_assessments: 0, monthly_growth: 0 });
            setMonthlyTrends([]);
            setPatients([]);
        } finally {
            if (showLoading && !signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchAllData(true, controller.signal);

        // Global GPU Stability Monitor
        const handleContextLost = (e: Event) => {
            e.preventDefault();
            console.warn("CardioAI: Global WebGL context loss detected. Stability safeguarding active.");
            setIsGPUUnstable(true);
        };

        const handleContextRestored = () => {
            console.info("CardioAI: WebGL context restored.");
            setIsGPUUnstable(false);
        };

        window.addEventListener('webglcontextlost', handleContextLost, false);
        window.addEventListener('webglcontextrestored', handleContextRestored, false);

        const interval = setInterval(() => {
            if (!controller.signal.aborted) {
                fetchAllData(false, controller.signal);
            }
        }, 30000);

        return () => {
            controller.abort();
            clearInterval(interval);
            window.removeEventListener('webglcontextlost', handleContextLost);
            window.removeEventListener('webglcontextrestored', handleContextRestored);
        };
    }, [fetchAllData]);

    const computedMetrics = useMemo(() => {
        const safePatients = patients || [];
        const total = safePatients.length;

        // Critical Cases Logic
        const critical = safePatients.filter(p => p.risk_level === 'High' || p.risk_level === 'Critical').length;

        // Accuracy fallback
        const accuracy = `${safeToFixed(summary?.avg_accuracy, 1, "0.0")}%`;

        // Dynamic Growth Rate (MoM)
        const now = new Date();
        const currentMonth = now.getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

        const thisMonthCount = safePatients.filter(p => new Date(p.created_at || Date.now()).getMonth() === currentMonth).length;
        const lastMonthCount = safePatients.filter(p => new Date(p.created_at || Date.now()).getMonth() === lastMonth).length;

        let growthVal = 0;
        if (lastMonthCount > 0) {
            growthVal = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
        } else if (thisMonthCount > 0) {
            growthVal = 100; // First month growth
        }

        const growth = growthVal >= 0 ? `+${growthVal}%` : `${growthVal}%`;

        return {
            total,
            critical,
            accuracy,
            growth,
            trend: growthVal >= 0 ? 'up' : 'down'
        };
    }, [summary, patients]);

    const riskDistData = useMemo(() => {
        const levels = ['Low', 'Medium', 'High', 'Critical'];
        const counts = safeArray<Patient>(patients).reduce((acc: Record<string, number>, p) => {
            const lvl = p.risk_level || 'Low';
            acc[lvl] = (acc[lvl] || 0) + 1;
            return acc;
        }, {});

        return levels.map(level => ({
            name: level,
            value: counts[level] || 0
        }));
    }, [patients]);

    // Mock/Transformed data for Clinical Charts

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
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const counts: Record<string, number> = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };

        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);

        safeArray<Patient>(patients).forEach(p => {
            const date = new Date(p.created_at || Date.now());
            if (date >= weekStart) {
                const dayName = days[date.getDay()];
                counts[dayName]++;
            }
        });

        // Clinical order starting Monday
        const clinicalOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return clinicalOrder.map(day => ({
            day,
            count: counts[day]
        }));
    }, [patients]);

    const genderDistData = useMemo(() => {
        const counts = { Male: 0, Female: 0 };
        safeArray<Patient>(patients).forEach(p => {
            if (p.sex === 1) counts.Male++;
            else counts.Female++;
        });

        return [
            { name: 'Male', value: counts.Male },
            { name: 'Female', value: counts.Female }
        ];
    }, [patients]);

    const doctorPerformanceData = useMemo(() => {
        const doctorsList = [
            { id: 1, name: 'Dr. Sarah Chen', color: 'blue' },
            { id: 2, name: 'Dr. Emily Ross', color: 'purple' },
            { id: 3, name: 'Dr. Michael Torres', color: 'emerald' }
        ];

        const counts: Record<string, number> = {};
        safeArray<Patient>(patients).forEach(p => {
            const name = p.doctor_name || 'Dr. Sarah Chen';
            counts[name] = (counts[name] || 0) + 1;
        });

        return doctorsList.map(doc => ({
            name: doc.name,
            count: counts[doc.name] || 0,
            color: doc.color
        }));
    }, [patients]);

    const assessmentCountMap = useMemo(() => {
        const map: Record<string, number> = {};
        safeArray<Patient>(patients).forEach(p => {
            const date = new Date(p.created_at || Date.now());
            // Use en-CA as it produces YYYY-MM-DD format regardless of locale
            const dateStr = date.toLocaleDateString('en-CA');
            map[dateStr] = (map[dateStr] || 0) + 1;
        });
        return map;
    }, [patients]);

    const riskWeights = useMemo(() => {
        const total = riskDistData.reduce((sum, d) => sum + d.value, 0);
        if (total === 0) return { green: 1, yellow: 0, red: 0 };

        const low = riskDistData.find(d => d.name === 'Low')?.value || 0;
        const med = riskDistData.find(d => d.name === 'Medium')?.value || 0;
        const high = (riskDistData.find(d => d.name === 'High')?.value || 0) +
            (riskDistData.find(d => d.name === 'Critical')?.value || 0);

        return {
            green: low / total,
            yellow: med / total,
            red: high / total
        };
    }, [riskDistData]);

    const handleAddPatient = () => {
        navigate('/doctor/new-assessment');
    };

    // CRITICAL: Early return must be AFTER all hooks
    if (loading && patients.length === 0) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 space-y-10">
            {isGPUUnstable && (
                <div className="bg-amber-500/10 border border-amber-500 text-amber-500 px-6 py-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        GPU Instability Detected - Reverting to Safe Rendering Mode
                    </p>
                    <button onClick={() => window.location.reload()} className="underline text-xs font-bold hover:text-amber-400 transition-colors">RELOAD SYSTEM</button>
                </div>
            )}

            {/* Clinical Header */}
            <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-2xl border border-white/5" role="banner">
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

            {/* Middle: 2D Clinical Charts Grid - V6 Layout */}

            {/* Row 1: Trends & Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <WeeklyTrend data={weeklyTrendData} />
                <MonthlyTrendChart data={monthlyTrends} />
                <DoctorPerformance data={doctorPerformanceData} />
            </div>

            {/* Row 2: Distribution & Accuracy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RiskDistributionChart data={riskDistData} />
                <GenderDistribution data={genderDistData} />
                <ModelAccuracyChart data={accuracyTrendData} />
            </div>

            {/* Row 3: Calendar View */}
            <div className="grid grid-cols-1 gap-8">
                <CalendarView assessmentMap={assessmentCountMap} />
            </div>

            {/* Divider */}
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase tracking-widest font-bold">
                    <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-500">3D Simulation Layer</span>
                </div>
            </div>

            {/* Bottom: 3D Dual Engine Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                <Suspense fallback={
                    <div className="h-[400px] w-full bg-slate-900 rounded-2xl flex items-center justify-center animate-pulse border border-slate-800">
                        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Syncing Neural Weights...</p>
                    </div>
                }>
                    {!isGPUUnstable ? (
                        <AIVisualization3D
                            stats={{
                                total: computedMetrics.total,
                                critical: computedMetrics.critical,
                                accuracy: computedMetrics.accuracy,
                                trend: computedMetrics.trend,
                                riskWeights: riskWeights
                            }}
                        />
                    ) : (
                        <div className="h-[400px] w-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-slate-800 p-8 text-center space-y-4">
                            <Activity className="h-12 w-12 text-slate-700 mx-auto" aria-hidden="true" />
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">3D Visualizer Disabled (Stability Mode)</p>
                            <p className="text-slate-600 text-sm">Hardware graphics acceleration interrupted. System remains functional in 2D mode.</p>
                        </div>
                    )}
                </Suspense>

                <Suspense fallback={
                    <div className="h-[400px] w-full bg-slate-900 rounded-2xl flex items-center justify-center animate-pulse border border-slate-800">
                        <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Modulating System Pulse...</p>
                    </div>
                }>
                    {!isGPUUnstable && (
                        <LiveSystemPulse
                            stats={{
                                total: computedMetrics.total,
                                trend: computedMetrics.trend
                            }}
                        />
                    )}
                </Suspense>
            </div>
        </div>
    );
});

export default Dashboard;
