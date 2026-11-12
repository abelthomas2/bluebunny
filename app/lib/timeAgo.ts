const DAY_MS = 86_400_000;

function ago(count: number, unit: string): string {
  return count === 1 ? `a ${unit} ago` : `${count} ${unit}s ago`;
}

/**
 * Google-style relative label for a past date:
 * "today", "3 days ago", "a week ago", "2 weeks ago", "a month ago",
 * "11 months ago", "a year ago", "2 years ago".
 *
 * `isoDate` is YYYY-MM-DD. `now` is injectable for tests.
 */
export function formatTimeAgo(isoDate: string, now: number = Date.now()): string {
  const posted = Date.parse(isoDate);
  if (Number.isNaN(posted)) return '';

  const days = Math.max(0, Math.floor((now - posted) / DAY_MS));

  if (days < 1) return 'today';
  if (days < 7) return ago(days, 'day');
  if (days < 30) return ago(Math.floor(days / 7), 'week');
  if (days < 365) return ago(Math.max(1, Math.floor(days / 30.44)), 'month');
  return ago(Math.max(1, Math.floor(days / 365.25)), 'year');
}
