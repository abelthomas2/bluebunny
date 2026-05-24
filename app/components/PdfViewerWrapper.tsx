'use client';

import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

export default function PdfViewerWrapper({ src }: { src: string }) {
  return <PdfViewer src={src} />;
}
