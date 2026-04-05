import type { Metadata } from 'next';
import Image from 'next/image';
import PropertyInformationForm from '@/app/components/PropertyInformationForm';

export const metadata: Metadata = {
  title: 'Property Information Form | Blue Bunny Turnover Services',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PropertyInformationFormPage() {
  return (
    <>
      <header className="bg-[#5DAFD5] px-5">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-[5rem] items-center md:h-[7rem]">
            <a href="/">
              <Image
                src="/banner-logo3.webp"
                alt="Blue Bunny Turnover Services"
                width={900}
                height={300}
                sizes="(min-width: 768px) 228px, 192px"
                unoptimized
                className="h-[3.7rem] w-auto origin-left scale-[1.2] -translate-x-[0.35rem] md:h-19 md:scale-100 md:translate-x-0"
              />
            </a>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-[#F4F9FD] px-5 pt-10 pb-20 md:pt-14 md:pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 px-4 text-center md:mb-10 md:px-0">
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5]">
              Onboarding
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight text-[#0C1014] text-balance">
              Property Information Form
            </h1>
            <p className="mt-4 mx-auto max-w-xl text-sm md:text-base font-mono text-[#0C1014]/60 leading-relaxed">
              Complete this form for each property before your first scheduled turnover. Keep this
              information current — notify Blue Bunny promptly of any changes.
            </p>
          </div>

          <PropertyInformationForm />
        </div>
      </main>
    </>
  );
}
