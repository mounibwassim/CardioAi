import React from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from 'recharts';

interface RiskDistributionProps {
    data: any[];
}

const COLORS = {
    'Low': '#10b981',
    'Medium': '#f59e0b',
    'High': '#f43f5e',
    'Critical': '#881337',
    'Unknown': '#94a3b8'
};

const RiskDistribution = ({ data }: RiskDistributionProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 transition-all duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
                <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
                Risk Distribution
            </h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            isAnimationActive={false}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Unknown}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default React.memo(RiskDistribution);
