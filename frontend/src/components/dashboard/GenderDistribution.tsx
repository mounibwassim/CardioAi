import React, { useMemo } from 'react';
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
    const normalizedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            value: Math.round(item.value)
        }));
    }, [data]);

    const total = normalizedData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2x border border-white/5 h-full flex flex-col transition-all duration-300 hover:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" />
                Gender Analysis
            </h3>

            <div className="flex-1 min-h-[300px] relative">
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Patients</span>
                    <span className="text-3xl font-mono font-bold text-white">{total}</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#020617',
                                border: '1px solid #1e293b',
                                borderRadius: '12px',
                                color: '#f8fafc',
                                padding: '12px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                        <Pie
                            data={normalizedData}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={105}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={2}
                            isAnimationActive={true}
                        >
                            {normalizedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'}
                                    style={{
                                        filter: `drop-shadow(0 0 15px ${COLORS[entry.name as keyof typeof COLORS]}44)`,
                                    }}
                                    className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value) => <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-2">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GenderDistribution;
