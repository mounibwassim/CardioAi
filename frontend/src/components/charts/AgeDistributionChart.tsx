import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AgeData {
    ageGroup: string;
    count: number;
}

interface AgeDistributionChartProps {
    data: AgeData[];
}

const AgeDistributionChart = ({ data }: AgeDistributionChartProps) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Age Distribution</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="ageGroup"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            label={{ value: 'Patients', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Patients" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AgeDistributionChart;
