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

    const days = Array.from({ length: numDays }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const getCount = (day: number) => {
        const d = day < 10 ? `0${day}` : `${day}`;
        const m = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
        const key = `${year}-${m}-${d}`;
        return assessmentMap[key] || 0;
    };

    const [selectedDay, setSelectedDay] = useState<{ day: number, count: number } | null>(null);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                    Assessment Calendar
                </h3>
                <div className="flex items-center space-x-4">
                    <button onClick={prevMonth} aria-label="Previous Month" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} aria-label="Next Month" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1">
                {blanks.map(i => (
                    <div key={`blank-${i}`} className="aspect-square" aria-hidden="true" />
                ))}
                {days.map(day => {
                    const count = getCount(day);
                    return (
                        <div
                            key={day}
                            onClick={() => setSelectedDay({ day, count })}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedDay({ day, count })}
                            role="button"
                            tabIndex={0}
                            aria-label={`${currentDate.toLocaleString('default', { month: 'long' })} ${day}: ${count} assessments`}
                            className={cn(
                                "relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer",
                                isToday(day)
                                    ? "bg-primary-500 dark:bg-primary-600 border-primary-500 shadow-md shadow-primary-500/30 scale-105 z-10"
                                    : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-primary-400",
                            )}
                        >
                            <span className={cn(
                                "text-sm font-bold",
                                isToday(day) ? "text-white" : "text-slate-600 dark:text-slate-400"
                            )}>
                                {day}
                            </span>
                            {count > 0 && (
                                <div className="mt-1">
                                    <span className={cn(
                                        "flex h-1.5 w-1.5 rounded-full",
                                        isToday(day) ? "bg-white" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                    )}></span>
                                </div>
                            )}

                            {/* Activity Badge */}
                            {count > 0 && !isToday(day) && (
                                <div className="absolute -top-1 -right-1 opacity-10 group-hover:opacity-100 transition-opacity bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10">
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
