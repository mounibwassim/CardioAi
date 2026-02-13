import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

interface AccuracyData {
    timestamp: string;
    accuracy: number;
}

interface ModelAccuracyProps {
    data: AccuracyData[];
}

const ModelAccuracy: React.FC<ModelAccuracyProps> = ({ data }) => {
    // LOCK: If no data points, or if current average is missing, force 0.0%
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Global Model Accuracy
                </h3>
                <div className="text-xl font-mono font-bold text-emerald-500">
                    {hasData ? `${data[data.length - 1].accuracy.toFixed(1)}%` : '0.0%'}
                </div>
            </div>

            <div className="flex-1 min-h-[300px]">
                {!hasData ? (
                    <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-400 font-medium italic">No performance data recorded</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="timestamp"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                                domain={[90, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    color: '#f8fafc',
                                    padding: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Line
                                type="stepAfter"
                                dataKey="accuracy"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default ModelAccuracy;
