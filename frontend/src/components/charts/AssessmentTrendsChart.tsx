import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendData {
    date: string;
    assessments: number;
}

interface AssessmentTrendsChartProps {
    data: TrendData[];
}

const AssessmentTrendsChart = ({ data }: AssessmentTrendsChartProps) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Assessment Trends</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            label={{ value: 'Assessments', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
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
