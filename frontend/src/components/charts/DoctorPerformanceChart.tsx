import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { sanitizeArray } from '../../lib/utils';

interface DoctorPerformanceData {
    doctor: string;
    patients: number;
    criticalCases: number;
}

interface DoctorPerformanceChartProps {
    data: DoctorPerformanceData[];
}

const DoctorPerformanceChart = ({ data }: DoctorPerformanceChartProps) => {
    const validData = sanitizeArray(data);

    if (!validData.length) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Doctor Performance</h3>
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No doctor performance data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column w-full lg:col-span-3">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Doctor Performance Overview</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={validData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="doctor"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            angle={-15}
                            textAnchor="end"
                            height={60}
                            axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                            label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#64748b', offset: 10 }}
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
                        <Bar dataKey="patients" fill="#1FB6B3" name="Total Patients" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="criticalCases" fill="#ef4444" name="Critical Cases" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DoctorPerformanceChart;
