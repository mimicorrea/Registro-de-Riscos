import { NextRequest } from 'next/server';
import { uploadImage } from '@/lib/blob-storage';
import { apiError, apiJson, enforceRateLimit, parseBody } from '@/lib/api-utils';
import { uploadImageSchema } from '@/lib/validations/occurrence';

// Endpoint público — usado apenas pelo formulário de registro anônimo em
// /reportar. Sem sessão, mas com o mesmo rate limit por IP das demais rotas
// e validação de tamanho/formato da imagem (uploadImageSchema).
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, 'public-upload');
  if (limited) return limited;

  try {
    const parsed = await parseBody(request, uploadImageSchema);
    if ('error' in parsed) return parsed.error;

    const imageUrl = await uploadImage(parsed.data.imageBase64);

    return apiJson(request, { url: imageUrl, success: true });
  } catch (error) {
    console.error('Erro ao fazer upload (público):', error);
    return apiError(request, 'Erro ao fazer upload da imagem', 500);
  }
}
