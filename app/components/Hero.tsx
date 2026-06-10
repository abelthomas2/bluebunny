'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PmOnboardingForm from '@/app/components/PmOnboardingForm';
import AmbientVideoBackground from '@/app/components/AmbientVideoBackground';

const VideoPlayer = dynamic(() => import('@/app/components/VideoPlayer'));

export default function Hero() {
  // The foreground player's <video> element, handed up via VideoPlayer's
  // onVideoRef callback, then fed to the ambient background so the glow is
  // drawn from the exact same playing element (perfectly synced).
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  return (
    <section id="pm-hero" className="section-anchor relative flex flex-col overflow-hidden pt-[5.8rem] md:min-h-dvh md:pt-[7rem]">
      <AmbientVideoBackground videoEl={videoEl} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0C1014]/75 via-[#0C1014]/65 to-[#0C1014]/80" />

      <div className="relative flex flex-1 flex-col px-5 pt-5 pb-12 md:items-center md:justify-center md:py-8">
        <div className="mx-auto grid w-full max-w-6xl gap-8 md:gap-12 md:grid-cols-[1.1fr_1fr]">
          {/* Left: headline */}
          <div className="flex flex-col rounded-2xl border border-[#E2EEF5] bg-white p-5 shadow-[0_22px_65px_rgba(12,16,20,0.16)] md:self-start md:px-8 md:pt-5 md:pb-5">
            <p className="text-xs md:text-sm font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5]">
              SERVING ORLANDO / DISNEY CORRIDOR
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight text-[#0C1014]">
              Vacation Rental Cleaning for Property Managers
            </h1>
            <div className="mt-4">
              <VideoPlayer onVideoRef={setVideoEl} />
            </div>
            <p className="mt-4 text-sm md:text-base font-mono text-[#0C1014] max-w-3xl">
              We clean, document, and restock your short-term rentals so you never have to manage another turnover.
            </p>

            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm md:text-base font-mono text-[#0C1014]">
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-[#2978A5]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong className="font-bold text-[#0C1014]">Cleaning, Linens, Restock &mdash; One Partner</strong></span>
              </li>
              <li className="flex items-start gap-3 text-sm md:text-base font-mono text-[#0C1014]">
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-[#2978A5]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong className="font-bold text-[#0C1014]">Photo &amp; Damage Report Every Turn</strong></span>
              </li>
              <li className="flex items-start gap-3 text-sm md:text-base font-mono text-[#0C1014]">
                <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-[#2978A5]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span><strong className="font-bold text-[#0C1014]">Free Reclean Guarantee, Same Day</strong></span>
              </li>
            </ul>
            <p className="mt-4 text-center text-xs font-mono text-[#0C1014]">
              Insured <span className="text-[#2978A5]">•</span> Bonded <span className="text-[#2978A5]">•</span> Vetted Cleaners
            </p>
          </div>

          {/* Right: form */}
          <PmOnboardingForm />
        </div>
      </div>
    </section>
  );
}
