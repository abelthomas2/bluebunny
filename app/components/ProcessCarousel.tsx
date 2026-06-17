'use client';

import { useRef, useState } from 'react';
import { track } from '@/app/lib/analytics';

const steps = [
  {
    step: '01',
    title: 'Pre-Turn Prep',
    body: 'Specialist reviews the Property Info document before heading out — access codes, add-ons, consumables model, and property-specific staging notes. Assignment confirmed the night before and one hour out.',
  },
  {
    step: '02',
    title: 'Arrival & Walkthrough',
    body: "Arrival photo and text to supervisor the moment we're on-site. Gloves on, hazard sweep, as-found photos of every room, with timestamps, are taken before anything is touched. Laundry stripped and started immediately — towels first, pre-treated for stains.",
  },
  {
    step: '03',
    title: 'Top-to-Bottom Clean',
    body: 'Kitchen, living and dining, bedrooms, bathrooms, and floors worked in sequence so nothing gets contaminated or skipped. Bathroom cloths stay in bathrooms. Mop pads rotated between zones. Every surface, appliance, and fixture addressed.',
  },
  {
    step: '04',
    title: 'Linen Reset & Restock',
    body: 'All linens washed on hot, fully dried, and staged before departure — no damp linens, ever. Consumables restocked from on-site supply. Property staged to listing photos: cushions, throws, thermostat, and lights per property notes.',
  },
  {
    step: '05',
    title: 'Photo Report',
    body: 'Every room photographed with timestamps in guest-ready condition. Damage, maintenance flags, and inventory levels documented. The full structured report is submitted to the PM within 30 minutes of lockup.',
  },
  {
    step: '06',
    title: 'Lockup & Departure',
    body: 'Final walkthrough is done to mirror the guest arrival path; then, lights are turned off, climate is set to property defaults, all windows and doors are secured, and the alarm is armed if applicable. Departure photo sent to supervisor to confirm lockup.',
  },
];

export default function ProcessCarousel() {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];

  // Fire once when the visitor first navigates the carousel — a content-engagement signal.
  const engaged = useRef(false);
  const markEngaged = () => {
    if (!engaged.current) {
      engaged.current = true;
      track('carousel_advance', { carousel: 'process' });
    }
  };

  return (
    <div className="mt-8 md:mt-12 mx-auto max-w-4xl px-4">
      {/* Card with arrows overlaid on sides */}
      <div className="relative rounded-2xl border border-[#E2EEF5] bg-white shadow-sm min-h-[21rem] md:min-h-[13rem]">
        {/* Left arrow — half off card edge */}
        <button
          onClick={() => { markEngaged(); setIdx((i) => Math.max(0, i - 1)); }}
          disabled={idx === 0}
          aria-label="Previous step"
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2EEF5] bg-white text-[#0C1014] shadow-sm transition hover:bg-[#EEF6FB] disabled:opacity-20"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="-translate-x-px">
            <path d="M6 2L2 7L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Content */}
        <div className="px-10 py-7">
          <span className="font-mono text-lg font-bold text-[#5DAFD5]">{step.step}</span>
          <h3 className="mt-2 text-lg font-bold text-[#0C1014]">{step.title}</h3>
          <p className="mt-2 text-sm font-mono leading-relaxed text-[#0C1014]">{step.body}</p>
        </div>

        {/* Right arrow — half off card edge */}
        <button
          onClick={() => { markEngaged(); setIdx((i) => Math.min(steps.length - 1, i + 1)); }}
          disabled={idx === steps.length - 1}
          aria-label="Next step"
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2EEF5] bg-white text-[#0C1014] shadow-sm transition hover:bg-[#EEF6FB] disabled:opacity-20"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden className="translate-x-px">
            <path d="M2 2L6 7L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-3 flex justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => { markEngaged(); setIdx(i); }}
            aria-label={`Go to step ${i + 1}`}
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
