import type { Metadata } from 'next';
import Image from 'next/image';
import FaqAccordion from '@/app/components/FaqAccordion';
import SampleHeader from './SampleHeader';
import SmoothScroll from './SmoothScroll';
import TrackedVideo from './TrackedVideo';
import PhotoAlbum from './PhotoAlbum';
import PilotForm from './PilotForm';
import TrackedLink from '@/app/components/TrackedLink';

// ── Constants ───────────────────────────────────────────────────────────────
const PHONE_DISPLAY = '(904) 738-5631';
const PHONE_TEL = '+19047385631';
const EMAIL = 'hello@gobluebunny.com';
// Same target style the main site falls back to; owner can swap for the exact Maps URL.
const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=Blue+Bunny+Turnover+Services+Orlando+reviews';

const OG_DESCRIPTION =
  'A real vacation rental turnover from arrival to lockup — 41 timestamped before & after photos, a maintenance flag, and the full report in 30 minutes.';
// Single source of truth for the page title — homepage style: "<phrase> | Blue Bunny".
const PAGE_TITLE = 'Sample Turnover Report | Blue Bunny';

const HERO_META =
  '1847 Champions Gate Blvd, Davenport, FL · 1 BR / 1 BA · Turned April 28, 2026 · On-site 11:05 AM – 1:12 PM';

// ▼▼▼ TWEAK ME ▼▼▼ Gap between navbar and hero card (navbar = 4rem mobile, 5rem desktop)
const HERO_TOP_GAP_MOBILE  = '7rem'; // navbar 5rem + py-8 2rem
const HERO_TOP_GAP_DESKTOP = '9rem';   // 9 - 5 = 4rem visible gap on desktop

const VIDEO_CAPTION =
  "First — three minutes on how the report you're holding gets made.";

const TURN_STATS = [
  { value: '41', label: 'Timestamped photos' },
  { value: '1', label: 'Maintenance flag' },
  { value: '2 hr 7 min', label: 'On-site' },
  { value: '30 min', label: 'Report after lockup' },
];

const ALBUM_INTRO =
  'As-found photos are taken the moment we arrive, before anything is touched. Post-turn photos are taken once the unit is guest-ready. Timestamps on everything — tap any photo to zoom.';

const FLAG_ASSESSMENT =
  'Baseboard pulling away from wall near tub apron. Possible moisture intrusion. Pre-existing. Recommend maintenance inspection.';
const FLAG_BODY =
  'Our cleaner spotted it, photographed it, and flagged it. Our software read the photo, wrote the assessment, rated the severity, and put it in the report — before the report ever hit the inbox. No surprises a guest finds first.';

const LOCKUP_STEPS = [
  {
    title: 'Documented during the turn',
    body: 'As-found photos at arrival. Post-turn photos at lockup. Flags, linen condition, and supply counts logged as they happen.',
  },
  {
    title: 'Assembled by software',
    body: 'Photos, damage assessments, inventory, and lockup confirmation become one structured report. Same format, every cleaner, every property.',
  },
  {
    title: 'Delivered in 30 minutes',
    body: "The full report lands in your inbox within 30 minutes of lockup. The page you're holding is the printout.",
  },
];

const REPORT_INCLUDES = [
  'Before/after photos by room',
  'Damage & maintenance flags',
  'Low-supply alerts',
  'Linen condition',
  'Lockup confirmation',
  'Action items',
];

const PILOT_BODY =
  "Pick a few doors. We'll run turnovers on them while your current setup keeps the rest. Compare the reports side by side — and scale up only if we earn it.";
const PILOT_SUPPORT = [
  'Live within 72 hours of your first call',
  "Free reclean within 5 hours if it's not guest-ready",
  'Weekly invoicing, net-7. No deposits.',
];

const REVIEW_QUOTE =
  'Love that they send us detailed reports after every clean, gives us great peace of mind.';

