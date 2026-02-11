import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Users, AlertCircle, Activity, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock Data Structure
const monthlyData = {
    2024: [
        { name: 'Jan', assessments: 45 }, { name: 'Feb', assessments: 52 },
        { name: 'Mar', assessments: 48 }, { name: 'Apr', assessments: 61 },
        { name: 'May', assessments: 55 }, { name: 'Jun', assessments: 67 },
        { name: 'Jul', assessments: 72 }, { name: 'Aug', assessments: 65 },
        { name: 'Sep', assessments: 59 }, { name: 'Oct', assessments: 80 },
        { name: 'Nov', assessments: 85 }, { name: 'Dec', assessments: 91 },
    ],
    2025: [
        { name: 'Jan', assessments: 88 }, { name: 'Feb', assessments: 95 },
        { name: 'Mar', assessments: 110 }, { name: 'Apr', assessments: 0 },
        { name: 'May', assessments: 0 }, { name: 'Jun', assessments: 0 },
        { name: 'Jul', assessments: 0 }, { name: 'Aug', assessments: 0 },
        { name: 'Sep', assessments: 0 }, { name: 'Oct', assessments: 0 },
        { name: 'Nov', assessments: 0 }, { name: 'Dec', assessments: 0 },
    ],
    2023: [
        { name: 'Jan', assessments: 10 }, { name: 'Feb', assessments: 15 },
        { name: 'Mar', assessments: 20 }, { name: 'Apr', assessments: 25 },
        { name: 'May', assessments: 30 }, { name: 'Jun', assessments: 35 },
        { name: 'Jul', assessments: 40 }, { name: 'Aug', assessments: 42 },
        { name: 'Sep', assessments: 38 }, { name: 'Oct', assessments: 45 },
        { name: 'Nov', assessments: 50 }, { name: 'Dec', assessments: 48 },
    ]
};

const riskData = [
    { name: 'Low Risk', value: 65 },
    { name: 'Medium Risk', value: 25 },
    { name: 'High Risk', value: 10 },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// Blood Flow Particles Component
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
    const [year, setYear] = useState(2025);
    const currentData = monthlyData[year as keyof typeof monthlyData] || monthlyData[2024];

    const handlePrevYear = () => setYear(prev => prev > 2023 ? prev - 1 : prev);
    const handleNextYear = () => setYear(prev => prev < 2025 ? prev + 1 : prev);

    const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
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
            {/* Header Section with improved spacing and 3D Visual */}
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
                    <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-white">System Live</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Patients" value="1,245" icon={Users} color="bg-blue-500" />
                <StatCard title="Critical Cases" value="42" icon={AlertCircle} color="bg-red-500" />
                <StatCard title="Avg. Accuracy" value="98.5%" icon={Activity} color="bg-green-500" />
                <StatCard title="Monthly Growth" value="+12.5%" icon={TrendingUp} color="bg-purple-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart - Takes up 2 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Assessment Volume</h3>
                        <div className="flex items-center space-x-4 bg-slate-50 rounded-lg p-1">
                            <button onClick={handlePrevYear} className="p-1 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-slate-900 shadow-sm">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="font-semibold text-slate-900 w-12 text-center">{year}</span>
                            <button onClick={handleNextYear} className="p-1 hover:bg-white rounded-md transition-colors text-slate-500 hover:text-slate-900 shadow-sm">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f1f5f9' }}
                                />
                                <Bar dataKey="assessments" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Risk Distribution - Takes up 1 column */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col"
                >
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Risk Distribution</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskData.map((_, index) => (
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
                <div className="px-6 py-5 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Recent Patient Assessments</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Demographics</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#P-2024-{100 + i}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Feb {10 + i}, 2025</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{45 + i} yrs / {i % 2 === 0 ? 'M' : 'F'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full",
                                            i % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        )}>
                                            {i % 2 === 0 ? 'Low Risk' : 'Medium Risk'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Dr. Sarah Chen</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
