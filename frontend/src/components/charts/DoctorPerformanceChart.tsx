import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DoctorPerformanceData {
    doctor: string;
    patients: number;
    criticalCases: number;
}

interface DoctorPerformanceChartProps {
    data: DoctorPerformanceData[];
}

const DoctorPerformanceChart = ({ data }: DoctorPerformanceChartProps) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Doctor Performance</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="doctor"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            angle={-15}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="patients" fill="#1FB6B3" name="Total Patients" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="criticalCases" fill="#ef4444" name="Critical Cases" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DoctorPerformanceChart;
