'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

const VIDEO_URL = '/video.mp4';
const POSTER_URL = '/thumbnail.jpg';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 translate-x-0.5 md:h-9 md:w-9">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 md:h-9 md:w-9">
      <rect x="5" y="3" width="4" height="18" rx="1" />
      <rect x="15" y="3" width="4" height="18" rx="1" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center md:h-11 md:w-11">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
      </svg>
      <span className="absolute text-[7px] font-bold leading-none md:text-[9px]" style={{ fontFamily: 'monospace', marginTop: '1px' }}>10</span>
    </div>
  );
}

function SkipForwardIcon() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center md:h-11 md:w-11">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
        <path d="M23 4v6h-6" />
        <path d="M20.49 15a9 9 0 1 1-.49-4.5" />
      </svg>
      <span className="absolute text-[7px] font-bold leading-none md:text-[9px]" style={{ fontFamily: 'monospace', marginTop: '1px' }}>10</span>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

export default function VideoPlayer({
  onVideoRef,
  externalVideoRef,
}: {
  onVideoRef?: (el: HTMLVideoElement | null) => void;
  externalVideoRef?: React.RefObject<HTMLVideoElement>;
} = {}) {
  // When externalVideoRef is provided the <video> element lives outside this
  // component (at section level). We use it directly for all controls.
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted,   setMuted]   = useState(false);
  const srcLoadedRef = useRef(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);

  // onVideoRef callback — only when no external ref
  useEffect(() => {
    if (externalVideoRef) return;
    onVideoRef?.(internalVideoRef.current);
    return () => { onVideoRef?.(null); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // hideTimer cleanup only — no autoplay.
  useEffect(() => {
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  // When using external video, sync all playback state via event listeners
  useEffect(() => {
    if (!externalVideoRef) return;
    const v = externalVideoRef.current;
    if (!v) return;

    const onPlay    = () => setPlaying(true);
    const onPlaying = () => { setPlaying(true); setStarted(true); };
    const onPause   = () => setPlaying(false);
    const onEnded   = () => setPlaying(false);
    const onTime    = () => setCurrentTime(v.currentTime);
    const onMeta    = () => setDuration(v.duration);
    const onVolume  = () => setMuted(v.muted);

    v.addEventListener('play',           onPlay);
    v.addEventListener('playing',        onPlaying);
    v.addEventListener('pause',          onPause);
    v.addEventListener('ended',          onEnded);
    v.addEventListener('timeupdate',     onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('volumechange',   onVolume);

    // Sync initial state (video may already be playing when this effect runs)
    if (!v.paused && v.readyState >= 3) { setPlaying(true); setStarted(true); }
    if (v.duration)  setDuration(v.duration);
    setCurrentTime(v.currentTime);
    setMuted(v.muted);

    return () => {
      v.removeEventListener('play',           onPlay);
      v.removeEventListener('playing',        onPlaying);
      v.removeEventListener('pause',          onPause);
      v.removeEventListener('ended',          onEnded);
      v.removeEventListener('timeupdate',     onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('volumechange',   onVolume);
    };
  }, [externalVideoRef]);

  // Show native controls when fullscreen
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onFsChange = () => {
      if (document.fullscreenElement === v) {
        v.setAttribute('controls', '');
      } else {
        v.removeAttribute('controls');
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  // videoRef is stable — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2500);
  }, []);

  // Mouse: show on any movement, stay until the pointer leaves. Touch: show on tap, auto-hide.
  // pointermove bubbles from children and fires continuously, so controls can never get
  // stuck hidden the way onMouseEnter (fires once) could when a button appears under the cursor.
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    setControlsVisible(true);
    if (e.pointerType === 'mouse') {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      scheduleHide();
    }
  }, [scheduleHide]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsVisible(false);
  }, []);

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (!srcLoadedRef.current) { srcLoadedRef.current = true; v.src = VIDEO_URL; }
    if (v.paused) { v.play(); } else { v.pause(); }
    scheduleHide();
  }, [scheduleHide, videoRef]);

  const handleSkip = useCallback((seconds: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
    scheduleHide();
  }, [scheduleHide, videoRef]);

  const handleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, [videoRef]);

  return (
    <div
      className="relative w-full cursor-pointer overflow-hidden rounded-2xl shadow-lg"
      style={{ aspectRatio: '16/9' }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
    >
      {/* Internal <video> — only rendered when no externalVideoRef */}
      {!externalVideoRef && (
        <video
          ref={internalVideoRef}
          poster={POSTER_URL}
          playsInline
          preload="none"
          className="h-full w-full object-cover"
          onPlay={() => setPlaying(true)}
          onPlaying={() => setStarted(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}

      {/* Poster overlay — holds until first frame renders */}
      {!started && (
        <img
          src={POSTER_URL}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Before first play: always-visible centered play button — only element shown */}
      {!started && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const v = videoRef.current;
            if (!v) return;
            if (!srcLoadedRef.current) { srcLoadedRef.current = true; v.src = VIDEO_URL; }
            v.play().catch(() => {});
          }}
          aria-label="Play video"
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5DAFD5]/90 text-white shadow-lg md:h-20 md:w-20">
            <PlayIcon />
          </span>
        </button>
      )}

      {/* Everything below only renders after playback starts */}

      {/* Time — top-left */}
      {duration > 0 && (
        <span className="absolute top-3 left-4 z-10 font-mono text-xs text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      )}

      {/* Expand — bottom-right */}
      {started && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const v = videoRef.current;
            if (!v) return;
            const webkit = v as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
            if (webkit.webkitEnterFullscreen) {
              webkit.webkitEnterFullscreen();
            } else {
              v.requestFullscreen?.().catch(() => {});
            }
          }}
          className="absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0C1014]/60 text-white backdrop-blur-sm transition-opacity hover:opacity-70"
          aria-label="Fullscreen"
        >
          <ExpandIcon />
        </button>
      )}

      {/* Mute — top-right */}
      {started && (
        <button
          onClick={handleMute}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0C1014]/60 text-white backdrop-blur-sm transition-opacity hover:opacity-70"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MuteIcon /> : <UnmuteIcon />}
        </button>
      )}

      {/* Centre controls — visibility driven by pointer activity (works for mouse + touch) */}
      {started && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-10 transition-opacity duration-200"
          style={{ opacity: controlsVisible ? 1 : 0 }}
        >
          <button
            onClick={handleSkip(-10)}
            className="transform-gpu text-white transition-opacity hover:opacity-70"
            style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }}
            aria-label="Rewind 10 seconds"
          >
            <SkipBackIcon />
          </button>

          <button
            onClick={handlePlayPause}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5DAFD5]/90 text-white shadow-lg md:h-20 md:w-20"
            style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={handleSkip(10)}
            className="transform-gpu text-white transition-opacity hover:opacity-70"
            style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }}
            aria-label="Skip forward 10 seconds"
          >
            <SkipForwardIcon />
          </button>
        </div>
      )}
    </div>
  );
}
