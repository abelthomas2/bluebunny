'use client';

// Polyfills required by pdfjs-dist 5.x — both added in Safari 17.4 (March 2024)

// Promise.withResolvers
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
  };
}

// URL.parse
if (typeof URL.parse === 'undefined') {
  (URL as unknown as { parse: (url: string, base?: string) => URL | null }).parse =
    (url: string, base?: string) => {
      try { return new URL(url, base); } catch { return null; }
    };
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.polyfilled.mjs';

// Pinned to globalThis so HMR module re-evaluation returns the same reference,
// which prevents react-pdf from thinking options changed between dev reloads.
const PDF_OPTIONS: { standardFontDataUrl: string } =
  (globalThis as Record<string, unknown>).__pdfOptions as { standardFontDataUrl: string } ??
  ((globalThis as Record<string, unknown>).__pdfOptions = {
    standardFontDataUrl: '/pdfjs/web/standard_fonts/',
  });

export default function PdfViewer({ src, downloadAs }: { src: string; downloadAs?: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [zoom, setZoom] = useState(1.0);
  const [lockedHeight, setLockedHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageWrapRef = useRef<HTMLDivElement>(null);
  const prevContainerWidth = useRef(0);

  // Measure container width and keep it updated on resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  // Reset locked height on the first real measurement so we re-lock at the
  // correct width (handles mobile where containerWidth starts at 0).
  useEffect(() => {
    if (prevContainerWidth.current === 0 && containerWidth > 0) {
      setLockedHeight(0);
    }
    prevContainerWidth.current = containerWidth;
  }, [containerWidth]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const onPageRenderSuccess = useCallback(() => {
    const h = pageWrapRef.current?.offsetHeight ?? 0;
    if (h > 0) setLockedHeight(prev => prev > 0 ? prev : h);
  }, []);

  const goToPrev = () => setPageNumber(p => Math.max(1, p - 1));
  const goToNext = () => setPageNumber(p => Math.min(numPages, p + 1));
  const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const zoomIn  = () => setZoom(z => Math.min(3.0, +(z + 0.25).toFixed(2)));

  const file = src.split('#')[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E2EEF5] bg-[#1a1a1a]">
      {/* Toolbar */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 bg-[#2d2d2d] px-4 py-2">
        {/* Page nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className="rounded px-2 py-1 text-sm text-white hover:bg-white/10 disabled:opacity-30 transition"
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="text-xs text-white/80 font-mono tabular-nums whitespace-nowrap">
            {pageNumber} / {numPages || '—'}
          </span>
          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className="rounded px-2 py-1 text-sm text-white hover:bg-white/10 disabled:opacity-30 transition"
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        {/* Zoom — hidden on small screens (use pinch-zoom) */}
        <div className="hidden sm:flex justify-center items-center gap-2 overflow-hidden">
          <button
            onClick={zoomOut}
            className="rounded px-2 py-1 text-sm text-white hover:bg-white/10 disabled:opacity-30 transition"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-xs text-white/80 font-mono w-10 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="rounded px-2 py-1 text-sm text-white hover:bg-white/10 disabled:opacity-30 transition"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>

        {/* Download */}
        <a
          href={file}
          download={downloadAs}
          className="justify-self-end rounded px-3 py-1 text-xs font-semibold text-white bg-[#2978A5] hover:bg-[#1d5f8a] transition"
        >
          Download
        </a>
      </div>

      {/* PDF canvas — width-fitted to container */}
      <div
        ref={containerRef}
        className="overflow-auto bg-[#525659] py-4 flex justify-center"
        style={lockedHeight > 0 ? { minHeight: lockedHeight + 32 } : undefined}
      >
        <Document
          file={file}
          options={PDF_OPTIONS}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="h-96 flex items-center justify-center text-white/50 text-sm font-mono">
              Loading report…
            </div>
          }
          error={
            <div className="h-96 flex items-center justify-center text-red-400 text-sm">
              Failed to load PDF.
            </div>
          }
        >
          <div ref={pageWrapRef}>
            <Page
              pageNumber={pageNumber}
              width={containerWidth > 0 ? (containerWidth - 32) * zoom : undefined}
              renderTextLayer
              renderAnnotationLayer={false}
              className="shadow-2xl"
              onRenderSuccess={onPageRenderSuccess}
              loading={
                lockedHeight > 0
                  ? <div style={{ height: lockedHeight, width: containerWidth > 0 ? (containerWidth - 32) * zoom : undefined }} />
                  : undefined
              }
            />
          </div>
        </Document>
      </div>
    </div>
  );
}
