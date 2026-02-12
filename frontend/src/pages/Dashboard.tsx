import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Users, AlertCircle, Activity, TrendingUp, ChevronLeft, ChevronRight, Plus, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { getDashboardStats, resetSystem } from '../lib/api';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// Blood Flow Particles Component (Unchanged)
const BloodParticles = () => {
    const count = 50;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mesh = useRef<any>(null);
    const dummy = new THREE.Object3D();
    const particles = useRef(new Array(count).fill(0).map(() => ({
        position: [Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 10 - 10],
        speed: Math.random() * 0.05 + 0.02,
        scale: Math.random() * 0.3 + 0.1
    })));

    useFrame(() => {
        if (!mesh.current) return;
        particles.current.forEach((particle, i) => {
            particle.position[0] += particle.speed;
            if (particle.position[0] > 10) particle.position[0] = -10;

            dummy.position.set(particle.position[0], particle.position[1], particle.position[2] as number);
            dummy.scale.set(particle.scale, particle.scale, particle.scale);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#ef4444" transparent opacity={0.4} roughness={0.5} />
        </instancedMesh>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        total_patients: 0,
        critical_cases: 0,
        avg_accuracy: "98.5%",
        monthly_growth: "+12.5%",
        recent_activity: [],
        risk_distribution: [
            { name: "Low Risk", value: 0 },
            { name: "Medium Risk", value: 0 },
            { name: "High Risk", value: 0 }
        ]
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSystem = async () => {
        if (confirm("WARNING: This will delete ALL data (patients, records, feedbacks). Are you sure?")) {
            try {
                await resetSystem();
                await fetchStats(); // Refresh to show 0s
                alert("System has been reset.");
            } catch (error) {
                alert("Failed to reset system.");
            }
        }
    };

    const handleAddPatient = () => {
        navigate('/doctor/patients');
    };

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

    return (
        <div className="space-y-10 py-8">
            {/* Header Section */}
            <div className="relative bg-slate-900 rounded-2xl p-8 overflow-hidden mb-8">
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} color="#ef4444" />
                        <BloodParticles />
                    </Canvas>
                </div>

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
                            onClick={handleResetSystem}
                            className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-100 px-4 py-2 rounded-lg backdrop-blur-md border border-red-500/30 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Reset System</span>
                        </button>

                        <button
                            onClick={handleAddPatient}
                            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg shadow-primary-500/20 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Patient</span>
                        </button>

                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium text-white">System Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Patients" value={stats.total_patients} icon={Users} color="bg-blue-500" />
                <StatCard title="Critical Cases" value={stats.critical_cases} icon={AlertCircle} color="bg-red-500" />
                <StatCard title="Avg. Accuracy" value={stats.avg_accuracy} icon={Activity} color="bg-green-500" />
                <StatCard title="Monthly Growth" value={stats.monthly_growth} icon={TrendingUp} color="bg-purple-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Risk Distribution - Takes up 1 column (Expanded to full width if no history for now) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Patient Risk Distribution</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
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
                                    {stats.risk_distribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Recent Patient Assessments</h3>
                    <button onClick={fetchStats} className="text-slate-400 hover:text-primary-600 transition-colors">
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
                                            <span className={cn(
                                                "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                item.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                                                    item.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                            )}>
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
