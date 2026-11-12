'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/app/lib/analytics';
import type { ReviewCard } from '@/app/lib/reviews';
import TimeAgo from '@/app/components/TimeAgo';

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div role="img" className="flex shrink-0 items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((star) => (
        <svg
          key={star}
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={star < rounded ? 'text-[#F4B400]' : 'text-[#F4B400]/25'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Cards per page is set purely by CSS widths: 1 on mobile, 2 at md, 3 at lg.
 * Snap points sit on page boundaries so a swipe lands on a full page of cards.
 * Full class strings are used so Tailwind can see them.
 */
function snapClasses(index: number): string {
  const md = index % 2 === 0;
  const lg = index % 3 === 0;
  if (md && lg) return 'snap-start';
  if (lg) return 'snap-start md:snap-align-none lg:snap-start';
  if (md) return 'snap-start lg:snap-align-none';
  return 'snap-start md:snap-align-none';
}

export default function ReviewsCarousel({ items }: { items: ReviewCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [perPage, setPerPage] = useState(1);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / perPage));
  const activePage = Math.min(page, pages - 1);

  // Measure how many cards fit per page (decided by CSS) so the dots and paging
  // match, and keep it updated on resize.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const card = el.firstElementChild as HTMLElement | null;
      const cardWidth = card?.offsetWidth ?? 0;
      const width = el.clientWidth;
      setPerPage(cardWidth > 0 && width > 0 ? Math.max(1, Math.round(width / cardWidth)) : 1);
      setPage(width > 0 ? Math.round(el.scrollLeft / width) : 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const engaged = useRef(false);
  const markEngaged = () => {
    if (!engaged.current) {
      engaged.current = true;
      track('carousel_advance', { carousel: 'reviews' });
    }
  };

  const goToPage = (target: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = ((target % pages) + pages) % pages; // wraps both directions
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  const arrowClass =
    'absolute top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2EEF5] bg-white text-[#0C1014] shadow-sm transition hover:bg-[#EEF6FB]';

  return (
    <div className="mt-4 px-4 md:px-0">
      <div className="relative">
        {/* Track: all cards, horizontally scrollable, snapping per page */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
          className="-mx-2.5 flex snap-x snap-mandatory overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((review, index) => (
            <div
              key={`${review.author}-${index}`}
              className={`w-full shrink-0 px-2.5 md:w-1/2 lg:w-1/3 ${snapClasses(index)}`}
            >
              <article className="flex h-full flex-col rounded-2xl border border-[#E2EEF5] bg-white px-10 py-7 shadow-sm md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[#0C1014]">{review.author}</p>
                    <p className="mt-0.5 text-xs font-mono text-[#0C1014]/75">
                      <TimeAgo date={review.date} initial={review.postedLabel} />
                    </p>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                <p className="mt-3 grow text-sm font-mono leading-relaxed text-[#0C1014]">
                  &ldquo;{review.text}&rdquo;
                </p>
              </article>
            </div>
          ))}
        </div>

        {pages > 1 && (
          <>
            {/* Left arrow — half off the first card's edge */}
            <button
              type="button"
              onClick={() => { markEngaged(); goToPage(activePage - 1); }}
              aria-label="Previous reviews"
              className={`${arrowClass} left-0 -translate-x-1/2`}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="-translate-x-px">
                <path d="M6 2L2 7L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Right arrow — half off the last card's edge */}
            <button
              type="button"
              onClick={() => { markEngaged(); goToPage(activePage + 1); }}
              aria-label="Next reviews"
              className={`${arrowClass} right-0 translate-x-1/2`}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="translate-x-px">
                <path d="M2 2L6 7L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators — one per page */}
      {pages > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { markEngaged(); goToPage(i); }}
              aria-label={`Go to reviews page ${i + 1}`}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-200 ${
                  i === activePage ? 'w-5 bg-[#2978A5]' : 'w-1.5 bg-[#E2EEF5] hover:bg-[#5DAFD5]'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
