'use client';

import { useEffect, useState } from 'react';
import { track } from './analytics';

const PHONE = '+19047385631';
const SHOW_AFTER_PX = 600;

// Mobile-only sticky bottom CTA bar (build spec §3.0 / §6): appears after the hero,
// hides while the pilot form fills ≥40% of the viewport, safe-area padded.
export default function StickyCtaBar() {
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [formInView, setFormInView] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPastHero(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const form = document.getElementById('pilot');
    if (!form) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const viewportHeight = window.innerHeight || 1;
        const inView =
          entry.isIntersecting && entry.intersectionRect.height >= 0.4 * viewportHeight;
        setFormInView(inView);
        // Close the action sheet whenever the bar is about to hide behind the form.
        if (inView) setSheetOpen(false);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );

    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const visible = scrolledPastHero && !formInView;

  return (
    <>
      {/* Call / Text action sheet */}
      {sheetOpen && visible && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-label="Call or text Blue Bunny">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-[#0C1014]/40"
          />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-[#E2EEF5] bg-white p-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <p className="px-1 pb-3 text-center text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5]">
              (904) 738-5631
            </p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${PHONE}`}
                onClick={() => {
                  track('cta_call_tap', { method: 'call' });
                  setSheetOpen(false);
                }}
                className="rounded-xl bg-[#2978A5] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Call
              </a>
              <a
                href={`sms:${PHONE}`}
                onClick={() => {
                  track('cta_call_tap', { method: 'text' });
                  setSheetOpen(false);
                }}
                className="rounded-xl border border-[#2978A5] px-4 py-3 text-center text-sm font-semibold text-[#2978A5]"
              >
                Text
              </a>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#E2EEF5] bg-white/95 backdrop-blur-md transition-transform duration-300 md:hidden ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden={!visible}
      >
        <div className="grid grid-cols-2 gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            tabIndex={visible ? 0 : -1}
            className="rounded-full border border-[#0C1014]/20 bg-white px-4 py-3 text-center text-sm font-semibold text-[#0C1014] shadow-sm transition active:bg-[#F4F9FD]"
          >
            Call / Text
          </button>
          <a
            href="#pilot"
            onClick={() => track('cta_pilot_tap')}
            tabIndex={visible ? 0 : -1}
            className="rounded-full bg-[#2978A5] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition active:bg-[#0C1014]"
          >
            Start a Pilot
          </a>
        </div>
      </div>
    </>
  );
}
