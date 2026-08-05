import { redirect } from 'next/navigation';

// O registro anônimo agora vive na Home (/). Mantemos esta rota como alias
// para não quebrar links/favoritos antigos apontando para /reportar.
export default function ReportarRedirectPage() {
  redirect('/');
}
