/**
 * Chart Data Sanitization and Formatting Utilities
 * Prevents NaN, Infinity, and undefined crashes in Chart.js
 */

export const sanitizeNumber = (val: any): number => {
    const num = Number(val);
    return typeof num === 'number' && isFinite(num) && !isNaN(num) ? num : 0;
};

export const sanitizeChartData = (data: any[]): any[] => {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
        ...item,
        value: sanitizeNumber(item?.value),
        count: sanitizeNumber(item?.count),
        assessments: sanitizeNumber(item?.assessments),
        patients: sanitizeNumber(item?.patients),
        criticalCases: sanitizeNumber(item?.criticalCases),
        low: sanitizeNumber(item?.low),
        medium: sanitizeNumber(item?.medium),
        high: sanitizeNumber(item?.high)
    }));
};

export const safeDoughnutData = (data: any[], labels?: string[]) => {
    const sanitized = sanitizeChartData(data);

    return {
        labels: labels || sanitized.map(d => d.name || 'Unknown'),
        datasets: [{
            data: sanitized.map(d => d.value || d.count || 0),
            backgroundColor: [
                '#16a34a', // green-600 (Low)
                '#ca8a04', // yellow-600 (Medium)
                '#dc2626'  // red-600 (High)
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
};

export const safeLineData = (data: any[], label: string = 'Data') => {
    const sanitized = sanitizeChartData(data);

    return {
        labels: sanitized.map(d => d.date || d.label || ''),
        datasets: [{
            label,
            data: sanitized.map(d => d.assessments || d.value || d.count || 0),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };
};

export const safeStackedBarData = (data: any[]) => {
    const sanitized = sanitizeChartData(data);

    return {
        labels: sanitized.map(d => d.date || d.label || ''),
        datasets: [
            {
                label: 'Low Risk',
                data: sanitized.map(d => d.low || 0),
                backgroundColor: '#16a34a'
            },
            {
                label: 'Medium Risk',
                data: sanitized.map(d => d.medium || 0),
                backgroundColor: '#ca8a04'
            },
            {
                label: 'High Risk',
                data: sanitized.map(d => d.high || 0),
                backgroundColor: '#dc2626'
            }
        ]
    };
};

export const safeHorizontalBarData = (data: any[]) => {
    const sanitized = sanitizeChartData(data);

    return {
        labels: sanitized.map(d => d.doctor || d.name || 'Unknown'),
        datasets: [{
            label: 'Patients',
            data: sanitized.map(d => d.patients || d.count || 0),
            backgroundColor: '#6366f1',
            borderRadius: 6
        }]
    };
};

export const chartOptions = {
    doughnut: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 15,
                    font: { size: 12 }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    },
    line: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index' as const
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.y} assessments`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            }
        }
    },
    stackedBar: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index' as const
        },
        plugins: {
            legend: {
                position: 'top' as const
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.dataset.label}: ${context.parsed.y} patients`
                }
            }
        },
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            }
        }
    },
    horizontalBar: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.parsed.x} patients`
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    stepSize: 5,
                    precision: 0
                }
            }
        }
    }
};
