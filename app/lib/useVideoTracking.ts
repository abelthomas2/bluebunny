import { useEffect, useRef } from 'react';
import { track } from '@/app/lib/analytics';

// Attaches play / 50% / complete analytics to a <video> element (handed in once it
// exists). Each milestone fires at most once per mount. `location` distinguishes
// where the video lives (e.g. 'home_hero', 'sample_report').
export function useVideoTracking(el: HTMLVideoElement | null, location: string) {
  const firedPlay = useRef(false);
  const fired50 = useRef(false);
  const firedComplete = useRef(false);

  useEffect(() => {
    if (!el) return;

    const onPlay = () => {
      if (!firedPlay.current) {
        firedPlay.current = true;
        track('video_play', { location });
      }
    };
    const onTimeUpdate = () => {
      if (!fired50.current && el.duration > 0 && el.currentTime / el.duration >= 0.5) {
        fired50.current = true;
        track('video_50', { location });
      }
    };
    const onEnded = () => {
      if (!firedComplete.current) {
        firedComplete.current = true;
        track('video_complete', { location });
      }
    };

    el.addEventListener('play', onPlay);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('ended', onEnded);
    };
  }, [el, location]);
}
