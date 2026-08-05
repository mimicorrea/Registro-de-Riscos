import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { OccurrenceForm } from '@/components/occurrence-form';

export const metadata = {
  title: 'Nova ocorrência',
};

export default async function NewOccurrencePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 ring-1 ring-slate-200">
          <h1 className="text-3xl font-semibold text-slate-900">Registrar nova ocorrência</h1>
          <p className="mt-3 text-slate-500">
            Preencha os dados do evento, anexe fotos e capture a localização automaticamente.
          </p>
        </div>
        <OccurrenceForm />
      </div>
    </div>
  );
}
