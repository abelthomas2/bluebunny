import type { Metadata } from 'next';
import NavBar from '@/app/components/NavBar';
import HeroSection from './HeroSection';

export const metadata: Metadata = {
  title: 'Sample Report | Blue Bunny Turnover Services',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SampleReportPage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />

        {/* Below hero */}
        <section className="section-shell min-h-[60rem] bg-white" />
      </main>
    </>
  );
}
