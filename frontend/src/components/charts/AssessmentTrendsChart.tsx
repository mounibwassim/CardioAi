import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sanitizeArray } from '../../lib/utils';

interface TrendData {
    date: string;
    assessments: number;
}

interface AssessmentTrendsChartProps {
    data: TrendData[];
}

const AssessmentTrendsChart = ({ data }: AssessmentTrendsChartProps) => {
    const validData = sanitizeArray(data);

    if (!validData.length) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Assessment Trends</h3>
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No assessment trend data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Assessment Trends</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{ value: 'Assessments', angle: -90, position: 'insideLeft', fill: '#64748b', offset: 10 }}
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
                        <Line
                            type="monotone"
                            dataKey="assessments"
                            stroke="#0F4C81"
                            strokeWidth={3}
                            dot={{ fill: '#0F4C81', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Total Assessments"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AssessmentTrendsChart;
