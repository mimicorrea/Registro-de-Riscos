import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

/**
 * Recebe uma imagem como data URL (ex: "data:image/jpeg;base64,...") e
 * salva no Vercel Blob, retornando a URL pública do arquivo.
 *
 * Ao contrário do Cloudinary, o Vercel Blob não faz nenhuma conversão de
 * formato — o arquivo é salvo exatamente como enviado. Fotos HEIC (comuns
 * em iPhone) continuam sendo aceitas e armazenadas, mas podem não exibir
 * preview em navegadores que não decodificam HEIC nativamente (ex.: Chrome
 * no Android). Isso é uma limitação da própria plataforma de armazenamento,
 * não do upload em si.
 */
export async function uploadImage(dataUrl: string, folder = 'gestor-de-riscos'): Promise<string> {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Formato de imagem inválido');
  }

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');
  const extension = MIME_EXTENSIONS[mimeType.toLowerCase()] ?? 'jpg';
  const pathname = `${folder}/${randomUUID()}.${extension}`;

  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: mimeType,
    addRandomSuffix: false,
  });

  return blob.url;
}
