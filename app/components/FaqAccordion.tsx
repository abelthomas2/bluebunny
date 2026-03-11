'use client';

import { useState } from 'react';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
  defaultVisible?: number;
};

export default function FaqAccordion({ items, defaultVisible = 5 }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const visibleItems = showAll ? items : items.slice(0, defaultVisible);
  const hasMore = items.length > defaultVisible;

  return (
    <div className="mt-8 md:mt-12">
      <div className="space-y-3">
        {visibleItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <article
              key={item.question}
              className={`overflow-hidden rounded-2xl border bg-white transition-shadow duration-200 ${
                isOpen
                  ? 'border-[#5DAFD5]/50 shadow-[0_8px_30px_rgba(41,120,165,0.12)]'
                  : 'border-[#E2EEF5] shadow-sm hover:border-[#5DAFD5]/40 hover:shadow-[0_4px_16px_rgba(41,120,165,0.08)]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span
                  className={`text-base font-bold leading-snug transition-colors duration-150 md:text-lg ${
                    isOpen ? 'text-[#2978A5]' : 'text-[#0C1014]'
                  }`}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                    isOpen
                      ? 'border-[#2978A5] bg-[#2978A5] text-white'
                      : 'border-[#E2EEF5] bg-white text-[#2978A5]'
                  }`}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                  >
                    <path
                      d="M5 1V9M1 5H9"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-sm font-mono leading-relaxed text-[#0C1014] md:text-base">
                    {item.answer}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-[#E2EEF5] bg-white px-5 py-2.5 text-sm font-semibold text-[#2978A5] shadow-sm transition hover:border-[#5DAFD5]/40 hover:text-[#0C1014]"
          >
            {showAll ? 'Show fewer questions' : `Show ${items.length - defaultVisible} more questions`}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className={`transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
