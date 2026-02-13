import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MonthlyData {
    month: string;
    count: number;
    high_risk: number;
}

interface MonthlyTrendProps {
    data: MonthlyData[];
}

const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ data }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Monthly Growth Distribution
                </h3>
            </div>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                            </linearGradient>
                            <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                                <stop offset="95%" stopColor="#7f1d1d" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                            allowDecimals={false}
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
                            cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                        />
                        <Bar
                            dataKey="count"
                            name="Assessments"
                            fill="url(#colorCount)"
                            radius={[6, 6, 0, 0]}
                            isAnimationActive={false}
                        />
                        <Bar
                            dataKey="high_risk"
                            name="High Risk"
                            fill="url(#colorHighRisk)"
                            radius={[6, 6, 0, 0]}
                            isAnimationActive={false}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlyTrend;
