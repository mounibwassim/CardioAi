export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-96 bg-slate-200 rounded"></div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
                            <div className="h-6 w-16 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-8 w-20 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
                        <div className="h-80 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <div className="h-6 w-64 bg-slate-200 rounded"></div>
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="h-4 w-full bg-slate-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
