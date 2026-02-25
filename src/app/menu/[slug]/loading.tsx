export default function MenuLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant header skeleton */}
      <div className="bg-white px-4 py-8 text-center shadow-sm">
        <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="mx-auto mt-4 h-7 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Search bar skeleton */}
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Category tabs skeleton */}
      <div className="mx-auto flex max-w-2xl gap-2 overflow-hidden px-4 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>

      {/* Menu items skeleton */}
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl bg-white p-4 shadow-sm"
          >
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
