export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page title skeleton */}
      <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart placeholder */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 h-48 animate-pulse rounded-lg bg-gray-100" />
        </div>

        {/* List placeholder */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
