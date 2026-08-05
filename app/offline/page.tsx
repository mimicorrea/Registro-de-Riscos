import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export const metadata = {
  title: 'Sem conexão',
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
        <WifiOff className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Você está offline</h1>
        <p className="mt-3 text-slate-600">
          Sem internet no momento. Você ainda pode registrar ocorrências — elas serão sincronizadas
          automaticamente quando a conexão voltar.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/occurrences/new"
            className="inline-flex justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Registrar ocorrência offline
          </Link>
          <Link
            href="/occurrences"
            className="inline-flex justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ver ocorrências salvas
          </Link>
        </div>
      </div>
    </div>
  );
}
