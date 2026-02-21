'use client';

import { useState } from 'react';

type Review = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

type TestimonialsCarouselProps = {
  reviews: Review[];
  rating: number | null;
  totalRatings: number | null;
  debugError?: string;
  showDebug?: boolean;
};

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex shrink-0 items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((star) => (
        <span
          key={star}
          aria-hidden
          className={star < rounded ? 'text-[#F4B400]' : 'text-[#F4B400]/30'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function shortenReviewerName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 22) return trimmed;

  const words = trimmed.split(/\s+/);
  if (words.length >= 3) {
    return `${words.slice(0, 3).join(' ')}...`;
  }

  return `${trimmed.slice(0, 19).trimEnd()}...`;
}

export default function TestimonialsCarousel({
  reviews,
  rating,
  totalRatings,
  debugError,
  showDebug = false,
}: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasReviews = reviews.length > 0;
  const safeIndex = hasReviews ? Math.min(activeIndex, reviews.length - 1) : 0;
  const activeReview = hasReviews ? reviews[safeIndex] : null;

  const goToNext = () => {
    if (!hasReviews) return;
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  const goToPrevious = () => {
    if (!hasReviews) return;
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {rating !== null && totalRatings !== null && (
        <div className="mx-auto flex w-full items-center justify-center">
          <div className="inline-flex items-center justify-center gap-3 rounded-full border border-[#5DAFD5]/45 bg-white/90 px-5 py-2.5 shadow-[0_12px_35px_rgba(12,16,20,0.05)]">
            <StarRow rating={rating} />
            <p className="text-sm md:text-base font-semibold text-[#0C1014]">
              {rating.toFixed(1)} Google rating ({totalRatings} reviews)
            </p>
          </div>
        </div>
      )}

      {activeReview ? (
        <div className="mx-auto max-w-4xl space-y-4 md:space-y-5">
          <article className="h-[14rem] md:h-[14rem] rounded-3xl border border-[#5DAFD5]/35 bg-white/90 p-6 md:p-8 shadow-[0_20px_65px_rgba(12,16,20,0.06)]">
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 pr-2">
                  <p
                    className="truncate whitespace-nowrap text-lg md:text-2xl font-semibold text-[#0C1014]"
                    title={activeReview.author}
                  >
                    {shortenReviewerName(activeReview.author)}
                  </p>
                  <p className="mt-1 text-xs md:text-sm font-mono uppercase tracking-[0.2em] text-[#2978A5]">
                    {activeReview.relativeTime}
                  </p>
                </div>
                <StarRow rating={activeReview.rating} />
              </div>
              <p className="mt-4 md:mt-5 flex-1 overflow-y-auto pr-1 text-base md:text-lg font-mono leading-relaxed text-[#0C1014]/90">
                &quot;{activeReview.text}&quot;
              </p>
            </div>
          </article>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Show previous testimonial"
              className="rounded-full border border-[#2978A5]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0C1014] transition hover:bg-[#2978A5] hover:text-white"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Show next testimonial"
              className="rounded-full border border-[#2978A5]/30 bg-white px-4 py-2 text-sm font-semibold text-[#0C1014] transition hover:bg-[#2978A5] hover:text-white"
            >
              Next
            </button>
          </div>

          {reviews.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {reviews.map((review, index) => {
                const isActive = index === safeIndex;
                return (
                  <button
                    key={`${review.author}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show testimonial ${index + 1}`}
                    className={`h-2.5 w-6 md:h-3 md:w-8 rounded-full transition ${
                      isActive ? 'bg-[#2978A5]' : 'bg-[#2978A5]/30 hover:bg-[#2978A5]/60'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#5DAFD5]/35 bg-white/90 p-6 md:p-8 text-center shadow-[0_20px_65px_rgba(12,16,20,0.06)]">
          <p className="text-sm md:text-base font-mono text-[#0C1014]/85">
            Google reviews are not available right now.
          </p>
          {showDebug && debugError && (
            <p className="mt-3 text-xs font-mono text-[#0C1014]/65">Debug: {debugError}</p>
          )}
        </div>
      )}
    </div>
  );
}
