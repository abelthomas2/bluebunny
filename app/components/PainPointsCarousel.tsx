'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

type PainPointItem = {
  icon: ReactNode;
  text: string;
};

export default function PainPointsCarousel({ items }: { items: PainPointItem[] }) {
  const [idx, setIdx] = useState(0);
  const item = items[idx];

  return (
    <div className="mt-8 mx-auto max-w-4xl px-4">
      {/* Card with arrows overlaid on sides */}
      <div className="relative rounded-2xl border border-[#E2EEF5] bg-white shadow-sm min-h-[7rem]">
        {/* Left arrow — half off card edge */}
        <button
          onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2EEF5] bg-white text-[#0C1014] shadow-sm transition hover:bg-[#EEF6FB]"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="-translate-x-px">
            <path d="M6 2L2 7L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex items-start gap-5 px-10 py-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF6FB] text-[#2978A5]">
            {item.icon}
          </div>
          <p className="text-sm font-mono leading-relaxed text-[#0C1014]">{item.text}</p>
        </div>

        {/* Right arrow — half off card edge */}
        <button
          onClick={() => setIdx((i) => (i + 1) % items.length)}
          aria-label="Next"
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
            aria-label={`Go to item ${i + 1}`}
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
