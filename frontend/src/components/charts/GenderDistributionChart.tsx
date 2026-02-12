import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { sanitizeArray } from '../../lib/utils';

interface GenderData {
    name: string;
    value: number;
}

interface GenderDistributionChartProps {
    data: GenderData[];
}

const COLORS = ['#3f83f8', '#ec4899']; // Blue for Male, Pink for Female

const GenderDistributionChart = ({ data }: GenderDistributionChartProps) => {
    // Ensure all values are valid numbers and data is non-empty
    const validData = sanitizeArray(data).filter(d => d.value > 0);

    if (!validData.length) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Gender Distribution</h3>
                <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No gender data available for analysis</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Gender Distribution</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={validData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => {
                                const percent = entry.percent || 0;
                                return `${entry.name}: ${(percent * 100).toFixed(0)}%`;
                            }}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {validData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GenderDistributionChart;
