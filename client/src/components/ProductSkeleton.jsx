export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-ink/5 bg-white/50">
          <div className="skeleton aspect-[4/5]" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-5 w-4/5 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
