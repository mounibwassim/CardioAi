import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sanitizeArray } from '../../lib/utils';

interface AgeData {
    ageGroup: string;
    count: number;
}

interface AgeDistributionChartProps {
    data: AgeData[];
}

const AgeDistributionChart = ({ data }: AgeDistributionChartProps) => {
    const validData = sanitizeArray(data);

    if (!validData.length) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Age Distribution</h3>
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No age distribution data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Age Distribution</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="ageGroup"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{ value: 'Patients', angle: -90, position: 'insideLeft', fill: '#64748b', offset: 10 }}
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
                        <Bar dataKey="count" fill="#8b5cf6" name="Patients" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AgeDistributionChart;
