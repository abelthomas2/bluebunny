'use client';

import { useState } from 'react';

type Review = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div role="img" className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
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

export default function ReviewsCarousel({ items }: { items: Review[] }) {
  const [idx, setIdx] = useState(0);
  const review = items[idx];

  return (
    <div className="mt-4 mx-auto max-w-4xl px-4">
      {/* Card with arrows overlaid on sides */}
      <div className="relative rounded-2xl border border-[#E2EEF5] bg-white shadow-sm min-h-[9rem]">
        {/* Left arrow — half off card edge */}
        <button
          onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
          aria-label="Previous review"
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2EEF5] bg-white text-[#0C1014] shadow-sm transition hover:bg-[#EEF6FB]"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="-translate-x-px">
            <path d="M6 2L2 7L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Content */}
        <div className="px-10 py-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#0C1014]">
                {review.author.length > 15 ? `${review.author.slice(0, 15)}...` : review.author}
              </p>
              <p className="mt-0.5 text-xs font-mono text-[#0C1014]/75">{review.relativeTime}</p>
            </div>
            <StarRow rating={review.rating} />
          </div>
          <p className="mt-3 text-sm font-mono leading-relaxed text-[#0C1014]">
            &ldquo;{review.text}&rdquo;
          </p>
        </div>

        {/* Right arrow — half off card edge */}
        <button
          onClick={() => setIdx((i) => (i + 1) % items.length)}
          aria-label="Next review"
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2EEF5] bg-white text-[#0C1014] shadow-sm transition hover:bg-[#EEF6FB]"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="translate-x-px">
            <path d="M2 2L6 7L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-3 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to review ${i + 1}`}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-200 ${
                i === idx ? 'w-5 bg-[#2978A5]' : 'w-1.5 bg-[#E2EEF5] hover:bg-[#5DAFD5]'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
