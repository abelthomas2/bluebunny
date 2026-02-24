import type { Metadata } from 'next';
import Image from 'next/image';
import PmOnboardingForm from '@/app/components/PmOnboardingForm';
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

const pmValueCards = [
  {
    title: 'Reporting + proof',
    description:
      'Timestamped photos + turnover report fast after lockup — so your team can act before check-in.',
  },
  {
    title: 'Scheduling reliability',
    description: 'Calendar-synced scheduling reduces missed cleans and last-minute texting.',
  },
  {
    title: 'Quality consistency',
    description: 'Repeatable checklists + a standardized method on every property.',
  },
  {
    title: 'Scale support',
    description: 'Works whether you manage one listing or twenty — without adding ops overhead.',
  },
];

const reportDeliverables = [
  'Before/after photos by room',
  'Damage + maintenance flags',
  'Missing inventory / low supplies',
  'Completion confirmation (lockup)',
  'Action items for your team',
];

const onboardingSteps = [
  {
    title: 'Quick fit check (10-15 min call)',
    description: 'Portfolio size, service area, and standards.',
  },
  {
    title: 'Setup',
    description: 'Calendar sync + checklist alignment + access and supply workflow.',
  },
  {
    title: 'Pilot turnovers',
    description: 'Review quality + reporting, then scale.',
  },
];

const cleanerVettingSteps = [
  'Online application (STR/hospitality background)',
  'Phone screen',
  'Video interview (real scenarios)',
  'Orientation (shadowing + protocols)',
  'Background check + ongoing audits',
];

