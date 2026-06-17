'use client';

import { useState } from 'react';
import Image from 'next/image';
import TrackedLink from '@/app/components/TrackedLink';

const PHONE_DISPLAY = '(904) 738-5631';
const PHONE_TEL = 'tel:9047385631';

export default function SampleHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-[#5DAFD5]/95 backdrop-blur-md"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div>
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex h-[5rem] items-center justify-between lg:h-[7rem]">
            {/* Logo */}
            <a
              href="#top"
              className="inline-flex shrink-0 items-center"
              aria-label="Blue Bunny Turnover Services — top of page"
            >
              <Image
                src="/banner-logo3.webp"
                alt="Blue Bunny Turnover Services Logo"
                width={900}
                height={300}
                sizes="(min-width: 1024px) 228px, 192px"
                priority
                unoptimized
                className="h-[3.7rem] w-auto origin-left scale-[1.2] -translate-x-[0.35rem] translate-y-[0px] lg:h-19 lg:scale-100 lg:translate-x-0 lg:translate-y-0"
              />
            </a>

            {/* Desktop right: site link + CTAs + support line */}
            <div className="relative hidden lg:flex lg:self-stretch lg:flex-col lg:items-end">
              <div className="flex flex-1 items-center gap-2">
                <a
                  href="https://gobluebunny.com"
                  className="whitespace-nowrap px-3 py-2 text-sm font-mono font-semibold text-[#0C1014] transition hover:text-white"
                >
                  gobluebunny.com
                </a>
                <TrackedLink
                  href={PHONE_TEL}
                  event="cta_call_tap"
                  eventProps={{ location: 'sample_header' }}
                  className="whitespace-nowrap rounded-full border border-[#0C1014]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0C1014] transition hover:bg-[#0C1014] hover:text-white"
                >
                  Call/Text: {PHONE_DISPLAY}
                </TrackedLink>
                <TrackedLink
                  href="#pilot"
                  event="cta_pilot_tap"
                  className="whitespace-nowrap rounded-full border border-[#0C1014] bg-[#2978A5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0C1014]"
                >
                  Start a Pilot
                </TrackedLink>
              </div>
              <p className="absolute bottom-[0.75rem] right-1 text-right text-xs font-mono font-semibold text-[#0C1014]">
                Daily support 8 AM – 7 PM ET
              </p>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isOpen}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0C1014]/20 bg-white text-[#0C1014]"
              >
                {isOpen ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile expanded menu */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="mx-auto max-w-6xl px-5 pb-6">
              <nav className="flex flex-col gap-1 pt-3" aria-label="Mobile navigation">
                <a
                  href="https://gobluebunny.com"
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0C1014] transition hover:bg-[#0C1014]/10"
                >
                  gobluebunny.com
                </a>
                <TrackedLink
                  href={PHONE_TEL}
                  event="cta_call_tap"
                  eventProps={{ location: 'sample_header' }}
                  className="mt-2 rounded-full border border-[#0C1014]/20 bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#0C1014] transition hover:bg-[#0C1014] hover:text-white"
                >
                  Call/Text: {PHONE_DISPLAY}
                </TrackedLink>
                <TrackedLink
                  href="#pilot"
                  event="cta_pilot_tap"
                  onClick={() => setIsOpen(false)}
                  className="mt-1 rounded-full border border-[#0C1014] bg-[#2978A5] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0C1014]"
                >
                  Start a Pilot
                </TrackedLink>
              </nav>
              <p className="mt-3 text-center text-xs font-mono font-semibold text-[#0C1014]">
                Daily support 8 AM – 7 PM ET
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
