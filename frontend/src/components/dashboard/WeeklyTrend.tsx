import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface WeeklyData {
    day: string;
    count: number;
}

interface WeeklyTrendProps {
    data: WeeklyData[];
}

const WeeklyTrend: React.FC<WeeklyTrendProps> = ({ data }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Weekly Assessment Trend
                </h3>
                <div className="text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full uppercase tracking-widest">
                    Current Week
                </div>
            </div>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                backgroundColor: '#fff',
                                padding: '12px'
                            }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WeeklyTrend;
