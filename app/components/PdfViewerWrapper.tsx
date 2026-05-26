'use client';

import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

export default function PdfViewerWrapper({ src, downloadAs }: { src: string; downloadAs?: string }) {
  return <PdfViewer src={src} downloadAs={downloadAs} />;
}
