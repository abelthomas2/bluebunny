'use client';

import { useEffect } from 'react';
import { track } from './analytics';

// Scopes smooth-scroll behaviour to this page (build spec §6) while respecting
// prefers-reduced-motion, and fires a page_view event on mount.
export default function SmoothScroll() {
  useEffect(() => {
    track('page_view');

    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'smooth';
    return () => {
      html.style.scrollBehavior = previous;
    };
  }, []);

  return null;
}
