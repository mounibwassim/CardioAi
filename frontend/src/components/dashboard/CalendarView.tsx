import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalendarViewProps {
    assessmentMap: Record<string, number>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ assessmentMap }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const numDays = daysInMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Calculate days for current month with correct alignment
    const generateGrid = () => {
        const days = [];
        const firstDayIdx = new Date(year, month, 1).getDay();

        // Add padding days for alignment
        for (let p = 0; p < firstDayIdx; p++) {
            days.push({ day: null, month, year, isCurrentMonth: false });
        }

        for (let i = 1; i <= numDays; i++) {
            days.push({
                day: i,
                month,
                year,
                isCurrentMonth: true
            });
        }
        return days;
    };

    const gridDays = generateGrid();

    const isToday = (day: number, m: number, y: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === m && today.getFullYear() === y;
    };

    const getCount = (day: number, m: number, y: number) => {
        const dateObj = new Date(y, m, day);
        const yStr = dateObj.getFullYear();
        const mStr = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const dStr = dateObj.getDate().toString().padStart(2, '0');
        const key = `${yStr}-${mStr}-${dStr}`;
        return assessmentMap[key] || 0;
    };

    const [selectedDay, setSelectedDay] = useState<{ day: number, count: number, month: number, year: number } | null>(null);

    return (
        <div className="bg-white dark:bg-slate-900/50 p-4 rounded-3xl shadow-xl border border-slate-200 dark:border-white/5 transition-all duration-300 hover:shadow-primary-500/5 relative max-w-md text-sm flex flex-col mx-auto lg:mx-0">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tighter">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    </div>
                    Activity
                </h3>
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                    <button onClick={prevMonth} aria-label="Previous Month" className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all active:scale-90">
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em] px-2 min-w-[100px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} aria-label="Next Month" className="p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-all active:scale-90">
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1 pb-2">
                {gridDays.map((item, idx) => {
                    if (item.day === null) {
                        return <div key={`empty-${idx}`} className="aspect-square" />;
                    }

                    const count = getCount(item.day, item.month, item.year);
                    const today = isToday(item.day, item.month, item.year);

                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedDay({ day: item.day as number, count, month: item.month, year: item.year })}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedDay({ day: item.day as number, count, month: item.month, year: item.year })}
                            role="button"
                            tabIndex={0}
                            className={cn(
                                "relative aspect-square rounded-xl border transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center p-1",
                                today
                                    ? "bg-primary-600 border-primary-500 shadow-lg shadow-primary-600/20 z-10 scale-105"
                                    : "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/5 hover:border-primary-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.06]"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-medium",
                                today ? "text-white" : "text-slate-800 dark:text-slate-200"
                            )}>
                                {item.day}
                            </span>

                            {count > 0 && (
                                <div className="absolute bottom-1">
                                    <div className={cn(
                                        "h-1 w-1 rounded-full",
                                        today ? "bg-white" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    )} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Day Details Modal Overlay */}
            {selectedDay && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm rounded-2xl" onClick={() => setSelectedDay(null)} />
                    <div className="relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-white/10 w-full max-w-[200px] animate-in zoom-in-95 duration-200">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                            {currentDate.toLocaleString('default', { month: 'short' })} {selectedDay.day}
                        </p>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                            {selectedDay.count}
                        </h4>
                        <p className="text-xs text-slate-400 mt-2">Assessments Filed</p>
                        <button
                            onClick={() => setSelectedDay(null)}
                            className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold transition-colors"
                        >
                            CLOSE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
