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
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl group">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-500" />
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
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
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                color: '#f8fafc',
                                padding: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Bar
                            dataKey="count"
                            radius={[8, 8, 0, 0]}
                            isAnimationActive={false}
                            className="transition-transform duration-300"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#grad-${entry.color})`}
                                    filter="url(#shadow)"
                                    className="cursor-pointer hover:opacity-90 transition-all duration-300"
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
