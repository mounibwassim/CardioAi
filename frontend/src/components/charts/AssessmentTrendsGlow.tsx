import { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { guardNaN } from '../../lib/3d-utils';

interface TrendData {
    date: string;
    assessments: number;
}

interface AssessmentTrendsGlowProps {
    data: TrendData[];
}

const AssessmentTrendsGlow = ({ data }: AssessmentTrendsGlowProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [pathLength, setPathLength] = useState(0);

    const safeData = useMemo(() => (data || []).filter((d: any) =>
        d && typeof d === 'object' && d.date && typeof d.assessments === 'number'
    ), [data]);

    if (safeData.length === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-xl shadow-sm border border-slate-700 h-96 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4">Assessment Trends</h3>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
                    <TrendingUp className="w-12 h-12 text-slate-500 mb-2" />
                    <p className="text-slate-400 text-sm">No assessment trend data available</p>
                </div>
            </div>
        );
    }

    const width = 800;
    const height = 350;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };

    // Calculate scales
    const maxValue = Math.max(...safeData.map(d => d.assessments), 1);

    const xScale = (index: number) =>
        padding.left + guardNaN((index / (safeData.length - 1 || 1)) * (width - padding.left - padding.right));

    const yScale = (value: number) =>
        height - padding.bottom - guardNaN(((value / maxValue) * (height - padding.top - padding.bottom)));

    // Generate smooth curve path (Catmull-Rom spline approximation)
    const linePath = useMemo(() => {
        if (safeData.length === 0) return '';

        let path = `M ${xScale(0)} ${yScale(safeData[0].assessments)} `;

        for (let i = 0; i < safeData.length - 1; i++) {
            const x1 = xScale(i);
            const y1 = yScale(safeData[i].assessments);
            const x2 = xScale(i + 1);
            const y2 = yScale(safeData[i + 1].assessments);

            // Control points for smooth curve
            const cp1x = x1 + (x2 - x1) / 3;
            const cp1y = y1;
            const cp2x = x2 - (x2 - x1) / 3;
            const cp1y2 = y2; // Use y2 for second control point to smooth transition

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp1y2}, ${x2} ${y2} `;
        }

        return path;
    }, [safeData, maxValue]);

    // Generate area path (for gradient fill)
    const areaPath = useMemo(() => {
        if (!linePath) return '';

        const lastX = xScale(safeData.length - 1);
        const firstX = xScale(0);

        return `${linePath} L ${lastX} ${height - padding.bottom} L ${firstX} ${height - padding.bottom} Z`;
    }, [linePath, safeData]);

    // Calculate path length for animation
    useEffect(() => {
        if (svgRef.current) {
            const pathElement = svgRef.current.querySelector('.trend-line') as SVGPathElement;
            if (pathElement) {
                setPathLength(pathElement.getTotalLength());
            }
        }
    }, [linePath]);

    return (
        <motion.div
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-xl shadow-2xl border border-slate-700 relative overflow-hidden h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 bg-[length:200%_100%] animate-[gradient-shift_8s_ease_infinite]" />

            {/* Header */}
            <div className="relative z-10 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Assessment Trends
                </h3>
                <p className="text-sm text-slate-400">Smooth gradient visualization</p>
            </div>

            {/* SVG Chart */}
            <div className="relative z-10">
                <svg ref={svgRef} width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                    {/* Gradient Definitions */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
                        </linearGradient>

                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>

                        {/* Glow Filter */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 1, 2, 3, 4].map(i => {
                        const y = padding.top + (i / 4) * (height - padding.top - padding.bottom);
                        return (
                            <line
                                key={i}
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="4,4"
                                opacity="0.3"
                            />
                        );
                    })}

                    {/* Area Fill */}
                    <motion.path
                        d={areaPath}
                        fill="url(#areaGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    />

                    {/* Glowing Line */}
                    <motion.path
                        className="trend-line"
                        d={linePath}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        filter="url(#glow)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
                        animate={{ strokeDashoffset: 2000 - pathLength }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />

                    {/* Data Points */}
                    {safeData.map((d, i) => (
                        <g key={i}>
                            <motion.circle
                                cx={xScale(i)}
                                cy={yScale(d.assessments)}
                                r="5"
                                fill="#6366f1"
                                stroke="#fff"
                                strokeWidth="2"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                                className="cursor-pointer hover:r-7 transition-all"
                            />
                            {/* Pulsing Effect */}
                            <circle
                                cx={xScale(i)}
                                cy={yScale(d.assessments)}
                                r="5"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2"
                                opacity="0.6"
                            >
                                <animate
                                    attributeName="r"
                                    from="5"
                                    to="15"
                                    dur="2s"
                                    begin={`${i * 0.2}s`}
                                    repeatCount="indefinite"
                                />
                                <animate
                                    attributeName="opacity"
                                    from="0.6"
                                    to="0"
                                    dur="2s"
                                    begin={`${i * 0.2}s`}
                                    repeatCount="indefinite"
                                />
                            </circle>
                        </g>
                    ))}

                    {/* X-Axis Labels */}
                    {safeData.map((d, i) => (
                        i % Math.ceil(safeData.length / 6) === 0 && (
                            <text
                                key={i}
                                x={xScale(i)}
                                y={height - padding.bottom + 20}
                                fill="#94a3b8"
                                fontSize="12"
                                textAnchor="middle"
                            >
                                {new Date(d.date).toLocaleDateString('en-MY', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </text>
                        )
                    ))}

                    {/* Y-Axis Labels */}
                    {[0, 1, 2, 3, 4].map(i => {
                        const value = Math.round((maxValue / 4) * (4 - i));
                        const y = padding.top + (i / 4) * (height - padding.top - padding.bottom);
                        return (
                            <text
                                key={i}
                                x={padding.left - 10}
                                y={y + 5}
                                fill="#94a3b8"
                                fontSize="12"
                                textAnchor="end"
                            >
                                {value}
                            </text>
                        );
                    })}
                </svg>
            </div>
        </motion.div>
    );
};

export default AssessmentTrendsGlow;
