export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="mb-8 h-40 rounded-3xl border border-slate-200 bg-white" />
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="h-96 rounded-3xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