const faqItems = [
  {
    question: 'How far in advance do I need to schedule?',
    answer:
      'We sync directly with your calendar, so turnovers are automatically scheduled as soon as a guest books. For one-off services and onboarding setup, we prefer 48 hours notice when possible.',
  },
  {
    question: 'Can you handle same-day turnovers?',
    answer:
      'Yes. Same-day turnovers are supported when checkout and check-in windows allow enough cleaning time (typically 3-4 hours minimum for a standard property).',
  },
  {
    question: 'What happens if my guest checks out late or checks in early?',
    answer:
      'If the timeline changes, we adjust arrival priority based on the updated check-in target.',
  },
  {
    question: 'Do you bring supplies?',
    answer:
      'We bring professional tools and cleaning products. You may also choose to enroll in the Blue Bunny Consumables program, in which we supply basic consumables like trash bags, paper towels, soap, laundry pods, and similar items.',
  },
  {
    question: 'How do you document damage or missing items?',
    answer:
      'Every clean starts with as-found photos. Damage or missing inventory is captured with timestamps and included in the turnover report within 30 minutes of lockup.',
  },
  {
    question: 'How do I know the turnover is done?',
    answer:
      'You receive timestamped photos and completion confirmation after lockup, plus action items your team can route immediately.',
  },
  {
    question: 'Do you integrate with PMS platforms?',
    answer:
      'Yes. We support major systems and iCal workflows so your team avoids double-entry and missed turnovers.',
  },
];

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
      .filter((entry): entry is { normalized: Review; publishedAtMs: number; index: number } => entry.normalized !== null)
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

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((star) => (
        <span key={star} aria-hidden className={star < rounded ? 'text-[#F4B400]' : 'text-[#F4B400]/30'}>
          ★
        </span>
      ))}
    </div>
  );
}

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default async function TurnoverCleaningPage() {
  const reviewsData = await getReviewsData();
  const reviews = reviewsData.reviews.length > 0 ? reviewsData.reviews : fallbackReviews;

  return (
    <div className="min-h-screen bg-[#0C1014]">
      <header
        className="fixed inset-x-0 top-0 z-50 border-b border-[#2978A5] bg-[#5DAFD5]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto max-w-6xl px-5 py-3 md:py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <a href="#pm-hero" className="inline-flex items-center">
              <Image
                src="/banner-logo.png"
                alt="Blue Bunny Turnover Services Logo"
                width={900}
                height={300}
                sizes="(min-width: 768px) 228px, 192px"
                priority
                unoptimized
                className="h-[3.7rem] w-auto origin-left scale-[1.2] -translate-x-[0.35rem] -translate-y-1 md:h-19 md:scale-100 md:translate-x-0 md:translate-y-0"
              />
            </a>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="flex w-full items-center gap-2 md:w-auto md:flex-wrap">
                <a
                  href="tel:6465049590"
                  className="flex-1 whitespace-nowrap rounded-full border border-[#0C1014]/20 bg-white px-3 py-[7px] text-center text-[12px] font-semibold text-[#0C1014] transition hover:bg-[#0C1014] hover:text-white md:flex-none md:px-4 md:py-2 md:text-sm"
                >
                  <span className="md:hidden">Call/Text: (646) 504-9590</span>
                  <span className="hidden md:inline">Call/Text Ops Line: 646-504-9590</span>
                </a>
                <a
                  href="#pm-onboarding-form"
                  className="flex-1 whitespace-nowrap rounded-full border border-[#0C1014] bg-[#2978A5] px-3 py-[7px] text-center text-[12px] font-semibold text-white transition hover:bg-[#0C1014] md:flex-none md:px-4 md:py-2 md:text-sm"
                >
                  <span className="md:hidden">Request Onboarding</span>
                  <span className="hidden md:inline">Request PM Onboarding</span>
                </a>
              </div>
              <p className="w-full pl-1 text-left text-xs font-mono font-bold text-[#0C1014] md:w-auto md:pl-0 md:text-right md:text-xs">
                Daily support 8am-8pm ET | Same-day response
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-[#5DAFD5] pt-28 md:pt-[6.25rem]">
        <section id="pm-hero" className="section-anchor relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/banner4.jpg"
              alt="Turnover cleaning team preparing a property"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              quality={72}
            />
          </div>
          <div className="absolute inset-0 bg-[#0C1014]/70" />

          <div className="relative section-shell md:pt-16 md:pb-16">
            <div className="mx-auto grid max-w-6xl gap-5 md:gap-8 md:grid-cols-[1.15fr_1fr]">
              <div className="rounded-3xl border border-white/20 bg-[#0C1014]/50 p-5 text-white backdrop-blur-sm md:p-8">
                <p className="text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-[#5DAFD5]">
                  <span className="md:hidden">Orlando / Disney Corridor</span>
                  <span className="hidden md:inline">
                    Turnover Cleaning for Property Managers (Orlando / Disney Corridor)
                  </span>
                </p>
                <h1 className="mt-3 text-3xl md:text-5xl font-semibold leading-tight">
                  Turnover Cleaning Built for Orlando Property Managers
                </h1>
                <p className="mt-4 text-sm md:text-lg font-mono text-white/90 max-w-3xl">
                  Calendar-synced scheduling, consistent checklists, and fast reporting — so your
                  portfolio runs without cleaner chaos.
                </p>

                <ul className="mt-6 grid gap-3">
                  <li className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm md:text-base font-mono">
                    <strong className="font-bold text-white">
                      Detailed Turnover Reports:
                    </strong>{' '}
                    damage checks, inventory counts, before/after photos, action items
                  </li>
                  <li className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm md:text-base font-mono">
                    <strong className="font-bold text-white">Hands-Off Turnovers:</strong> calendar
                    sync, smart checklists, supply tracking
                  </li>
                  <li className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm md:text-base font-mono">
                    <strong className="font-bold text-white">Same-Day Turns Supported:</strong>{' '}
                    guest-ready by check-in every time, even on tight same-day turnovers
                  </li>
                </ul>
              </div>

              <PmOnboardingForm />
            </div>
          </div>
        </section>

        <section
          id="what-pms-get"
          className="section-shell section-anchor bg-gradient-to-b from-[#F8FCFF] via-[#EAF6FF] to-[#F5FAFF]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
                Everything you need to stop babysitting turnovers
              </h2>
            </header>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {pmValueCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-[#5DAFD5]/30 bg-white p-5 shadow-[0_20px_55px_rgba(12,16,20,0.08)]"
                >
                  <h3 className="text-xl font-semibold text-[#0C1014]">{card.title}</h3>
                  <p className="mt-2 text-sm md:text-base font-mono text-[#0C1014]/90">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="deliverable-report"
          className="section-shell section-anchor bg-gradient-to-b from-[#E6F4FF] via-[#F3FAFF] to-[#EAF6FF]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
                Turnover reporting your team can actually use
              </h2>
            </header>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-[#5DAFD5]/35 bg-white p-4 shadow-[0_25px_70px_rgba(12,16,20,0.09)] md:p-5">
                <div className="rounded-2xl border border-[#90A4AE]/45 bg-[#F7FBFF] p-3 md:p-4">
                  <div className="flex items-center justify-between rounded-xl bg-[#E5F3FF] px-3 py-2">
                    <p className="text-[11px] md:text-xs font-mono uppercase tracking-[0.22em] text-[#2978A5]">
                      Sample Turnover Report (placeholder screenshot)
                    </p>
                    <span className="rounded-full bg-[#2978A5] px-2 py-1 text-[10px] md:text-[11px] font-semibold text-white">
                      Complete
                    </span>
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-14 rounded-lg bg-[#DAE8F4] blur-[1px]" />
                      <div className="h-14 rounded-lg bg-[#DAE8F4] blur-[1px]" />
                    </div>
                    <div className="h-2 rounded bg-[#DAE8F4]" />
                    <div className="h-2 rounded bg-[#DAE8F4] w-11/12" />
                    <div className="h-2 rounded bg-[#DAE8F4] w-10/12" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 rounded-lg bg-[#DAE8F4] blur-[0.5px]" />
                      <div className="h-10 rounded-lg bg-[#DAE8F4] blur-[0.5px]" />
                      <div className="h-10 rounded-lg bg-[#DAE8F4] blur-[0.5px]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#5DAFD5]/35 bg-white p-6 shadow-[0_25px_70px_rgba(12,16,20,0.09)]">
                <ul className="space-y-3">
                  {reportDeliverables.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl border border-[#5DAFD5]/20 bg-[#F8FCFF] px-4 py-3 text-sm md:text-base font-mono text-[#0C1014]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#pm-onboarding-form"
                  className="mt-5 inline-flex rounded-full border border-[#0C1014] bg-[#2978A5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0C1014]"
                >
                  Request PM Onboarding
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="onboarding-steps"
          className="section-shell section-anchor bg-gradient-to-b from-[#FDFEFF] via-[#EDF8FF] to-[#F6FBFF]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
                Onboard in days&mdash;not weeks
              </h2>
            </header>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {onboardingSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-3xl border border-[#5DAFD5]/35 bg-white p-6 shadow-[0_20px_60px_rgba(12,16,20,0.08)]"
                >
                  <p className="text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-[#2978A5]">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#0C1014]">{step.title}</h3>
                  <p className="mt-2 text-sm md:text-base font-mono text-[#0C1014]/90">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="#pm-onboarding-form"
                className="rounded-full border border-[#0C1014] bg-[#2978A5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0C1014]"
              >
                Book onboarding call
              </a>
              <a
                href="tel:6465049590"
                className="rounded-full border border-[#0C1014]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#0C1014] transition hover:bg-[#0C1014] hover:text-white"
              >
                Call/Text Ops Line
              </a>
            </div>
          </div>
        </section>

        <section
          id="cleaner-vetting"
          className="section-shell section-anchor bg-gradient-to-b from-[#E6F4FF] via-[#F3FAFF] to-[#EAF6FF]"
        >
          <div className="mx-auto max-w-5xl">
            <header className="text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
                A vetted team that protects your brand
              </h2>
            </header>

            <p className="mt-8 pl-1 text-left text-sm font-mono font-semibold text-[#0C1014] md:text-base">
              Applicant Steps:
            </p>

            <ol className="mt-3 grid gap-3 md:grid-cols-2">
              {cleanerVettingSteps.map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-[#5DAFD5]/30 bg-white px-4 py-3 text-sm md:text-base font-mono text-[#0C1014] shadow-[0_15px_45px_rgba(12,16,20,0.06)]"
                >
                  <span className="font-semibold text-[#2978A5]">{index + 1}.</span> {step}
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-2xl border-2 border-[#5DAFD5] bg-white px-5 py-4 text-center shadow-[0_20px_55px_rgba(41,120,165,0.12)]">
              <p className="text-xs md:text-sm font-mono uppercase tracking-[0.32em] text-[#2978A5]">
                Top Talent Only
              </p>
              <p className="mt-2 text-lg md:text-2xl font-semibold text-[#0C1014]">
                Only 2% of applicants make it through all five steps.
              </p>
            </div>
          </div>
        </section>

        <section
          id="proof"
          className="section-shell section-anchor bg-gradient-to-b from-[#FDFEFF] via-[#EDF8FF] to-[#F6FBFF]"
        >
          <div className="mx-auto max-w-6xl">
            <header className="text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
                Trusted by local operators
              </h2>
            </header>

            <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-[#5DAFD5]/35 bg-white p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div className="space-y-2">
                {reviewsData.rating !== null ? (
                  <>
                    <StarRow rating={reviewsData.rating} />
                    <p className="text-lg font-semibold text-[#0C1014]">
                      {reviewsData.rating.toFixed(1)} Google rating
                      {reviewsData.totalRatings !== null
                        ? ` (${reviewsData.totalRatings} reviews)`
                        : ''}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-[#0C1014]">Google ratings module</p>
                    <p className="text-sm font-mono text-[#0C1014]/80">
                      Live rating/count appear here when Google data is available.
                    </p>
                  </>
                )}
              </div>

              <a
                href={reviewsData.reviewsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full justify-center rounded-full border border-[#0C1014] bg-[#2978A5] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0C1014] md:w-auto"
              >
                View all Google reviews
              </a>
            </div>

            <p className="mt-5 pl-1 text-left text-sm font-mono font-semibold text-[#0C1014] md:text-base">
              Recent Reviews:
            </p>

            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {reviews.slice(0, 3).map((review, index) => (
                <article
                  key={`${review.author}-${index}`}
                  className="rounded-3xl border border-[#5DAFD5]/35 bg-white p-5 shadow-[0_18px_55px_rgba(12,16,20,0.08)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base md:text-lg font-semibold text-[#0C1014]">{review.author}</p>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="mt-1 text-xs font-mono uppercase tracking-[0.2em] text-[#2978A5]">
                    {review.relativeTime}
                  </p>
                  <p className="mt-3 text-sm md:text-base font-mono text-[#0C1014]/90">
                    &quot;{review.text}&quot;
                  </p>
                </article>
              ))}
            </div>

          </div>
        </section>

        <section
          id="faq"
          className="section-shell section-anchor bg-gradient-to-b from-[#E6F4FF] via-[#F3FAFF] to-[#EAF6FF]"
        >
          <div className="mx-auto max-w-5xl">
            <header className="text-center">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">FAQ</h2>
            </header>

            <div className="mt-8 space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={item.question}
                  open={index === 0}
                  className="rounded-3xl border border-[#5DAFD5]/25 bg-white px-5 py-4 shadow-[0_15px_45px_rgba(12,16,20,0.06)]"
                >
                  <summary className="cursor-pointer list-none text-left text-base md:text-xl font-semibold text-[#0C1014]">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm md:text-base font-mono text-[#0C1014]/90">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section
          id="final-cta"
          className="section-shell section-anchor bg-gradient-to-b from-[#FDFEFF] via-[#EDF8FF] to-[#F6FBFF]"
        >
          <div className="mx-auto max-w-4xl rounded-3xl border border-[#5DAFD5]/40 bg-white p-6 text-center shadow-[0_25px_75px_rgba(12,16,20,0.09)] md:p-10">
            <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
              Ready for a turnover partner your team can trust?
            </h2>
            <ul className="mt-5 grid gap-3 text-left md:grid-cols-3">
              <li className="rounded-2xl border border-[#5DAFD5]/30 bg-[#F8FCFF] px-4 py-3 text-sm font-mono text-[#0C1014]">
                Reporting after every clean
              </li>
              <li className="rounded-2xl border border-[#5DAFD5]/30 bg-[#F8FCFF] px-4 py-3 text-sm font-mono text-[#0C1014]">
                Calendar-synced scheduling
              </li>
              <li className="rounded-2xl border border-[#5DAFD5]/30 bg-[#F8FCFF] px-4 py-3 text-sm font-mono text-[#0C1014]">
                Same-day turns supported
              </li>
            </ul>

            <div className="mt-6 flex w-full items-center gap-2 md:w-auto md:flex-wrap md:justify-center">
              <a
                href="tel:6465049590"
                className="flex-1 whitespace-nowrap rounded-full border border-[#0C1014]/25 bg-white px-3 py-[7px] text-center text-[12px] font-semibold text-[#0C1014] transition hover:bg-[#0C1014] hover:text-white md:flex-none md:px-5 md:py-2.5 md:text-sm"
              >
                <span className="md:hidden">Call/Text: (646) 504-9590</span>
                <span className="hidden md:inline">Call/Text: (646) 504-9590</span>
              </a>
              <a
                href="#pm-onboarding-form"
                className="flex-1 whitespace-nowrap rounded-full border border-[#0C1014] bg-[#2978A5] px-3 py-[7px] text-center text-[12px] font-semibold text-white transition hover:bg-[#0C1014] md:flex-none md:px-5 md:py-2.5 md:text-sm"
              >
                <span className="md:hidden">Request Onboarding</span>
                <span className="hidden md:inline">Request PM Onboarding</span>
              </a>
            </div>

            <p className="mt-5 text-xs md:text-sm font-mono text-[#0C1014]/85">
              <span className="md:hidden">8am-8pm ET | Orlando / Disney corridor</span>
              <span className="hidden md:inline">
                Daily support 8am-8pm ET | Orlando / Disney corridor
              </span>
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-b from-[#080B10] via-[#111720] to-[#06080C] px-5 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#5DAFD5]">
              BLUE BUNNY TURNOVER SERVICES
            </p>
            <p className="mt-2 text-sm md:text-base font-mono text-white">
              Turnover Cleaning for Property Managers (Orlando / Disney Corridor)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-mono">
            <a href="tel:6465049590" className="transition hover:text-[#5DAFD5]">
              646-504-9590
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
