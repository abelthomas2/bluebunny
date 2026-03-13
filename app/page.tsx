import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import NavBar from '@/app/components/NavBar';
import PmOnboardingForm from '@/app/components/PmOnboardingForm';
import FaqAccordion from '@/app/components/FaqAccordion';
import PriceCalculator from '@/app/components/PriceCalculator';
import AddOnsFees from '@/app/components/AddOnsFees';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/app/lib/siteMetadata';

type GooglePlacesV1SearchResponse = {
  places?: Array<{
    name?: string;
  }>;
  error?: {
    message?: string;
  };
};

type GooglePlacesV1Review = {
  rating?: number;
  relativePublishTimeDescription?: string;
  publishTime?: string;
  text?: {
    text?: string;
  };
  originalText?: {
    text?: string;
  };
  authorAttribution?: {
    displayName?: string;
  };
};

type GooglePlacesV1DetailsResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GooglePlacesV1Review[];
  error?: {
    message?: string;
  };
};

type Review = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

type ReviewsData = {
  rating: number | null;
  totalRatings: number | null;
  reviewsUrl: string;
  reviews: Review[];
  error?: string;
};

const BUSINESS_QUERY =
  process.env.GOOGLE_BUSINESS_QUERY ?? 'Blue Bunny Turnover Services Orlando';
const DEFAULT_REVIEWS_URL = `https://www.google.com/search?q=${encodeURIComponent(`${BUSINESS_QUERY} reviews`)}`;
const SEARCH_QUERIES = [
  BUSINESS_QUERY,
  'Blue Bunny Rental Cleaners Orlando',
  'Blue Bunny Turnover Services Orlando',
  'Blue Bunny Turnover Services',
];
const REVIEWS_REVALIDATE_SECONDS = 60 * 60 * 6;
const REVIEWS_TO_SHOW = 3;
const BABYSITTING_IMAGE_POSITION = '50% 65%';
const HERO_CARD_IMAGE_HEIGHT_MOBILE_PX = 150;
const HERO_CARD_IMAGE_HEIGHT_DESKTOP_PX = 180;

const fallbackReviews: Review[] = [
  {
    author: 'Google review placeholder',
    rating: 5,
    text: 'Google reviews will display here after API credentials are configured.',
    relativeTime: 'Placeholder',
  },
  {
    author: 'Google review placeholder',
    rating: 5,
    text: 'This block is reserved for your top operator-focused reviews.',
    relativeTime: 'Placeholder',
  },
];

// ─── Section data ─────────────────────────────────────────────────────────────

const painPoints = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    text: 'Your cleaner no-shows, and you find out when the guest does.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    text: "You're still texting cleaners the night before to confirm tomorrow's turns.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    text: 'A guest reports a dirty unit, and you have no photos, no paper trail, no leverage.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    text: 'Cleaning, laundry, restock, and inspection are all managed separately — by you.',
  },
];

const pmValueCards = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Automatic Scheduling',
    description:
      'We sync with your PMS so turnovers are scheduled the moment a guest books \u2014 no more last-minute cleaner headaches.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: 'Consistent Quality',
    description:
      'Our cleaners follow the same standardized checklist on every property, every time.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    title: 'Actionable Reporting',
    description:
      'A PDF report detailing damage flags, inventory, and action items is delivered to your inbox 30 minutes post-clean. Timestamped before/after photos included.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: 'Scales With You',
    description:
      'Works whether you manage 5 doors or 50. Add properties without adding to your workload.',
  },
];

const reportDeliverables = [
  'Before/after photos by room',
  'Damage and maintenance flags',
  'Missing inventory and low supplies',
  'Completion confirmation with lockup time',
  'Action items for your team',
];

const pricingBaseRows = [
  { component: 'Base fee (kitchen + living)', price: '$50' },
  { component: 'Per bedroom', price: '+ $19' },
  { component: 'Per bathroom', price: '+ $18' },
];

const addOnServices = [
  { label: 'Pool cleaning', detail: '$18 / turn' },
  { label: 'Grill cleaning', detail: '$12 / turn' },
  { label: 'Consumables restock (Blue Bunny-supplied)', detail: '$7 + $4 / bathroom', smallDetail: '$7 + $4 / BA' },
  { label: 'Deep clean (scheduled or as-needed)', detail: '+40% of base price', smallDetail: '+40%' },
];

