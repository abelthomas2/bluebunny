'use client';

export default function PdfViewer({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      title="Sample Turnover Report"
      className="h-[700px] w-full border-0"
    />
  );
}
