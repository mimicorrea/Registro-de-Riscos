'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LazyImage } from './lazy-image';

interface ExpandableImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Legenda opcional exibida embaixo da foto ampliada (ex.: "Correção 1"). */
  caption?: string | null;
}

/**
 * Miniatura clicável: ao clicar, abre a foto em tamanho grande sobre a tela
 * inteira. Usado nos cards de ocorrência (dashboard, lista) e no detalhe,
 * onde a miniatura é pequena demais para o gestor examinar o problema.
 */
export function ExpandableImage({ src, alt, className = '', caption }: ExpandableImageProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          // Várias dessas miniaturas ficam dentro de um <Link> pro detalhe da
          // ocorrência — sem isso, clicar na foto navegaria em vez de ampliar.
          event.preventDefault();
          event.stopPropagation();
          setExpanded(true);
        }}
        className={`block cursor-zoom-in ${className}`}
        title="Clique para ampliar"
      >
        <LazyImage src={src} alt={alt} className="h-full w-full rounded-[inherit]" />
      </button>

      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-4"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded(false);
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(false);
            }}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
          {caption && <p className="max-w-xl text-center text-sm text-white/80">{caption}</p>}
        </div>
      )}
    </>
  );
}
