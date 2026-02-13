import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalendarViewProps {
    assessmentMap: Record<string, number>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ assessmentMap }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Calculate full 42-day grid (6 rows x 7 cols)
    const generateGrid = () => {
        const days = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Add padding days from previous month
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                month: month - 1,
                year,
                isCurrentMonth: false
            });
        }

        // Add days of current month
        for (let i = 1; i <= numDays; i++) {
            days.push({
                day: i,
                month,
                year,
                isCurrentMonth: true
            });
        }

        // Add padding days from next month until we reach 42 days (6 rows)
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                month: month + 1,
                year,
                isCurrentMonth: false
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
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/5 transition-all duration-300 hover:shadow-primary-500/5 relative min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                        <CalendarIcon className="w-6 h-6 text-emerald-500" aria-hidden="true" />
                    </div>
                    Assessment Activity
                </h3>
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                    <button onClick={prevMonth} aria-label="Previous Month" className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all active:scale-90 shadow-sm">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] px-4 min-w-[140px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} aria-label="Next Month" className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all active:scale-90 shadow-sm">
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-3 flex-1 pb-4">
                {gridDays.map((item, idx) => {
                    const count = getCount(item.day, item.month, item.year);
                    const today = isToday(item.day, item.month, item.year);

                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedDay({ ...item, count })}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedDay({ ...item, count })}
                            role="button"
                            tabIndex={0}
                            className={cn(
                                "relative aspect-square rounded-2xl border transition-all duration-300 group cursor-pointer flex flex-col items-center justify-center",
                                today
                                    ? "bg-primary-600 border-primary-500 shadow-xl shadow-primary-600/20 z-10 scale-105"
                                    : item.isCurrentMonth
                                        ? "bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/5 hover:border-primary-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.06]"
                                        : "bg-slate-50/50 dark:bg-white/[0.01] border-slate-100 dark:border-white/[0.02] opacity-30",
                            )}
                        >
                            <span className={cn(
                                "text-sm font-black tracking-tight",
                                today ? "text-white" : item.isCurrentMonth ? "text-slate-900 dark:text-slate-200" : "text-slate-400"
                            )}>
                                {item.day}
                            </span>

                            {count > 0 && (
                                <div className="absolute bottom-2">
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        today ? "bg-white" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    )} />
                                </div>
                            )}

                            {/* Hover Badge */}
                            {count > 0 && !today && (
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-lg">
                                    {count}
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