const situationalFees = [
  {
    label: 'Same-day short-notice fee: $25',
    detail:
      'Applies only when we had no prior PMS or calendar visibility and must complete on the same calendar day as notification. Rare if you share calendar access.',
  },
  {
    label: 'Two-cleaner team dispatch: $50',
    detail:
      'For same-day turnovers on 4+ bedroom properties. Ensures the turn is done on time.',
  },
  {
    label: 'Offsite laundry handling: $10',
    detail:
      'When in-unit appliances are broken or for 4+ bedroom properties. We bag, label, and transport linens to a nearby facility.',
  },
];

const onboardingSteps = [
  {
    title: 'Quick Fit Check',
    description:
      "We\u2019ll start with a 15-minute call covering your portfolio size, service area, property types, and any specific standards or checklists your team uses.",
  },
  {
    title: 'Setup',
    description:
      "We sync with your PMS or calendar, align on your checklist and access workflow, and get supply logistics sorted. You\u2019ll approve everything before we touch a property.",
  },
  {
    title: 'Pilot Turnovers',
    description:
      "We start with a few doors so you can review quality and reporting side by side with your current setup. Scale up when you\u2019re ready.",
  },
];

const cleanerVettingSteps = [
  {
    step: 'STR Experience Required',
    detail: 'STR and hospitality experience required. We screen for relevant background before anything else.',
  },
  {
    step: 'Background Checked and Verified',
    detail:
      'Criminal history, identity verification, and driving record. Not a one-time check — we audit continuously.',
  },
  {
    step: 'Quality-Verified on Our Standards',
    detail:
      "Every cleaner orients to our checklist, reporting tools, and property access protocols. No solo cleans until quality is verified on-site.",
  },
];

const faqItems = [
  {
    question: "What\u2019s your service area?",
    answer:
      'We cover a roughly 30-mile radius from Orlando, including the Disney corridor, Kissimmee, Davenport, ChampionsGate, Four Corners, Lake Buena Vista, and surrounding areas. If you manage properties in this zone, we can almost certainly reach them.',
  },
  {
    question: 'Do you integrate with PMS platforms?',
    answer:
      "We work with any platform that supports iCal export, including Guesty, Hostaway, Hospitable, Lodgify, OwnerRez, and direct Airbnb/VRBO calendars. During setup, we\u2019ll walk through the integration with your specific system.",
  },
  {
    question: 'How far in advance do I need to schedule?',
    answer:
      "You don\u2019t. We sync directly with your PMS or calendar, so cleans are automatically queued as soon as a guest books. There\u2019s nothing to schedule manually. For one-off deep cleans or onboarding setup, we prefer 48 hours notice when possible, but same-day service is available.",
  },
  {
    question: 'Can you handle same-day turnovers?',
    answer:
      'Yes. Same-day cleans are completed within 3.5 hours of checkout. For same-day turnovers on properties with more than 3 bedrooms, we dispatch a two-cleaner team to ensure the unit is guest-ready by check-in.',
  },
  {
    question: 'What happens if a guest checks out late or checks in early?',
    answer:
      "We notify you as soon as our cleaner arrives and encounters the situation. We\u2019ll adjust the cleaning window and keep you updated in real time. If the delay means the turn can\u2019t be completed before check-in, we\u2019ll flag it immediately so your team can coordinate with the incoming guest.",
  },
  {
    question: 'Do you bring supplies?',
    answer:
      "Yes. Our cleaners bring all their own tools and cleaning products. If you\u2019d like us to restock guest consumables (soaps, paper goods, coffee, etc.), we offer an optional consumables program at $7 + $4 per bathroom per turn.",
  },
  {
    question: 'Do you handle linens?',
    answer:
      "Yes. In-unit linen wash and reset is included with every standard clean using the property's washer and dryer. If appliances are broken or the service is same-day on a larger property, we handle offsite laundry for a $10 handling fee.",
  },
  {
    question: 'How do you document damage or missing items?',
    answer:
      'Every service includes a structured photo, damage, and inventory report with timestamped before/after photos. You receive a branded PDF the same day — a complete paper trail for every clean.',
  },
  {
    question: 'How do I know the turnover is done?',
    answer:
      "You\u2019ll receive a completion confirmation as soon as the cleaner locks up, followed by the full property report the same day. No more texting your cleaner to ask if they\u2019re finished.",
  },
  {
    question: "What if I\u2019m not happy with a clean?",
    answer:
      'We offer a free reclean within 5 hours of completion. Photo documentation helps us act fast.',
  },
];

