import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { AnonymousOccurrenceForm } from '@/components/anonymous-occurrence-form';

// Tela inicial = registro anônimo direto (nenhum login necessário).
// Navegação do app fica reduzida a 3 destinos: Início (aqui), Ocorrências e Dashboard.
export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 ring-1 ring-slate-200">
          <p className="text-sm uppercase tracking-[0.28em] text-brand-500">Gestor de Riscos</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Registrar ocorrência sem login</h1>
          <p className="mt-3 text-slate-500">
            Preencha os dados do evento, anexe fotos e capture a localização automaticamente. Não é
            necessário criar conta nem informar quem você é.
          </p>
          <Link
            href="/occurrences"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ClipboardList className="h-4 w-4" />
            Acompanhar o status das ocorrências já registradas
          </Link>
        </div>

        <AnonymousOccurrenceForm />
      </div>
    </div>
  );
}
