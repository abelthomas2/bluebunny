'use client';

import { useEffect, useRef, useState } from 'react';

// rVFC isn't in every TS lib.dom version — narrow locally so tsc stays happy.
// The callback fires once per *presented* video frame, with metadata identifying it.
type FrameMeta = { mediaTime: number; presentedFrames: number; expectedDisplayTime: number };
type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, metadata: FrameMeta) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

const DEFAULT_POSTER = '/thumbnail.jpg';

/**
 * YouTube-style ambient glow: draws the *current frame* of a shared <video>
 * element onto a tiny canvas, then CSS-blurs/scales it to fill the parent.
 * Because it reads the same playing element (never tracks currentTime), the
 * glow is the literal same frame as the foreground player — perfectly synced,
 * with zero extra network (no second video download).
 *
 * Shows the poster whenever the video isn't playing.
 */
export default function AmbientVideoBackground({
  videoEl,
  posterUrl = DEFAULT_POSTER,
}: {
  videoEl: HTMLVideoElement | null;
  posterUrl?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The canvas is the single visible layer once it has content. It's revealed as
  // soon as the poster is painted into it, so the pre-play background and the live
  // video share the exact same downscale + blur (identical look). On pause it
  // freezes on the last drawn frame rather than reverting to the poster.
  const [revealCanvas, setRevealCanvas] = useState(false);

  // Paint the poster through the same tiny canvas so it gets the identical
  // downscale + blur as the video frames (a plain <img> only gets the CSS blur,
  // so it looks noticeably sharper than the ambient glow).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.filter = 'blur(1px)';

    let cancelled = false;
    const img = new window.Image();
    img.decoding = 'async';
    const paint = () => {
      if (cancelled) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setRevealCanvas(true);
    };
    img.onload = paint;
    img.src = posterUrl;
    if (img.complete && img.naturalWidth > 0) paint();

    return () => { cancelled = true; };
  }, [posterUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!videoEl || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.filter = 'blur(1px)'; // tiny pre-smooth before the heavy CSS blur

    const video = videoEl as FrameVideo;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const useRvfc = typeof video.requestVideoFrameCallback === 'function';

    let rafId = 0;
    let rvfcId = 0;

    const draw = () => {
      if (video.readyState < 2) return; // no decoded frame yet
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    };

    const loop = () => {
      draw();
      if (useRvfc) {
        rvfcId = video.requestVideoFrameCallback!(loop);
      } else {
        rafId = requestAnimationFrame(loop);
      }
    };

    const cancelLoop = () => {
      if (rvfcId && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(rvfcId);
      if (rafId) cancelAnimationFrame(rafId);
      rvfcId = 0;
      rafId = 0;
    };

    // `playing` (not `play`) means frames are actually flowing — gating the
    // reveal on it avoids fading the poster out over a blank/buffering canvas.
    const start = () => {
      cancelLoop();
      draw();            // paint the current frame over the poster
      setRevealCanvas(true);
      if (reduceMotion) return; // single static frame, no animation loop
      loop();
    };

    // On pause/ended just stop drawing — the canvas keeps its last frame, so the
    // background freezes on the paused frame instead of reverting to the poster.
    const stop = () => {
      cancelLoop();
    };

    video.addEventListener('playing', start);
    video.addEventListener('pause', stop);
    video.addEventListener('ended', stop);

    // Element may already be playing by the time this effect runs.
    if (!video.paused && video.readyState >= 2) start();

    return () => {
      video.removeEventListener('playing', start);
      video.removeEventListener('pause', stop);
      video.removeEventListener('ended', stop);
      cancelLoop();
    };
  }, [videoEl]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* SSR / pre-JS fallback only — replaced by the canvas (which paints this
          same poster) as soon as it loads, so the steady background is the canvas. */}
      <img
        src={posterUrl}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl brightness-110 saturate-[1.8] transition-opacity duration-300 transform-gpu will-change-transform"
        style={{ opacity: revealCanvas ? 0 : 1 }}
      />
      {/* The single visible ambient layer: poster first, then live video frames
          (freezes on the current frame when paused) — all at the same blur. */}
      <canvas
        ref={canvasRef}
        width={48}
        height={27}
        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl brightness-110 saturate-[1.8] transition-opacity duration-300 transform-gpu will-change-transform"
        style={{ opacity: revealCanvas ? 1 : 0 }}
      />
    </div>
  );
}