// ─── Google Places helpers ────────────────────────────────────────────────────

function emptyReviewsData(error?: string): ReviewsData {
  return {
    rating: null,
    totalRatings: null,
    reviewsUrl: DEFAULT_REVIEWS_URL,
    reviews: [],
    error,
  };
}

function clampReviewText(text: string, maxLength = 240): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function normalizeReview(review: GooglePlacesV1Review): Review | null {
  const author = review.authorAttribution?.displayName?.trim();
  const text = (review.originalText?.text ?? review.text?.text)?.trim();
  const rating = review.rating;

  if (!author || !text || typeof rating !== 'number') {
    return null;
  }

  return {
    author,
    rating,
    text: clampReviewText(text),
    relativeTime: review.relativePublishTimeDescription?.trim() ?? 'Google review',
  };
}

async function fetchPlaceResourceName(apiKey: string): Promise<string | null> {
  if (process.env.GOOGLE_PLACE_ID) {
    const placeId = process.env.GOOGLE_PLACE_ID.trim();
    return placeId.startsWith('places/') ? placeId : `places/${placeId}`;
  }

  for (const query of SEARCH_QUERIES) {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.name,error',
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 1,
        languageCode: 'en',
      }),
      next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      continue;
    }

    const payload = (await response.json()) as GooglePlacesV1SearchResponse;
    if (payload.error?.message) {
      continue;
    }

    const placeName = payload.places?.[0]?.name ?? null;
    if (placeName) {
      return placeName;
    }
  }

  return null;
}

