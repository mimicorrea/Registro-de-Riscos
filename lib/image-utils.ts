const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];

export function validateImageFile(file: File): string | null {
  // Fotos tiradas por iPhone costumam vir com file.type vazio ou 'image/heic',
  // que alguns navegadores não preenchem corretamente — por isso também checamos a extensão.
  const hasValidType = ALLOWED_TYPES.includes(file.type.toLowerCase());
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!hasValidType && !hasValidExtension) {
    return 'Formato inválido. Use JPG, PNG, WebP, GIF ou HEIC.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Imagem muito grande. Máximo: 10MB.';
  }
  return null;
}

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === 'image/heic' || type === 'image/heif' || name.endsWith('.heic') || name.endsWith('.heif');
}

export function compressImage(
  dataUrl: string,
  maxWidth = 1280,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível processar a imagem'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = dataUrl;
  });
}
