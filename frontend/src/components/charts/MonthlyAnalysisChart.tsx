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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TrendingUp } from 'lucide-react';
import { sanitizeChartData } from '../../lib/chart-utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface MonthlyData {
    month: string;
    assessments: number;
}

interface MonthlyAnalysisChartProps {
    data: MonthlyData[];
}

const MonthlyAnalysisChart = ({ data }: MonthlyAnalysisChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Analysis</h3>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <TrendingUp className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">No monthly data available</p>
                </div>
            </div>
        );
    }

    const sanitized = sanitizeChartData(data);

    const chartData = {
        labels: sanitized.map(d => d.month || ''),
        datasets: [{
            label: 'Monthly Assessments',
            data: sanitized.map(d => d.assessments || 0),
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
                gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.6)');
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
                return gradient;
            },
            borderRadius: {
                topLeft: 12,
                topRight: 12
            },
            borderWidth: 2,
            borderColor: '#6366f1',
            hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
            shadowOffsetX: 4,
            shadowOffsetY: 4,
            shadowBlur: 10,
            shadowColor: 'rgba(99, 102, 241, 0.4)'
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500,
            easing: 'easeInOutCubic' as const,
            delay: (context: any) => context.dataIndex * 100
        },
        interaction: {
            intersect: false,
            mode: 'index' as const
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: 16,
                cornerRadius: 8,
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: '#6366f1',
                borderWidth: 1,
                displayColors: false,
                titleFont: {
                    size: 14,
                    weight: 'bold' as const
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: (context: any) => `Assessments: ${context.parsed.y}`,
                    afterLabel: (context: any) => {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                        return `${percentage}% of total`;
                    }
                }
            },
            datalabels: {
                display: (context: any) => context.dataset.data[context.dataIndex] > 0,
                anchor: 'end' as const,
                align: 'top' as const,
                offset: 8,
                color: '#6366f1',
                font: {
                    size: 13,
                    weight: 'bold' as const
                },
                formatter: (value: number) => value,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 6,
                padding: {
                    top: 4,
                    bottom: 4,
                    left: 8,
                    right: 8
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 11
                    }
                },
                border: {
                    color: '#e2e8f0'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(226, 232, 240, 0.5)',
                    drawTicks: false
                },
                ticks: {
                    stepSize: 1,
                    precision: 0,
                    color: '#64748b',
                    font: {
                        size: 11
                    },
                    padding: 8
                },
                border: {
                    display: false
                }
            }
        },
        onHover: (event: any, activeElements: any[]) => {
            (event.native.target as HTMLElement).style.cursor = activeElements.length ? 'pointer' : 'default';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 dashboard-column">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Monthly Analysis (Last 12 Months)
            </h3>
            <div
                className="monthly-chart-wrapper"
                style={{
                    width: '100%',
                    height: '350px',
                    minHeight: '350px',
                    minWidth: 0,
                    perspective: '1000px'
                }}
            >
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default MonthlyAnalysisChart;