async function getReviewsData(): Promise<ReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return emptyReviewsData('Missing GOOGLE_PLACES_API_KEY.');
  }

  try {
    const placeResourceName = await fetchPlaceResourceName(apiKey);
    if (!placeResourceName) {
      return emptyReviewsData('Google Places search returned no matching place.');
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/${placeResourceName}?languageCode=en`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'rating,userRatingCount,reviews,googleMapsUri,reviews.rating,reviews.relativePublishTimeDescription,reviews.publishTime,reviews.text,reviews.originalText,reviews.authorAttribution',
        },
        next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
      },
    );

    if (!response.ok) {
      return emptyReviewsData(`Google Places details request failed (${response.status}).`);
    }

    const payload = (await response.json()) as GooglePlacesV1DetailsResponse;
    if (payload.error?.message) {
      return emptyReviewsData(payload.error.message);
    }

    const reviews = (payload.reviews ?? [])
      .map((review, index) => ({
        normalized: normalizeReview(review),
        publishedAtMs: Date.parse(review.publishTime ?? ''),
        index,
      }))
      .filter(
        (entry): entry is { normalized: Review; publishedAtMs: number; index: number } =>
          entry.normalized !== null,
      )
      .sort((a, b) => {
        const aTime = Number.isFinite(a.publishedAtMs) ? a.publishedAtMs : -1;
        const bTime = Number.isFinite(b.publishedAtMs) ? b.publishedAtMs : -1;
        return bTime - aTime || a.index - b.index;
      })
      .map((entry) => entry.normalized)
      .slice(0, REVIEWS_TO_SHOW);

    return {
      rating: typeof payload.rating === 'number' ? payload.rating : null,
      totalRatings: typeof payload.userRatingCount === 'number' ? payload.userRatingCount : null,
      reviewsUrl: payload.googleMapsUri ?? DEFAULT_REVIEWS_URL,
      reviews,
      error: reviews.length === 0 ? 'Google Places returned no review text.' : undefined,
    };
  } catch {
    return emptyReviewsData('Google Places request failed unexpectedly.');
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((star) => (
        <svg
          key={star}
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={star < rounded ? 'text-[#F4B400]' : 'text-[#F4B400]/25'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function SectionAccent() {
  return (
    <div aria-hidden className="mx-auto mb-6 h-0.5 w-10 rounded-full bg-[#5DAFD5]" />
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TurnoverCleaningPage() {
  const reviewsData = await getReviewsData();
  const reviews = reviewsData.reviews.length > 0 ? reviewsData.reviews : fallbackReviews;

  return (
    <div className="min-h-screen bg-[#0C1014]">
      {/* ── Section 01: Navigation ── */}
      <NavBar />

      <main className="bg-white">

        {/* ── Section 02: Hero ── */}
        <section id="pm-hero" className="section-anchor relative overflow-hidden pt-[5.8rem] md:pt-[6.5rem]">
          <div className="absolute inset-0">
            <Image
              src="/banner4.webp"
              alt="Turnover cleaning team preparing a property"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
              quality={80}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C1014]/75 via-[#0C1014]/65 to-[#0C1014]/80" />

          <div className="relative px-5 pt-5 pb-12 md:pt-20 md:pb-24">
            <div className="mx-auto grid max-w-6xl gap-8 md:gap-12 md:grid-cols-[1.1fr_1fr]">
              {/* Left: headline */}
              <div className="flex flex-col rounded-3xl border border-[#E2EEF5] bg-white p-5 shadow-[0_22px_65px_rgba(12,16,20,0.16)] md:px-8 md:pt-5 md:pb-5">
                <p className="text-xs md:text-sm font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5]">
                  SERVING ORLANDO / DISNEY CORRIDOR
                </p>
                <h1 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight text-[#0C1014]">
                  Turnover Cleaning Partner for Vacation Rental Managers
                </h1>
                <div
                  className="relative mt-4 h-[var(--hero-card-image-height-mobile)] overflow-hidden rounded-xl md:h-[var(--hero-card-image-height-desktop)]"
                  style={
                    {
                      ['--hero-card-image-height-mobile' as string]: `${HERO_CARD_IMAGE_HEIGHT_MOBILE_PX}px`,
                      ['--hero-card-image-height-desktop' as string]: `${HERO_CARD_IMAGE_HEIGHT_DESKTOP_PX}px`,
                    } as CSSProperties
                  }
                >
                  <Image
                    src="/banner4.webp"
                    alt="Turnover cleaning team preparing a property"
                    fill
                    sizes="(min-width: 768px) 44rem, 100vw"
                    className="object-cover"
                    style={{ objectPosition: '50% 42%', transform: 'scale(1.12)' }}
                    unoptimized
                  />
                </div>
                <p className="mt-4 text-sm md:text-base font-mono text-[#0C1014] max-w-3xl">
                  Guest-ready properties, on-time same-day turns, and a standardized process &mdash; all without you
                  managing a single cleaner.
                </p>

                <ul className="mt-4 space-y-3">
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
                    <span><strong className="font-bold text-[#0C1014]">Cleaning, Linens, Restock &mdash; One Partner</strong></span>
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

        {/* ── Section 03: Pain Points ── */}
        <section
          id="pain-points"
          className="section-shell section-anchor bg-[#F4F9FD]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">
                If this sounds familiar, you&rsquo;re not alone
              </h2>
            </header>

            <div className="mt-8 md:mt-12 grid gap-5 md:grid-cols-2">
              {painPoints.map((item) => (
                <article
                  key={item.text}
                  className="flex items-start gap-5 rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF6FB] text-[#2978A5]">
                    {item.icon}
                  </div>
                  <p className="text-sm font-mono leading-relaxed text-[#0C1014]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#E2EEF5] bg-white px-6 py-5 text-center shadow-sm">
              <p className="text-sm font-mono leading-relaxed text-[#0C1014]">
                You&rsquo;re spending hours every week coordinating cleaners across your portfolio.
              </p>
            </div>

            <div className="mt-5 md:mt-8 rounded-2xl border-2 border-[#5DAFD5]/50 bg-[#F0F9FF] px-6 py-5 text-center shadow-sm">
              <p className="text-sm font-mono font-semibold leading-relaxed text-[#2978A5]">
                Blue Bunny handles the entire clean, documentation, and reporting &mdash; so you can stop managing cleaners.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 04: Four Pillars ── */}
        <section
          id="what-pms-get"
          className="section-shell section-anchor bg-white"
        >
          <div className="mx-auto max-w-6xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">
                Everything you need to stop babysitting turnovers
              </h2>
            </header>

            <div className="mt-8 md:mt-12 overflow-hidden rounded-2xl shadow-md">
              <Image
                src="/babysitting.webp"
                alt="Freshly turned over living room ready for guests"
                width={1200}
                height={500}
                className="aspect-[2/1] w-full object-cover md:aspect-auto md:h-72"
                style={{ objectPosition: BABYSITTING_IMAGE_POSITION }}
                unoptimized
              />
            </div>

            <div className="mt-6 md:mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {pmValueCards.map((card) => (
                <article
                  key={card.title}
                  className="flex flex-col rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF6FB] text-[#2978A5]">
                    {card.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#0C1014]">{card.title}</h3>
                  <p className="mt-2 grow text-sm font-mono leading-relaxed text-[#0C1014]">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 05: Reporting Showcase ── */}
        <section
          id="deliverable-report"
          className="section-shell section-anchor bg-[#F4F9FD]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">
                Turnover reporting your team can actually use
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-sm font-mono leading-relaxed text-[#0C1014] md:text-base">
                Most cleaners text &ldquo;all done.&rdquo; You&rsquo;ll get a structured report
                with everything your team needs to act before the next guest walks in.
              </p>
            </header>

            <div className="mt-8 md:mt-12 grid gap-5 md:grid-cols-2">
              {/* Mock report visual */}
              <div className="rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm">
                <div className="rounded-xl border border-[#E2EEF5] bg-[#F4F9FD] p-4">
                  <div className="flex items-center justify-between rounded-lg bg-[#EEF6FB] px-3.5 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#2978A5] md:text-[11px]">
                      Sample Turnover Report (placeholder screenshot)
                    </p>
                    <span className="rounded-full bg-[#2978A5] px-2.5 py-1 text-[10px] font-bold text-white">
                      Complete
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="h-16 rounded-lg bg-[#DAE8F4] blur-[1px]" />
                      <div className="h-16 rounded-lg bg-[#DAE8F4] blur-[1px]" />
                    </div>
                    <div className="h-2 rounded bg-[#DAE8F4]" />
                    <div className="h-2 w-10/12 rounded bg-[#DAE8F4]" />
                    <div className="h-2 w-8/12 rounded bg-[#DAE8F4]" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-11 rounded-lg bg-[#DAE8F4] blur-[0.5px]" />
                      <div className="h-11 rounded-lg bg-[#DAE8F4] blur-[0.5px]" />
                      <div className="h-11 rounded-lg bg-[#DAE8F4] blur-[0.5px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              <div className="flex flex-col rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm">
                <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
                  Every report includes:
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {reportDeliverables.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-[#E2EEF5] bg-[#F4F9FD] px-4 py-3 text-sm font-mono text-[#0C1014]"
                    >
                      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5DAFD5]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
                  Delivered 30 minutes post-turn.
                </p>
                <a
                  href="#pm-onboarding-form"
                  className="mt-5 inline-flex w-fit items-center rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:hidden"
                >
                  Request Onboarding
                </a>
                <a
                  href="#pm-hero"
                  className="mt-5 hidden w-fit items-center rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:inline-flex"
                >
                  Request Onboarding
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 06: Pricing ── */}
        <section
          id="pricing"
          className="section-shell section-anchor bg-white"
        >
          <div className="mx-auto max-w-6xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">
                Transparent pricing. No surprises.
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-sm font-mono leading-relaxed text-[#0C1014] md:text-base">
                Every turnover is priced by bedroom and bathroom count. You&rsquo;ll know the cost
                before we show up.
              </p>
            </header>

            {/* Base Turnover Pricing — full width */}
            <div className="mt-8 md:mt-12 rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm">
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
                Base Turnover Pricing
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {pricingBaseRows.map((row) => (
                  <div
                    key={row.component}
                    className="flex flex-col rounded-xl border border-[#E2EEF5] bg-[#F4F9FD] px-5 py-4"
                  >
                    <span className="text-xs font-mono text-[#0C1014] leading-snug">{row.component}</span>
                    <span className="mt-2 text-xl font-bold text-[#2978A5] md:text-2xl">{row.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-[#E2EEF5] bg-[#F0F9FF] px-5 py-4">
                <p className="text-sm font-mono text-[#0C1014]">
                  <span className="font-bold text-[#0C1014]">Example:</span> A standard 3 BR / 2 BA
                  turnover = $50 + (3 &times; $19) + (2 &times; $18) ={' '}
                  <span className="font-bold text-[#2978A5]">$143</span>
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E2EEF5] bg-white px-6 py-4">
              <p className="text-sm font-mono text-[#0C1014]">
                Simple weekly invoicing, net-7 terms. No upfront deposits, no long-term contracts.
              </p>
            </div>

            <AddOnsFees addOnServices={addOnServices} situationalFees={situationalFees} />

            <PriceCalculator />

            {/* Quality Guarantee */}
            <div className="mt-5 md:mt-6 flex items-center gap-5 rounded-2xl border-2 border-[#5DAFD5]/50 bg-[#F0F9FF] px-6 py-5 shadow-sm">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2978A5] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p className="text-sm font-mono font-semibold leading-relaxed text-[#2978A5]">
                Free reclean within 5 hours if the property doesn&rsquo;t meet guest-ready standards.
              </p>
            </div>

            <div className="mt-6 md:mt-8 flex justify-center">
              <a
                href="#pm-onboarding-form"
                className="rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:hidden"
              >
                Request Onboarding
              </a>
              <a
                href="#pm-hero"
                className="hidden rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:inline-flex"
              >
                Request Onboarding
              </a>
            </div>
          </div>
        </section>

        {/* ── Section 07: Onboarding Steps ── */}
        <section
          id="onboarding-steps"
          className="section-shell section-anchor bg-[#F4F9FD]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">
                Onboard in days — not weeks
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-sm font-mono leading-relaxed text-[#0C1014] md:text-base">
                Start cleaning within 72 hours of your first call.
              </p>
            </header>

            <div className="mt-8 md:mt-12 grid gap-5 md:grid-cols-3">
              {onboardingSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="flex flex-col rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2978A5] font-mono text-sm font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#0C1014]">{step.title}</h3>
                  <p className="mt-2 grow text-sm font-mono leading-relaxed text-[#0C1014]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#pm-onboarding-form"
                className="rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:hidden"
              >
                Request Onboarding
              </a>
              <a
                href="#pm-hero"
                className="hidden rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:inline-flex"
              >
                Request Onboarding
              </a>
              <a
                href="tel:4077731724"
                className="rounded-full border border-[#0C1014]/20 bg-white px-6 py-3 text-sm font-semibold text-[#0C1014] shadow-sm transition hover:bg-[#0C1014] hover:text-white"
              >
                <span className="min-[376px]:hidden">Call: (407) 773-1724</span>
                <span className="hidden min-[376px]:inline">Call/Text: (407) 773-1724</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Section 08: Cleaner Vetting ── */}
        <section
          id="cleaner-vetting"
          className="section-shell section-anchor bg-white"
        >
          <div className="mx-auto max-w-5xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">
                A vetted team that protects your brand
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-sm font-mono leading-relaxed text-[#0C1014] md:text-base">
                Your cleaners have access to your properties, your guests&rsquo; belongings, and
                your reputation. We carry general liability insurance and a janitorial bond.
              </p>
            </header>

            <div className="mt-8 md:mt-12 overflow-hidden rounded-2xl shadow-md">
              <Image
                src="/vetting.webp"
                alt="Blue Bunny vetted cleaning team at work"
                width={1200}
                height={500}
                className="aspect-[2/1] w-full object-cover object-[center_47%] md:aspect-auto md:h-72"
                unoptimized
              />
            </div>

            <p className="mt-6 md:mt-10 pl-2 text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
              Our standards:
            </p>

            <ol className="mt-4 flex flex-col gap-5">
              {cleanerVettingSteps.map((item, index) => (
                <li
                  key={item.step}
                  className="flex items-start gap-4 rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2978A5] font-mono text-sm font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0C1014]">{item.step}</p>
                    <p className="mt-1 text-sm font-mono leading-relaxed text-[#0C1014]">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 md:mt-8 flex items-center gap-5 rounded-2xl border-2 border-[#5DAFD5]/50 bg-[#F0F9FF] px-6 py-5 shadow-sm">
              <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2978A5] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
              </span>
              <p className="text-sm font-mono font-semibold leading-relaxed text-[#2978A5]">
                We keep backup cleaners ready and remove underperformers before issues reach your guests.
              </p>
            </div>

            <div className="mt-6 md:mt-8 flex justify-center">
              <a
                href="#pm-onboarding-form"
                className="rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:hidden"
              >
                Request Onboarding
              </a>
              <a
                href="#pm-hero"
                className="hidden rounded-full bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] md:inline-flex"
              >
                Request Onboarding
              </a>
            </div>
          </div>
        </section>

        {/* ── Section 09: Social Proof ── */}
        <section
          id="proof"
          className="section-shell section-anchor bg-[#F4F9FD]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">
                What our clients are saying
              </h2>
            </header>

            {/* Rating bar */}
            <div className="mt-8 md:mt-12 flex flex-col gap-5 rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
              <div className="space-y-1.5">
                {reviewsData.rating !== null ? (
                  <>
                    <StarRow rating={reviewsData.rating} />
                    <p className="text-xl font-bold text-[#0C1014]">
                      {reviewsData.rating.toFixed(1)} Google rating
                      {reviewsData.totalRatings !== null
                        ? ` · ${reviewsData.totalRatings} reviews`
                        : ''}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-[#0C1014]">Google ratings module</p>
                    <p className="text-sm font-mono text-[#0C1014]">
                      Live rating/count appear here when Google data is available.
                    </p>
                  </>
                )}
              </div>
              <a
                href={reviewsData.reviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full justify-center rounded-full bg-[#2978A5] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#0C1014] md:w-auto"
              >
                View all Google reviews
              </a>
            </div>

            <p className="mt-5 md:mt-8 pl-2 text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5] md:text-sm">
              Recent Reviews:
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 3).map((review, index) => (
                <article
                  key={`${review.author}-${index}`}
                  className="flex flex-col rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#0C1014]">
                        <span className="hidden md:inline lg:hidden">
                          {review.author.length > 12 ? `${review.author.slice(0, 12)}…` : review.author}
                        </span>
                        <span className="inline md:hidden lg:inline">
                          {review.author.length > 18 ? `${review.author.slice(0, 18)}...` : review.author}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs font-mono text-[#0C1014]/75">
                        {review.relativeTime}
                      </p>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="mt-3 grow text-sm font-mono leading-relaxed text-[#0C1014]">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 10: FAQ ── */}
        <section
          id="faq"
          className="section-shell section-anchor bg-white"
        >
          <div className="mx-auto max-w-6xl">
            <header className="px-4 text-center md:px-0">
              <SectionAccent />
              <h2 className="text-3xl font-bold tracking-tight text-[#0C1014] md:text-5xl">FAQ</h2>
            </header>
            <FaqAccordion items={faqItems} />
          </div>
        </section>

        {/* ── Section 11: Final CTA ── */}
        <section
          id="final-cta"
          className="section-shell section-anchor bg-[#5DAFD5]"
        >
          <div className="mx-auto max-w-5xl text-center text-white">
            <h2 className="px-4 text-3xl font-bold tracking-tight md:px-0 md:text-5xl">
              Ready for turnovers you don&rsquo;t have to think about?
            </h2>
            <ul className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3">
              {['Reporting after every clean', 'Calendar-synced scheduling', 'Same-day turns supported'].map((pill) => (
                <li
                  key={pill}
                  className="rounded-full border border-white/25 bg-white/15 px-5 py-2.5 text-sm font-mono font-semibold text-white"
                >
                  {pill}
                </li>
              ))}
            </ul>

            <p className="mx-auto mt-5 max-w-3xl px-4 text-sm font-mono leading-relaxed text-white/90 md:px-0">
              Check if we have availability in your area.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#pm-onboarding-form"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5DAFD5] shadow-sm transition hover:bg-[#0C1014] hover:text-white md:hidden"
              >
                Request Onboarding
              </a>
              <a
                href="#pm-hero"
                className="hidden rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5DAFD5] shadow-sm transition hover:bg-[#0C1014] hover:text-white md:inline-flex"
              >
                Request Onboarding
              </a>
              <a
                href="tel:4077731724"
                className="rounded-full border border-[#0C1014] bg-[#0C1014] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#0C1014]"
              >
                <span className="min-[376px]:hidden">Call: (407) 773-1724</span>
                <span className="hidden min-[376px]:inline">Call/Text: (407) 773-1724</span>
              </a>
            </div>

            <p className="mt-6 text-xs font-mono text-white">
              Orlando / Disney corridor
            </p>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-[#0C1014] px-5 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-[#5DAFD5] md:text-sm">
              BLUE BUNNY TURNOVER SERVICES
            </p>
            <p className="mt-3 text-sm font-mono text-white/90">
              Vacation Rental Turnover Cleaning
            </p>
            <p className="mt-1 text-sm font-mono text-white/75">
              Orlando / Disney Corridor
            </p>
            <p className="mt-2 max-w-xs text-xs font-mono text-white/50">
              Serving Kissimmee, Davenport, ChampionsGate, Four Corners, International Drive, and the greater Orlando area.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm font-mono text-white/75">
            <a href="tel:4077731724" className="transition hover:text-[#5DAFD5]">
              407-773-1724
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
    </div>
  );
}
