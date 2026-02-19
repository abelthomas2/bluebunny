'use client';

import { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqItems: FAQItem[] = [
  {
    question: 'How far in advance do I need to schedule?',
    answer:
      'We sync directly with your calendar, so turnovers are automatically scheduled as soon as a guest books. No manual coordination needed. For one-off deep cleans or initial onboarding, we prefer 48 hours notice when possible.',
  },
  {
    question: 'What happens if my guest checks out late or checks in early?',
    answer:
      'Our cleaners are notified of your official checkout time through the calendar sync. If a late checkout creates a time crunch, we communicate immediately and adjust our arrival window. For early check-ins, we prioritize your property based on the new guest arrival time.',
  },
  {
    question: 'Do I need to provide cleaning supplies?',
    answer:
      'No. Our team brings all professional-grade cleaning solutions, tools, and equipment. You only need to keep guest consumables stocked on-site (toilet paper, paper towels, dish soap, laundry pods, coffee, etc.). We’ll alert you when inventory runs low.',
  },
  {
    question: 'What if something breaks or goes missing during a turnover?',
    answer:
      'Every clean starts with “as-found” photos before we touch anything. If we discover damage or missing items, it’s documented with timestamps and reported within 30 minutes of completing the turnover. This protects both you and your guests.',
  },
  {
    question: 'Can you handle same-day turnovers?',
    answer:
      'Yes. Same-day turnovers are our specialty. As long as there’s enough time between checkout and check-in (typically 3–4 hours minimum for a standard property), we’ll have it guest-ready on schedule.',
  },
  {
    question: 'How do I know the cleaning is actually done?',
    answer:
      'You’ll receive a detailed turnover report with timestamped photos of every room within 30 minutes of lockup. The report includes before and after shots, inventory status, any maintenance notes, and confirmation that all systems are set for guest arrival.',
  },
  {
    question: 'What areas are covered in a standard turnover?',
    answer:
      'Every turnover includes all bedrooms, bathrooms, kitchen, living spaces, dining areas, floors throughout, and outdoor spaces like patios or balconies. We also handle full linen changes, restocking, trash removal, and staging to match your listing photos.',
  },
  {
    question: 'Do you work with property management software?',
    answer:
      'Yes. We integrate with major platforms so turnovers populate automatically based on your reservations. No double-entry, no missed cleans.',
  },
  {
    question: 'What if a guest leaves the place trashed?',
    answer:
      'If our cleaner arrives and finds evidence of a party, excessive damage, or biohazard conditions, they’ll document everything and contact you immediately before proceeding. We’ll provide a damage estimate and can coordinate additional cleaning time if needed, billed separately from your standard turnover rate.',
  },
  {
    question: 'Are your cleaners insured and background checked?',
    answer:
      'All cleaners are fully vetted through our 5-step screening process, which includes background checks, video interviews, hands-on skill assessments, and ongoing quality audits. We also carry liability insurance and ensure every team member is properly trained on our protocols.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="bg-gradient-to-b from-white via-[#F6FBFF] to-white pt-15 md:pt-20 pb-15 md:pb-20 px-4 scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <p className="text-base md:text-lg font-mono uppercase tracking-[0.35em] text-[#2978A5]">
            FAQ
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#0C1014]">
            Answers before you even ask
          </h2>
          <p className="text-base md:text-xl font-mono text-[#0C1014]/80 max-w-3xl mx-auto">
            Everything you need to know about partnering with Blue Bunny for STR turnovers, from scheduling to reporting.
          </p>
        </header>

        <div className="space-y-4">
          {faqItems.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                key={faq.question}
                className={`rounded-3xl px-5 py-4 md:px-6 md:py-6 border transition-all duration-300 ${
                  isOpen
                    ? 'border-[#5DAFD5] bg-white shadow-[0_25px_65px_rgba(12,16,20,0.08)]'
                    : 'border-[#2978A5]/15 bg-white/85 shadow-[0_15px_45px_rgba(12,16,20,0.05)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg md:text-xl font-semibold text-[#0C1014] font-sans">
                    {faq.question}
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2978A5]/40 text-[#2978A5] text-lg font-semibold">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="mt-4 text-base md:text-lg font-mono text-[#0C1014]/80">
                    {faq.answer}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
