'use client';

import Link from 'next/link';
import { Printer, ArrowLeft } from 'lucide-react';

export default function ReportActions({ occurrenceId }: { occurrenceId: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/occurrences/${occurrenceId}`}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Printer className="h-4 w-4" />
        Imprimir / Salvar PDF
      </button>
    </div>
  );
}
