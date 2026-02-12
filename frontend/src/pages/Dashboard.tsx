import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, AlertCircle, Activity, TrendingUp, Plus, RefreshCw } from 'lucide-react';
import { getDashboardStats, getPatients, type Patient } from '../lib/api';
import ErrorBoundary from '../components/ErrorBoundary';
import DashboardSkeleton from '../components/DashboardSkeleton';
import GenderDistributionChart from '../components/charts/GenderDistributionChart';
import AgeDistributionChart from '../components/charts/AgeDistributionChart';
import AssessmentTrendsChart from '../components/charts/AssessmentTrendsChart';
import RiskTrendsChart from '../components/charts/RiskTrendsChart';
import DoctorPerformanceChart from '../components/charts/DoctorPerformanceChart';
import Monthly3DChart from '../components/charts/Monthly3DChart';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// Define StatCard outside to prevent re-renders
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [stats, setStats] = useState<any>({
        total_patients: 0,
        critical_cases: 0,
        avg_accuracy: '0%',
        monthly_growth: '0%',
        recent_activity: [],
        risk_distribution: [],
        gender_distribution: [],
        age_distribution: [],
        assessment_trends: [],
        risk_trends: [],
        doctor_performance: [],
        monthly_stats: [] // For 3D chart
    });

    // Fetch function with AbortController support for memory safety
    const fetchAllData = useCallback(async (showLoading = false, signal?: AbortSignal) => {
        if (showLoading) setLoading(true);
        try {
            const [statsData, patientsData] = await Promise.all([
                getDashboardStats(),
                getPatients()
            ]);

            // Check if request was aborted before updating state
            if (signal?.aborted) return;

            // Prepare monthly data for 3D chart from assessment trends
            const monthlyData = statsData.assessment_trends?.slice(-12).map((item: any) => ({
                month: item.month,
                assessments: item.count
            })) || [];

            setStats({ ...statsData, monthly_stats: monthlyData });
            setPatients(patientsData);
        } catch (error) {
            if (signal?.aborted) return; // Ignore errors from aborted requests
            console.error("Failed to fetch dashboard data", error);
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

    // Enhanced Memoized Metrics Calculation with NaN Guards
    const computedMetrics = useMemo(() => {
        // CRITICAL: All numeric values must go through sanitization
        const safePatients = patients || [];
        const total = safePatients.length;

        // Critical Cases: Count patients with High risk level
        const critical = safePatients.filter(p => p.risk_level === 'High').length;

        // Safe Accuracy Calculation
        // If stats has numeric accuracy, use it; otherwise default to 0
        let accuracy = '0%';
        if (stats.avg_accuracy) {
            // If already a string with %, use it
            if (typeof stats.avg_accuracy === 'string') {
                accuracy = stats.avg_accuracy;
            } else {
                // If numeric, format it
                const numAcc = parseFloat(stats.avg_accuracy);
                accuracy = !isNaN(numAcc) && isFinite(numAcc) ? `${numAcc.toFixed(1)}%` : '0%';
            }
        }

        // Safe Growth Calculation
        let growth = '0%';
        if (stats.monthly_growth) {
            growth = typeof stats.monthly_growth === 'string' ? stats.monthly_growth : '0%';
        }

        // Calculate Gender Dist from real patients
        const maleCount = safePatients.filter(p => p.sex === 1).length;
        const femaleCount = safePatients.filter(p => p.sex === 0).length;
        const genderDist = [
            { name: "Male", value: maleCount },
            { name: "Female", value: femaleCount }
        ];

        // Calculate Age Dist from real patients
        const ageGroups = [
            { ageGroup: '< 30', count: 0 },
            { ageGroup: '30-39', count: 0 },
            { ageGroup: '40-49', count: 0 },
            { ageGroup: '50-59', count: 0 },
            { ageGroup: '60+', count: 0 }
        ];

        safePatients.forEach(p => {
            const age = parseInt(String(p.age));
            if (isNaN(age)) return; // Skip invalid ages

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
    }, [patients, stats]);

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
                <StatCard title="Total Patients" value={computedMetrics.total} icon={Users} color="bg-blue-500" />
                <StatCard title="Critical Cases" value={computedMetrics.critical} icon={AlertCircle} color="bg-red-500" />
                <StatCard title="Avg. Accuracy" value={computedMetrics.accuracy} icon={Activity} color="bg-green-500" />
                <StatCard title="Monthly Growth" value={computedMetrics.growth} icon={TrendingUp} color="bg-purple-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 dashboard-column">
                {/* Risk Distribution - Takes up full width */}
                <ErrorBoundary fallbackTitle="Chart Display Failed">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Patient Risk Distribution</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={stats.risk_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.risk_distribution.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </ErrorBoundary>
            </div>

            {/* Additional Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 dashboard-column">
                <ErrorBoundary fallbackTitle="Gender Chart Error">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GenderDistributionChart data={computedMetrics.genderDist} />
                    </motion.div>
                </ErrorBoundary>

                <ErrorBoundary fallbackTitle="Age Chart Error">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <AgeDistributionChart data={computedMetrics.ageGroups} />
                    </motion.div>
                </ErrorBoundary>
            </div>

            {/* Trends Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ErrorBoundary fallbackTitle="Assessment Trend Error">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <AssessmentTrendsChart data={stats.assessment_trends} />
                    </motion.div>
                </ErrorBoundary>

                <ErrorBoundary fallbackTitle="Risk Trend Error">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <RiskTrendsChart data={stats.risk_trends} />
                    </motion.div>
                </ErrorBoundary>
            </div>

            {/* Doctor Performance Chart - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <DoctorPerformanceChart data={stats.doctor_performance} />
            </motion.div>

            {/* 3D Monthly Analytics Chart - NEW! */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
            >
                <Monthly3DChart data={stats.monthly_stats || []} />
            </motion.div>

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
                            {stats.recent_activity.length > 0 ? (
                                stats.recent_activity.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#REC-{item.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="font-medium text-slate-900">{item.name}</div>
                                            <div className="text-xs">{item.age} yrs / {item.sex === 1 ? 'M' : 'F'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                                                item.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {item.risk_level} Risk
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.doctor}</td>
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
