import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Users } from 'lucide-react';

interface GenderData {
    name: string;
    value: number;
}

interface GenderDistributionProps {
    data: GenderData[];
}

const COLORS = {
    Male: '#3b82f6',   // Blue
    Female: '#ec4899', // Pink
    Other: '#a855f7'   // Purple
};

const GenderDistribution: React.FC<GenderDistributionProps> = ({ data }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" />
                Gender Analysis
            </h3>

            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={false}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'}
                                    className="filter hover:brightness-110 transition-all duration-300"
                                />
                            ))}
                        </Pie>
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
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 ml-2">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GenderDistribution;
