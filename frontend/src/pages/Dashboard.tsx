import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
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
import DashboardSkeleton from '../components/DashboardSkeleton';
// 3D charts removed for performance and clinical clarity
import { safeArray, safeNumber, safeToFixed } from '../lib/utils';

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

const StatCard = ({ title, value, icon: Icon, color = "bg-primary-500", delay = 0.1, subtitle, type, onClick }: StatCardProps) => {
    const displayColor = color || (
        type === 'danger' ? 'bg-red-500' :
            type === 'success' ? 'bg-green-500' :
                type === 'warning' ? 'bg-amber-500' :
                    'bg-primary-500'
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            onClick={onClick}
            role="region"
            aria-label={title}
            className={`glass-card p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 cursor-pointer hover:shadow-2xl hover:bg-white/10 animate-float`}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent -mr-16 -mt-16 rounded-full group-hover:scale-125 transition-transform duration-500" />

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-extrabold text-gray-800 mt-2 tracking-tight">
                        {value}
                    </p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-4 rounded-xl ${displayColor} bg-opacity-20 backdrop-blur-md border border-white/10 shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${displayColor.replace('bg-', 'text-')}`} />
                </div>
            </div>
        </motion.div>
    );
};


// Memoized Dashboard component for performance
const Dashboard = React.memo(function Dashboard() {
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

            // DEBUG API Response - Helps identify malformed/missing data causing crashes
            console.log("Analytics Payload [Summary]:", summaryData);
            console.log("Analytics Payload [Trends]:", trendsData);

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

        // Use summary data from new endpoint with extreme safety guards
        const critical = summary?.critical_cases ?? 0;

        // CRITICAL FIX: Ensure toFixed is never called on undefined (React #310)
        const accuracy = `${safeToFixed(summary?.avg_accuracy, 1, "0.0")}%`;

        const growthVal = summary?.monthly_growth ?? 0;
        const growth = growthVal >= 0 ? `+${growthVal}%` : `${growthVal}%`;

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
                    value={String(computedMetrics.total)}
                    subtitle="Registered patients"
                    type="primary"
                    icon={Users}
                    onClick={() => navigate('/doctor/patients')}
                />
                <StatCard
                    title="Critical Cases"
                    value={String(computedMetrics.critical)}
                    subtitle="High risk detected"
                    type="danger"
                    icon={AlertTriangle}
                    onClick={() => navigate('/doctor/patients?filter=critical')}
                />
                <StatCard
                    title="Avg. Accuracy"
                    value={computedMetrics.accuracy}
                    subtitle="Model performance"
                    type="success"
                    icon={Activity}
                    onClick={() => navigate('/doctor/analytics')}
                />
                <StatCard
                    title="Monthly Growth"
                    value={computedMetrics.growth}
                    subtitle="Volume increase"
                    type="warning"
                    icon={TrendingUp}
                    onClick={() => navigate('/doctor/analytics?view=monthly')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assessment Trends */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Monthly Assessment Trends
                        </h3>
                        <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">2026 Full Year View</div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrends}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assessments" isAnimationActive={false} />
                                <Bar dataKey="high_risk" fill="#ef4444" radius={[4, 4, 0, 0]} name="High Risk" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Doctor Performance Redesign */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Doctor Performance
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={useMemo(() => safeArray<DoctorPerformance>(doctorPerf).map((d) => ({
                                doctor: d?.name || 'Unknown',
                                patients: safeNumber(d?.assessments)
                            })), [doctorPerf])}>
                                <XAxis
                                    dataKey="doctor"
                                    tick={{ fontSize: 14, fontWeight: 600, fill: '#475569' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="patients" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                                    {safeArray(doctorPerf).map((_, index) => (
                                        <Cell key={index} fill={`hsl(${index * 70}, 70%, 50%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Distribution Optimized */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-600" />
                        Risk Distribution
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={useMemo(() => safeArray<RiskDistribution>(riskDist).map((r) => ({
                                        name: r?.level || 'Unknown',
                                        value: safeNumber(r?.count)
                                    })), [riskDist])}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    paddingAngle={8}
                                    innerRadius={80}
                                    outerRadius={120}
                                    isAnimationActive={false}
                                    label={({ name, percent }: { name?: string, percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
                                >
                                    {safeArray<RiskDistribution>(riskDist).map((_entry, index) => {
                                        const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
                                        return <Cell key={index} fill={COLORS[index % COLORS.length]} />;
                                    })}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table (Full Width) */}
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
});
export default Dashboard;
