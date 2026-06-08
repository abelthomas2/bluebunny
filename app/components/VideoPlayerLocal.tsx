'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

const VIDEO_URL   = '/video.mp4';
const POSTER_URL  = '/thumbnail.jpg';

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

export default function VideoPlayerLocal() {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing,         setPlaying]         = useState(false);
  const [started,         setStarted]         = useState(false);
  const [muted,           setMuted]           = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [currentTime,     setCurrentTime]     = useState(0);
  const [duration,        setDuration]        = useState(0);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

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
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 2500);
  }, []);

  const handleVideoTap = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  const handlePlayPause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); } else { v.pause(); }
    scheduleHide();
  }, [scheduleHide]);

  const handleSkip = useCallback((seconds: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
    scheduleHide();
  }, [scheduleHide]);

  const handleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  return (
    <div
      className="relative w-full cursor-pointer overflow-hidden rounded-2xl shadow-lg"
      style={{ aspectRatio: '16/9' }}
      onClick={handleVideoTap}
      onMouseEnter={handleVideoTap}
      onMouseLeave={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); setControlsVisible(false); }}
    >
      <video
        ref={videoRef}
        src={VIDEO_URL}
        poster={POSTER_URL}
        playsInline
        muted
        loop
        preload="auto"
        className="h-full w-full object-cover"
        onPlay={() => setPlaying(true)}
        onPlaying={() => setStarted(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Poster overlay — holds until the first playing frame */}
      {!started && (
        <img
          src={POSTER_URL}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Time — always visible, top-left */}
      {duration > 0 && (
        <span className="absolute top-3 left-4 z-10 font-mono text-xs text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      )}

      {/* Expand — always visible, bottom-right */}
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

      {/* Mute — always visible, top-right */}
      <button
        onClick={handleMute}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0C1014]/60 text-white backdrop-blur-sm transition-opacity hover:opacity-70"
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <MuteIcon /> : <UnmuteIcon />}
      </button>

      {/* Centre controls — shown on tap */}
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
    </div>
  );
}
