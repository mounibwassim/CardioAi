import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { safeDoughnutData, chartOptions } from '../../lib/chart-utils';
import { PieChartIcon } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskDistributionData {
    name: string;
    value: number;
}

interface RiskDistributionChartProps {
    data: RiskDistributionData[];
}

const RiskDistributionChart = ({ data }: RiskDistributionChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Patient Risk Distribution</h3>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <PieChartIcon className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">No risk distribution data available</p>
                </div>
            </div>
        );
    }

    const chartData = safeDoughnutData(data);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Patient Risk Distribution</h3>
            <div className="chart-wrapper" style={{ width: '100%', height: '350px', minHeight: '350px', minWidth: 0 }}>
                <Doughnut data={chartData} options={chartOptions.doughnut} />
            </div>
        </div>
    );
};

export default RiskDistributionChart;
