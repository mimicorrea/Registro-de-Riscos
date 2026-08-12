export default function MyTasksLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-4">
        <div className="h-24 rounded-lg border border-slate-200 bg-white" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg border border-slate-200 bg-white" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
