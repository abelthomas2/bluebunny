'use client';

import { useState } from 'react';
import Image from 'next/image';
import { track } from '@/app/lib/analytics';

type NavChild = { label: string; href: string };
type NavItem =
  | { label: string; href: string; children?: undefined }
  | { label: string; href?: undefined; children: NavChild[] };

const navItems: NavItem[] = [
  {
    label: 'Why Us',
    children: [
      { label: 'What You Get', href: '#what-pms-get' },
      { label: 'Our Team',     href: '#cleaner-vetting' },
      { label: 'Testimonials', href: '#proof' },
    ],
  },
  {
    label: 'Process',
    children: [
      { label: 'Our Process',  href: '#our-process' },
      { label: 'How It Works', href: '#onboarding-steps' },
    ],
  },
  { label: 'Reporting', href: '#deliverable-report' },
  { label: 'Pricing',   href: '#pricing' },
  { label: 'FAQ',       href: '#faq' },
];

const allLinks: NavChild[] = [
  { label: 'What You Get', href: '#what-pms-get' },
  { label: 'Our Process',  href: '#our-process' },
  { label: 'Reporting',    href: '#deliverable-report' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'How It Works', href: '#onboarding-steps' },
  { label: 'Our Team',     href: '#cleaner-vetting' },
  { label: 'Testimonials', href: '#proof' },
  { label: 'FAQ',          href: '#faq' },
];

export default function NavBar() {
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
            <a href="#pm-hero" className="inline-flex shrink-0 items-center">
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

            {/* Desktop center nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="group relative">
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-[#0C1014] transition hover:text-white"
                    >
                      {item.label}
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        className="mt-px transition-transform duration-200 group-hover:rotate-180"
                      >
                        <path
                          d="M2 3.5L5 6.5L8 3.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="invisible absolute left-0 top-full z-50 mt-1 min-w-[10rem] rounded-xl border border-[#E2EEF5] bg-white py-1.5 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm font-semibold text-[#0C1014] transition hover:bg-[#EEF6FB] hover:text-[#2978A5]"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-semibold text-[#0C1014] transition hover:text-white"
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>

            {/* Desktop right CTAs + support line */}
            <div className="relative hidden lg:flex lg:self-stretch lg:flex-col lg:items-end">
              <div className="flex flex-1 items-center gap-2">
                <a
                  href="tel:9047385631"
                  onClick={() => track('cta_call_tap', { location: 'nav' })}
                  className="whitespace-nowrap rounded-full border border-[#0C1014]/20 bg-white px-4 py-2 text-sm font-semibold text-[#0C1014] transition hover:bg-[#0C1014] hover:text-white"
                >
                  Call/Text: (904) 738-5631
                </a>
                <a
                  href="#pm-hero"
                  onClick={() => track('cta_onboarding_tap', { location: 'nav' })}
                  className="whitespace-nowrap rounded-full border border-[#0C1014] bg-[#2978A5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0C1014]"
                >
                  Request Onboarding
                </a>
              </div>
              <p className="absolute bottom-[0.75rem] right-1 text-right text-xs font-mono font-semibold text-[#0C1014]">
                Daily support 8 AM – 7 PM ET
              </p>
            </div>

            {/* Mobile controls */}
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
                    <path
                      d="M2 2L14 14M14 2L2 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M2 4H14M2 8H14M2 12H14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
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
                {allLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0C1014] transition hover:bg-[#0C1014]/10"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="tel:9047385631"
                  onClick={() => track('cta_call_tap', { location: 'nav' })}
                  className="mt-2 rounded-full border border-[#0C1014]/20 bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#0C1014] transition hover:bg-[#0C1014] hover:text-white"
                >
                  Call/Text: (904) 738-5631
                </a>
                <a
                  href="#pm-onboarding-form"
                  onClick={() => { track('cta_onboarding_tap', { location: 'nav' }); setIsOpen(false); }}
                  className="mt-1 rounded-full border border-[#0C1014] bg-[#2978A5] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0C1014]"
                >
                  Request Onboarding
                </a>
              </nav>
              <p className="mt-3 text-center text-xs font-mono font-semibold text-[#0C1014]">
                Daily support 8 AM - 7 PM ET
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
