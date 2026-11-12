import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PropertyUpdateForm from '@/app/components/PropertyUpdateForm';

export const metadata: Metadata = {
  title: 'Property Update Form | Blue Bunny Turnover Services',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PropertyUpdateFormPage() {
  return (
    <>
      <header className="bg-[#5DAFD5] px-5">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-[5rem] items-center md:h-[7rem]">
            <Link href="/">
              <Image
                src="/banner-logo3.webp"
                alt="Blue Bunny Turnover Services"
                width={900}
                height={300}
                sizes="(min-width: 768px) 228px, 192px"
                unoptimized
                className="h-[3.7rem] w-auto origin-left scale-[1.2] -translate-x-[0.35rem] md:h-19 md:scale-100 md:translate-x-0"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="section-shell min-h-screen bg-[#F4F9FD]">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 px-4 text-center md:mb-12 md:px-0">
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
              Property Update
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0C1014] text-balance md:text-5xl">
              Property Update Form
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm font-mono leading-relaxed text-[#0C1014] md:text-base">
              Use this form to add a property, change the details we have on file for a property, or
              remove a property from service. To cancel or reschedule a single turnover, update your
              booking calendar or contact Blue Bunny directly.
            </p>
          </div>

          <PropertyUpdateForm />
        </div>
      </main>

      <footer className="border-t border-white/5 bg-[#0C1014] px-5 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#5DAFD5] md:text-sm">
              BLUE BUNNY TURNOVER SERVICES
            </p>
            <p className="mt-3 text-sm font-mono text-white/90">
              Vacation Rental Cleaning
            </p>
            <p className="mt-1 text-sm font-mono text-white/75">
              Orlando / Disney Corridor
            </p>
            <p className="mt-2 max-w-xs text-xs font-mono text-white/50">
              Serving Kissimmee, Davenport, ChampionsGate, Four Corners, International Drive, and the greater Orlando area.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm font-mono text-white/75">
            <a href="tel:9047385631" className="transition hover:text-[#5DAFD5]">
              (904) 738-5631
            </a>
            <a href="mailto:hello@gobluebunny.com" className="transition hover:text-[#5DAFD5]">
              hello@gobluebunny.com
            </a>
            <a href="/privacy" className="transition hover:text-[#5DAFD5]">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
