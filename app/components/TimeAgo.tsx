'use client';

import { useSyncExternalStore } from 'react';
import { formatTimeAgo } from '@/app/lib/timeAgo';

// Nothing to subscribe to; the value only depends on the current time.
const subscribe = () => () => {};

/**
 * Renders "2 weeks ago" for a date.
 *
 * `initial` is the label computed on the server at build time. It is used for
 * the server HTML and during hydration so the markup matches, then React swaps
 * in a fresh label computed from the visitor's clock.
 */
export default function TimeAgo({ date, initial }: { date: string; initial: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => formatTimeAgo(date),
    () => initial,
  );

  return <time dateTime={date}>{label}</time>;
}
