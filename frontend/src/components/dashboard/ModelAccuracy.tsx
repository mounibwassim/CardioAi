import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { ShieldCheck } from 'lucide-react';

interface AccuracyData {
    timestamp: string;
    accuracy: number;
}

interface ModelAccuracyProps {
    data: AccuracyData[];
}

const ModelAccuracy: React.FC<ModelAccuracyProps> = ({ data }) => {
    const hasData = data && data.length > 0;
    const currentAccuracy = hasData ? data[data.length - 1].accuracy : 0;

    const chartData = [
        { name: 'Accuracy', value: currentAccuracy },
        { name: 'Remaining', value: 100 - currentAccuracy }
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl group overflow-hidden relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Model Confidence Ring
                </h3>
            </div>

            <div className="flex-1 min-h-[300px] relative flex items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            <linearGradient id="ringGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={105}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={false}
                        >
                            <Cell
                                fill="url(#ringGradient)"
                                filter="url(#ringGlow)"
                                className="drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            />
                            <Cell fill="#f1f5f9" className="dark:fill-slate-900" opacity={0.3} />
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                color: '#f8fafc',
                                padding: '12px'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Stats */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <p className="text-4xl font-mono font-black text-emerald-500 drop-shadow-sm">
                        {currentAccuracy.toFixed(1)}%
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                        CONFIDENCE
                    </p>
                </div>
            </div>

            {/* Subtitle */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Verification</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">UNIT-CONF-ALPHA</span>
            </div>
        </div>
    );
};

export default ModelAccuracy;
