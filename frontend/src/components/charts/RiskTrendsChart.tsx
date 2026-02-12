import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sanitizeArray } from '../../lib/utils';

interface RiskTrendData {
    date: string;
    low: number;
    medium: number;
    high: number;
}

interface RiskTrendsChartProps {
    data: RiskTrendData[];
}

const RiskTrendsChart = ({ data }: RiskTrendsChartProps) => {
    const validData = sanitizeArray(data);

    if (!validData.length) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Level Trends</h3>
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No trend data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Level Trends</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={validData}>
                        <defs>
                            <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{ value: 'Cases', angle: -90, position: 'insideLeft', fill: '#64748b', offset: 10 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend verticalAlign="top" align="right" />
                        <Area
                            type="monotone"
                            dataKey="low"
                            stackId="1"
                            stroke="#10b981"
                            fill="url(#colorLow)"
                            name="Low Risk"
                        />
                        <Area
                            type="monotone"
                            dataKey="medium"
                            stackId="1"
                            stroke="#f59e0b"
                            fill="url(#colorMedium)"
                            name="Medium Risk"
                        />
                        <Area
                            type="monotone"
                            dataKey="high"
                            stackId="1"
                            stroke="#ef4444"
                            fill="url(#colorHigh)"
                            name="High Risk"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RiskTrendsChart;
