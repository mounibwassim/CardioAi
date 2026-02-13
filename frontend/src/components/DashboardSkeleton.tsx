export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8 p-8 bg-slate-900 rounded-2xl">
                <div className="h-10 w-64 bg-slate-800 rounded-lg mb-3"></div>
                <div className="h-5 w-96 bg-slate-800/50 rounded-lg"></div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="space-y-3">
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                            </div>
                            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
                        <div className="h-80 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="h-6 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
