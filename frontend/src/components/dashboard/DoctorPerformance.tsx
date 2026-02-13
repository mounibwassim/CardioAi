import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Briefcase } from 'lucide-react';

interface DoctorData {
    name: string;
    count: number;
    color: string;
}

interface DoctorPerformanceProps {
    data: DoctorData[];
}

const COLOR_MAP: Record<string, string[]> = {
    blue: ['#3b82f6', '#1d4ed8'],
    purple: ['#a855f7', '#7e22ce'],
    emerald: ['#10b981', '#047857']
};

const DoctorPerformance: React.FC<DoctorPerformanceProps> = ({ data }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl group" role="region" aria-label="Doctor Assessment Performance">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                    Doctor Performance
                </h3>
            </div>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {data.map((doc) => (
                                <linearGradient key={`grad-${doc.color}`} id={`grad-${doc.color}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={COLOR_MAP[doc.color][0]} stopOpacity={1} />
                                    <stop offset="100%" stopColor={COLOR_MAP[doc.color][1]} stopOpacity={0.8} />
                                </linearGradient>
                            ))}
                            <filter id="shadow" height="130%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                <feOffset dx="2" dy="4" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.3" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{payload[0].payload.name}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_MAP[payload[0].payload.color][0] }} />
                                                <span className="text-sm font-bold text-white">{payload[0].value} Assessments</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[8, 8, 0, 0]}
                            isAnimationActive={false}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#grad-${entry.color})`}
                                    filter="url(#shadow)"
                                    className="cursor-pointer hover:opacity-95 transition-all duration-300"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DoctorPerformance;
