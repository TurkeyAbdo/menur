export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page title skeleton */}
      <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Table placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
