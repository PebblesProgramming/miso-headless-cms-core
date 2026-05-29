"use client";

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { PageComponent } from '../../client/types.js';
import { CmsBlock } from './CmsBlock.js';

interface PreviewMessage {
  type: 'miso-preview-update';
  slug: string;
  components: PageComponent[];
}

interface CmsPreviewListenerProps {
  renderLayout: (children: ReactNode) => ReactNode;
}

export function CmsPreviewListener({ renderLayout }: CmsPreviewListenerProps) {
  const [previewData, setPreviewData] = useState<PreviewMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'miso-preview-ready' }, '*');
    }

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'miso-preview-update') return;
      setPreviewData(event.data as PreviewMessage);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!previewData) return null;

  const blocks = previewData.components.map((comp) => (
    <CmsBlock
      key={comp.id}
      slug={comp.component_slug}
      id={comp.id}
      content={comp.data}
    />
  ));

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col">
      <div className="shrink-0 flex items-center justify-between bg-slate-900/95 backdrop-blur-sm px-4 py-2 text-xs text-white/80">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
          Voorvertoning — wijzigingen zijn nog niet opgeslagen
        </span>
        <button
          onClick={() => setPreviewData(null)}
          className="text-white/60 hover:text-white transition ml-4"
        >
          Sluiten ✕
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {renderLayout(blocks)}
      </div>
    </div>
  );
}
