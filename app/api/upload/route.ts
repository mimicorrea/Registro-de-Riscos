import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadImage } from '@/lib/blob-storage';
import { apiError, apiJson, parseBody } from '@/lib/api-utils';
import { uploadImageSchema } from '@/lib/validations/occurrence';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError(request, 'Não autorizado', 401);
    }

    const parsed = await parseBody(request, uploadImageSchema);
    if ('error' in parsed) return parsed.error;

    const imageUrl = await uploadImage(parsed.data.imageBase64);

    return apiJson(request, { url: imageUrl, success: true });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return apiError(request, 'Erro ao fazer upload da imagem', 500);
  }
}