const FAQ_ITEMS = [
  {
    question: 'Is this a real turnover?',
    answer:
      'It’s a real clean of a real unit — a property we use to demonstrate our process end to end. Every photo, timestamp, and flag was produced exactly the way it is on live client turns.',
  },
  {
    question: 'Do you integrate with my PMS?',
    answer:
      'We work with any platform that supports iCal export — Guesty, Hostaway, Hospitable, Lodgify, OwnerRez, and direct Airbnb/VRBO calendars. Turns are queued automatically the moment a guest books.',
  },
  {
    question: 'Can you handle same-day turnovers?',
    answer:
      'Yes. Same-day cleans are completed within 3.5 hours of checkout. Properties over 3 bedrooms get a two-cleaner team.',
  },
  {
    question: 'What happens after I reach out?',
    answer:
      'A 15-minute fit check call, then setup — calendar sync, your checklist, access workflow — and your first pilot turns within 72 hours.',
  },
];

// ── Metadata (build spec §10) ─────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL('https://gobluebunny.com'),
  title: PAGE_TITLE,
  description: OG_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: PAGE_TITLE,
    description: OG_DESCRIPTION,
    type: 'website',
    images: [{ url: '/newbannerforbothpages.png', width: 2400, height: 1257 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: OG_DESCRIPTION,
    images: ['/newbannerforbothpages.png'],
  },
};

