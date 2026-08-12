export default function OccurrencesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-28 rounded-3xl border border-slate-200 bg-white" />
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
