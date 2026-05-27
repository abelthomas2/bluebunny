'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

export default function PdfViewerWrapper({ src, downloadAs }: { src: string; downloadAs?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // begin loading 200px before entering view
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <PdfViewer src={src} downloadAs={downloadAs} />
      ) : (
        <div className="flex h-[500px] items-center justify-center rounded-2xl border border-[#E2EEF5] bg-white text-sm text-[#5DAFD5]">
          Loading document…
        </div>
      )}
    </div>
  );
}
