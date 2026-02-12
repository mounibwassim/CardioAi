import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { safeStackedBarData, chartOptions } from '../../lib/chart-utils';
import { Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Level Trends</h3>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Activity className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">No trend data available</p>
                </div>
            </div>
        );
    }

    const chartData = safeStackedBarData(data);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Risk Level Trends</h3>
            <div className="chart-wrapper" style={{ width: '100%', height: '350px', minHeight: '350px', minWidth: 0 }}>
                <Bar data={chartData} options={chartOptions.stackedBar} />
            </div>
        </div>
    );
};

export default RiskTrendsChart;