// ── Shared bits ───────────────────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
      {children}
    </p>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-[#2978A5]"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function SampleReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const waveParam = params?.w;
  const wave = Array.isArray(waveParam) ? waveParam[0] : waveParam;

  return (
    <div className="bg-[#F4F9FD]">
      <style>{`@media(min-width:1024px){#top{padding-top:${HERO_TOP_GAP_DESKTOP}!important}}`}</style>
      <SmoothScroll />
      <SampleHeader />

      <main>
        {/* 1 — Confirmation hero */}
        <section
          id="top"
          className="section-anchor bg-[#F4F9FD] px-5 md:pb-16"
          style={{ paddingTop: HERO_TOP_GAP_MOBILE, paddingBottom: '2rem' }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm md:p-8">
              <Eyebrow>Sample Report · Full Photo Album</Eyebrow>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0C1014] md:text-4xl">
                Every photo from that turn.
              </h1>
              <p className="mt-4 font-mono text-sm leading-relaxed text-[#0C1014]/70 md:text-base">
                {HERO_META}
              </p>
              <a
                href="#album"
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
              >
                Skip to the album <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2 — Promo video */}
        <section id="video" className="section-shell section-anchor bg-white">
          <div className="mx-auto max-w-6xl">
            <p className="mx-auto max-w-3xl px-4 text-center font-mono text-sm leading-relaxed text-[#0C1014] md:px-0 md:text-base">
              {VIDEO_CAPTION}
            </p>
            <div className="mt-5">
              <TrackedVideo />
            </div>
            <p className="mt-4 text-center">
              <a
                href="#album"
                className="font-mono text-sm font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
              >
                Or go straight to the photos <span aria-hidden>↓</span>
              </a>
            </p>
          </div>
        </section>

        {/* 3 — Turn stats strip */}
        <section className="bg-[#F4F9FD] px-5 py-8 md:py-10">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
            {TURN_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#E2EEF5] bg-white px-4 py-4 text-center"
              >
                <span className="font-mono text-xl font-bold leading-none text-[#0C1014] md:text-2xl">
                  {stat.value}
                </span>
                <span className="mt-1.5 font-mono text-xs leading-snug text-[#0C1014]/60">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 4 — Photo album */}
        <section id="album" className="section-shell section-anchor bg-white">
          <div className="mx-auto max-w-6xl">
            <header className="section-header-stack px-4 text-center md:px-0">
              <Eyebrow>As-found &amp; post-turn</Eyebrow>
              <h2 className="text-2xl font-bold tracking-tight text-[#0C1014] md:text-4xl">
                The full album, exactly as documented.
              </h2>
              <p className="mx-auto max-w-3xl font-mono text-sm leading-relaxed text-[#0C1014] md:text-base">
                {ALBUM_INTRO}
              </p>
            </header>
            <PhotoAlbum />
          </div>
        </section>

        {/* 5 — Maintenance flag spotlight */}
        <section id="flag" className="section-shell section-anchor bg-[#F4F9FD]">
          <div className="mx-auto max-w-6xl">
            <header className="section-header-stack px-4 text-center md:px-0">
              <Eyebrow>Maintenance flags</Eyebrow>
              <h2 className="text-2xl font-bold tracking-tight text-[#0C1014] md:text-4xl">
                Your cleaner hands you a photo. Our software hands you an answer.
              </h2>
            </header>

            <div className="mt-8 overflow-hidden rounded-2xl border-2 border-[#DC2726]/30 bg-white shadow-sm md:mt-10 md:grid md:grid-cols-[40%_60%]">
              <Image
                src="/samplereport/flag-baseboard.jpg"
                alt="Bathroom, maintenance flag, 11:13 AM — baseboard separating from wall near tub apron"
                width={1200}
                height={900}
                sizes="(max-width: 768px) 100vw, 40vw"
                className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-full"
              />
              <div className="p-5 md:p-6">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#DC2726]">
                  Maintenance flag
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-[#0C1014]">
                  Baseboard separation — Bathroom
                </h3>
                <p className="mt-3 font-mono text-sm leading-relaxed text-[#0C1014]">
                  {FLAG_ASSESSMENT}
                </p>
                <p className="mt-3 font-mono text-xs text-[#0C1014]/60">
                  Severity: Low · Logged 11:13 AM
                </p>
              </div>
            </div>

            <p className="mt-6 px-2 font-mono text-sm leading-relaxed text-[#0C1014] md:mx-auto md:max-w-3xl md:px-0 md:text-base">
              {FLAG_BODY}
            </p>
          </div>
        </section>

        {/* 6 — Lockup to inbox */}
        <section className="section-shell section-anchor bg-white">
          <div className="mx-auto max-w-6xl">
            <header className="section-header-stack px-4 text-center md:px-0">
            <h2 className="text-2xl font-bold tracking-tight text-[#0C1014] md:text-4xl">
              From lockup to your inbox in 30 minutes.
            </h2>
          </header>

            <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
              {LOCKUP_STEPS.map((step, index) => (
                <article
                  key={step.title}
                  className="flex flex-col rounded-2xl border border-[#E2EEF5] bg-white p-5 shadow-sm"
                >
                  <span className="font-mono text-lg font-bold text-[#5DAFD5]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 font-bold text-[#0C1014]">{step.title}</h3>
                  <p className="mt-2 font-mono text-sm leading-relaxed text-[#0C1014]">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-6 text-center">
              <TrackedLink
                href="/sample-report.pdf"
                download="blue-bunny-sample-turnover-report.pdf"
                event="pdf_download"
                className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
              >
                Download the sample report as a PDF <span aria-hidden>→</span>
              </TrackedLink>
            </p>

            <p className="mt-8 text-center font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#2978A5]">
              Every report includes
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {REPORT_INCLUDES.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#E2EEF5] bg-[#F4F9FD] px-3 py-1.5 font-mono text-xs text-[#0C1014]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 7 — Pilot offer + form */}
        <section id="pilot" className="section-shell section-anchor bg-[#F4F9FD]">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border-2 border-[#5DAFD5]/50 bg-[#F0F9FF] p-5 shadow-sm md:p-8">
              <div className="grid gap-8 lg:grid-cols-2" style={{ alignItems: 'stretch' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Eyebrow>No contracts. No commitments.</Eyebrow>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0C1014] md:text-4xl">
                    Pilot us on 3–5 properties.
                  </h2>
                  <p className="mt-4 font-mono text-sm leading-relaxed text-[#0C1014] md:text-base">
                    {PILOT_BODY}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {PILOT_SUPPORT.map((point) => (
                      <li key={point} className="flex items-start gap-3 font-mono text-sm text-[#0C1014]">
                        <CheckIcon />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ flex: '1 1 0%' }} aria-hidden />
                  <p className="mt-6 hidden font-mono text-xs leading-relaxed text-[#0C1014]/80 lg:block lg:text-sm">
                    Prefer to talk first?{' '}
                    <TrackedLink
                      href={`tel:${PHONE_TEL}`}
                      event="cta_call_tap"
                      eventProps={{ location: 'talk-first' }}
                      className="font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
                    >
                      Call or text {PHONE_DISPLAY}
                    </TrackedLink>{' '}
                    — you&apos;ll reach Abel, the owner, not a call center. Or email{' '}
                    <TrackedLink
                      href={`mailto:${EMAIL}`}
                      event="cta_email_tap"
                      eventProps={{ location: 'talk-first' }}
                      className="font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
                    >
                      {EMAIL}
                    </TrackedLink>
                    .
                  </p>
                </div>

                <div><PilotForm wave={wave} /></div>
              </div>

              {/* Mobile: paragraph below the form */}
              <p className="mt-6 font-mono text-xs leading-relaxed text-[#0C1014]/80 lg:hidden">
                Prefer to talk first?{' '}
                <TrackedLink
                  href={`tel:${PHONE_TEL}`}
                  event="cta_call_tap"
                  eventProps={{ location: 'talk-first' }}
                  className="font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
                >
                  Call or text {PHONE_DISPLAY}
                </TrackedLink>{' '}
                — you&apos;ll reach Abel, the owner, not a call center. Or email{' '}
                <TrackedLink
                  href={`mailto:${EMAIL}`}
                  event="cta_email_tap"
                  eventProps={{ location: 'talk-first' }}
                  className="font-semibold text-[#2978A5] transition hover:text-[#0C1014]"
                >
                  {EMAIL}
                </TrackedLink>
                .
              </p>
            </div>
          </div>
        </section>

        {/* 8 — Trust strip */}
        <section className="section-shell section-anchor bg-white">
          <div className="mx-auto max-w-6xl space-y-5">
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 transition hover:opacity-80"
            >
              <span className="font-bold text-[#0C1014]">Rated 5.0 on Google</span>
              <span aria-hidden className="text-lg text-[#F4B400]">
                ★★★★★
              </span>
            </a>

            <blockquote className="mx-auto max-w-3xl rounded-2xl border border-[#E2EEF5] bg-[#F4F9FD] p-6 text-center">
              <p className="font-mono text-sm italic leading-relaxed text-[#0C1014] md:text-base">
                “{REVIEW_QUOTE}”
              </p>
              <footer className="mt-3 font-mono text-xs text-[#0C1014]/60">
                — Laura C., Google review
              </footer>
            </blockquote>

            <p className="text-center font-mono text-xs text-[#0C1014] md:text-sm">
              Insured · Bonded · Vetted cleaners
            </p>
            <p className="text-center font-mono text-xs leading-relaxed text-[#0C1014]/70 md:text-sm">
              Serving the Orlando / Disney corridor — Kissimmee, Davenport, ChampionsGate, Four
              Corners, Lake Buena Vista
            </p>
          </div>
        </section>

        {/* 9 — Mini-FAQ */}
        <section className="section-shell section-anchor bg-[#F4F9FD]">
          <div className="mx-auto max-w-6xl">
            <header className="section-header-stack px-4 text-center md:px-0">
              <h2 className="text-2xl font-bold tracking-tight text-[#0C1014] md:text-4xl">FAQ</h2>
            </header>
            <FaqAccordion items={FAQ_ITEMS} defaultVisible={4} />
          </div>
        </section>
      </main>

      {/* 10 — Footer */}
      <footer className="border-t border-white/5 bg-[#0C1014] px-5 pb-28 pt-12 text-white md:pb-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#5DAFD5] md:text-sm">
              Blue Bunny Turnover Services
            </p>
            <p className="mt-3 font-mono text-sm text-white/90">Vacation Rental Cleaning</p>
            <p className="mt-1 font-mono text-sm text-white/75">Orlando / Disney Corridor</p>
            <p className="mt-3 max-w-xs font-mono text-xs text-white/50">
              Full pricing, SOP, and FAQ at{' '}
              <a href="https://gobluebunny.com" className="text-white/75 transition hover:text-[#5DAFD5]">
                gobluebunny.com
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col gap-2 font-mono text-sm text-white/75">
            <TrackedLink
              href={`tel:${PHONE_TEL}`}
              event="cta_call_tap"
              eventProps={{ location: 'footer' }}
              className="transition hover:text-[#5DAFD5]"
            >
              {PHONE_DISPLAY}
            </TrackedLink>
            <TrackedLink
              href={`mailto:${EMAIL}`}
              event="cta_email_tap"
              eventProps={{ location: 'footer' }}
              className="transition hover:text-[#5DAFD5]"
            >
              {EMAIL}
            </TrackedLink>
            <a href="/privacy" className="transition hover:text-[#5DAFD5]">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
