import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GenderData {
    name: string;
    value: number;
}

interface GenderDistributionChartProps {
    data: GenderData[];
}

const COLORS = ['#3b82f6', '#ec4899']; // Blue for Male, Pink for Female

const GenderDistributionChart = ({ data }: GenderDistributionChartProps) => {
    // Data validation to prevent NaN and rendering issues
    if (!data || data.length === 0 || data.every(d => !d.value || d.value === 0)) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Gender Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                    <p className="text-slate-400">No data available</p>
                </div>
            </div>
        );
    }

    // Ensure all values are valid numbers
    const validData = data.map(d => ({
        ...d,
        value: Number(d.value) || 0
    })).filter(d => d.value > 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Gender Distribution</h3>
            <div className="h-64" style={{ minHeight: '256px', minWidth: '0' }}>
                <ResponsiveContainer width="100%" height="100%">
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
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {validData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default GenderDistributionChart;
