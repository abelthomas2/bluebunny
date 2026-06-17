'use client';

import { useState } from 'react';
import VideoPlayer from '@/app/components/VideoPlayer';
import { useVideoTracking } from '@/app/lib/useVideoTracking';

// Wraps the shared VideoPlayer and fires play / 50% / complete analytics off its
// underlying <video> element (handed up via onVideoRef) — so tracking lives here,
// not inside the reusable player.
export default function TrackedVideo() {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  useVideoTracking(videoEl, 'sample_report');

  return <VideoPlayer onVideoRef={setVideoEl} />;
}
