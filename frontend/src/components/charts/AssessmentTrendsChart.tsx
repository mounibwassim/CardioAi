import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { safeLineData, chartOptions } from '../../lib/chart-utils';
import { TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface TrendData {
    date: string;
    assessments: number;
}

interface AssessmentTrendsChartProps {
    data: TrendData[];
}

const AssessmentTrendsChart = ({ data }: AssessmentTrendsChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Assessment Trends</h3>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <TrendingUp className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">No assessment trend data available</p>
                </div>
            </div>
        );
    }

    const chartData = safeLineData(data, 'Total Assessments');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Assessment Trends</h3>
            <div className="chart-wrapper" style={{ width: '100%', height: '350px', minHeight: '350px', minWidth: 0 }}>
                <Line data={chartData} options={chartOptions.line} />
            </div>
        </div>
    );
};

export default AssessmentTrendsChart;
