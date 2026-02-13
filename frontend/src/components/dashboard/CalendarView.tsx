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

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-emerald-500" />
                    Assessment Calendar
                </h3>
                <div className="flex items-center space-x-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
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
                    <div key={`blank-${i}`} className="aspect-square" />
                ))}
                {days.map(day => {
                    const count = getCount(day);
                    return (
                        <div
                            key={day}
                            className={cn(
                                "relative aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer",
                                isToday(day)
                                    ? "bg-primary-500/10 border-primary-500 dark:border-primary-400 shadow-sm shadow-primary-500/20"
                                    : "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-primary-400",
                            )}
                        >
                            <span className={cn(
                                "text-sm font-bold",
                                isToday(day) ? "text-primary-600 dark:text-primary-400" : "text-slate-600 dark:text-slate-400"
                            )}>
                                {day}
                            </span>
                            {count > 0 && (
                                <div className="mt-1">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                </div>
                            )}

                            {/* Hover Badge */}
                            {count > 0 && (
                                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg z-10">
                                    {count}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
