import TestimonialsCarousel from "./TestimonialsCarousel";

type GoogleFindPlaceResponse = {
  status?: string;
  error_message?: string;
  candidates?: Array<{
    place_id?: string;
  }>;
};

type GooglePlaceDetailsReview = {
  author_name?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
};

type GooglePlaceDetailsResponse = {
  status?: string;
  error_message?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: GooglePlaceDetailsReview[];
  };
};

type Testimonial = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

type TestimonialsData = {
  rating: number | null;
  totalRatings: number | null;
  reviewsUrl: string;
  reviews: Testimonial[];
  error?: string;
};

const BUSINESS_QUERY =
  process.env.GOOGLE_BUSINESS_QUERY ?? "Blue Bunny Turnover Services Orlando";
const DEFAULT_REVIEWS_URL = `https://www.google.com/search?q=${encodeURIComponent(BUSINESS_QUERY)}`;
const BUSINESS_QUERY_FALLBACKS = [
  BUSINESS_QUERY,
  "Blue Bunny Rental Cleaners Orlando",
  "Blue Bunny Rental Cleaners",
  "Blue Bunny Turnover Services Orlando",
  "Blue Bunny Turnover Services",
];
const SEARCH_QUERIES = Array.from(
  new Set(BUSINESS_QUERY_FALLBACKS.map((query) => query.trim()).filter(Boolean))
);
const REVIEWS_TO_SHOW = 3;
const REVIEWS_REVALIDATE_SECONDS = 60 * 60 * 6;

type GooglePlacesV1SearchResponse = {
  places?: Array<{
    name?: string;
    googleMapsUri?: string;
  }>;
  error?: {
    message?: string;
    status?: string;
  };
};

type GooglePlacesV1Review = {
  rating?: number;
  relativePublishTimeDescription?: string;
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
    status?: string;
  };
};

type PlaceLookupResult = {
  placeRef: string | null;
  error?: string;
};

function emptyTestimonialsData(error?: string): TestimonialsData {
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

function normalizeV1Review(review: GooglePlacesV1Review): Testimonial | null {
  const author = review.authorAttribution?.displayName?.trim();
  const text = (review.originalText?.text ?? review.text?.text)?.trim();
  const rating = review.rating;

  if (!author || !text || typeof rating !== "number") {
    return null;
  }

  return {
    author,
    rating,
    text: clampReviewText(text),
    relativeTime: review.relativePublishTimeDescription?.trim() ?? "Google review",
  };
}

function normalizeReview(review: GooglePlaceDetailsReview): Testimonial | null {
  const author = review.author_name?.trim();
  const text = review.text?.trim();
  const rating = review.rating;

  if (!author || !text || typeof rating !== "number") {
    return null;
  }

  return {
    author,
    rating,
    text: clampReviewText(text),
    relativeTime: review.relative_time_description?.trim() ?? "Google review",
  };
}

async function fetchPlaceResourceNameV1(apiKey: string): Promise<PlaceLookupResult> {
  if (process.env.GOOGLE_PLACE_ID) {
    const placeId = process.env.GOOGLE_PLACE_ID.trim();
    return { placeRef: placeId.startsWith("places/") ? placeId : `places/${placeId}` };
  }

  const errors: string[] = [];

  for (const query of SEARCH_QUERIES) {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.name,error",
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 1,
        languageCode: "en",
      }),
      next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      errors.push(`v1 search HTTP ${response.status} for "${query}"`);
      continue;
    }

    const payload = (await response.json()) as GooglePlacesV1SearchResponse;
    if (payload.error?.message) {
      errors.push(`v1 search error for "${query}": ${payload.error.message}`);
      continue;
    }

    const placeRef = payload.places?.[0]?.name ?? null;
    if (placeRef) {
      return { placeRef };
    }
  }

  if (errors.length > 0) {
    return { placeRef: null, error: errors.join(" | ") };
  }

  return { placeRef: null, error: "Google Places v1 search returned no matching place." };
}

async function fetchTestimonialsFromPlacesV1(apiKey: string): Promise<TestimonialsData> {
  try {
    const placeLookup = await fetchPlaceResourceNameV1(apiKey);
    if (!placeLookup.placeRef) {
      return emptyTestimonialsData(placeLookup.error ?? "Google Places v1 search returned no matching place.");
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/${placeLookup.placeRef}?languageCode=en`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "rating,userRatingCount,reviews,googleMapsUri,reviews.rating,reviews.relativePublishTimeDescription,reviews.text,reviews.originalText,reviews.authorAttribution",
        },
        next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      return emptyTestimonialsData(`Google Places v1 details request failed (${response.status}).`);
    }

    const payload = (await response.json()) as GooglePlacesV1DetailsResponse;
    if (payload.error?.message) {
      return emptyTestimonialsData(`Google Places v1 error: ${payload.error.message}`);
    }

    const reviews = (payload.reviews ?? [])
      .map(normalizeV1Review)
      .filter((review): review is Testimonial => review !== null)
      .slice(0, REVIEWS_TO_SHOW);

    return {
      rating: typeof payload.rating === "number" ? payload.rating : null,
      totalRatings: typeof payload.userRatingCount === "number" ? payload.userRatingCount : null,
      reviewsUrl: payload.googleMapsUri ?? DEFAULT_REVIEWS_URL,
      reviews,
    };
  } catch {
    return emptyTestimonialsData("Google Places v1 request failed unexpectedly.");
  }
}

async function fetchPlaceIdLegacy(apiKey: string): Promise<PlaceLookupResult> {
  if (process.env.GOOGLE_PLACE_ID) {
    const placeId = process.env.GOOGLE_PLACE_ID.trim();
    return { placeRef: placeId.startsWith("places/") ? placeId.replace("places/", "") : placeId };
  }

  const errors: string[] = [];

  for (const query of SEARCH_QUERIES) {
    const params = new URLSearchParams({
      input: query,
      inputtype: "textquery",
      fields: "place_id",
      key: apiKey,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params.toString()}`,
      {
        next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
      }
    );

    if (!response.ok) {
      errors.push(`legacy find-place HTTP ${response.status} for "${query}"`);
      continue;
    }

    const payload = (await response.json()) as GoogleFindPlaceResponse;
    if (payload.status !== "OK") {
      if (payload.error_message) {
        errors.push(`legacy find-place error for "${query}": ${payload.error_message}`);
      }
      continue;
    }

    const placeRef = payload.candidates?.[0]?.place_id ?? null;
    if (placeRef) {
      return { placeRef };
    }
  }

  if (errors.length > 0) {
    return { placeRef: null, error: errors.join(" | ") };
  }

  return { placeRef: null, error: "Legacy Places search returned no matching place." };
}

async function fetchTestimonialsFromLegacyPlaces(apiKey: string): Promise<TestimonialsData> {
  const placeLookup = await fetchPlaceIdLegacy(apiKey);
  if (!placeLookup.placeRef) {
    return emptyTestimonialsData(placeLookup.error ?? "Legacy Places search returned no matching place.");
  }

  const detailsParams = new URLSearchParams({
    place_id: placeLookup.placeRef,
    fields: "rating,user_ratings_total,reviews,url",
    reviews_sort: "newest",
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams.toString()}`,
    {
      next: { revalidate: REVIEWS_REVALIDATE_SECONDS },
    }
  );

  if (!response.ok) {
    return emptyTestimonialsData(`Legacy Places details request failed (${response.status}).`);
  }

  const payload = (await response.json()) as GooglePlaceDetailsResponse;
  if (payload.status !== "OK" || !payload.result) {
    const legacyError = payload.error_message
      ? `Legacy Places error: ${payload.error_message}`
      : `Legacy Places returned status ${payload.status ?? "UNKNOWN"}.`;
    return emptyTestimonialsData(legacyError);
  }

  const reviews = (payload.result.reviews ?? [])
    .map(normalizeReview)
    .filter((review): review is Testimonial => review !== null)
    .slice(0, REVIEWS_TO_SHOW);

  return {
    rating: typeof payload.result.rating === "number" ? payload.result.rating : null,
    totalRatings:
      typeof payload.result.user_ratings_total === "number"
        ? payload.result.user_ratings_total
        : null,
    reviewsUrl: payload.result.url ?? DEFAULT_REVIEWS_URL,
    reviews,
    error: reviews.length === 0 ? "Legacy Places returned no review text." : undefined,
  };
}

async function getTestimonialsData(): Promise<TestimonialsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return emptyTestimonialsData("Missing GOOGLE_PLACES_API_KEY.");
  }

  const v1Data = await fetchTestimonialsFromPlacesV1(apiKey);
  if (v1Data.reviews.length > 0 || v1Data.rating !== null) {
    return v1Data;
  }

  const legacyData = await fetchTestimonialsFromLegacyPlaces(apiKey);
  if (legacyData.reviews.length > 0 || legacyData.rating !== null) {
    return legacyData;
  }

  const combinedError = [v1Data.error, legacyData.error].filter(Boolean).join(" | ");
  return emptyTestimonialsData(combinedError || "Unable to load Google reviews.");
}

export default async function Testimonials() {
  const data = await getTestimonialsData();

  return (
    <section
      id="testimonials"
      className="bg-gradient-to-b from-[#EAF7FF] via-white to-white pt-15 md:pt-20 pb-15 md:pb-20 px-5 scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-10 md:space-y-12">
        <header className="text-center space-y-3 md:space-y-4">
          <p className="text-sm md:text-lg font-mono uppercase tracking-[0.3em] text-[#2978A5]">
            TESTIMONIALS
          </p>
          <h2 className="text-3xl md:text-5xl font-semibold text-[#0C1014]">
            What hosts say about Blue Bunny
          </h2>
          <p className="text-m md:text-xl font-mono text-[#0C1014]/90 max-w-[23rem] sm:max-w-[24rem] md:max-w-3xl mx-auto">
            Live reviews from our Google Business Profile.
          </p>
        </header>

        <TestimonialsCarousel
          reviews={data.reviews}
          rating={data.rating}
          totalRatings={data.totalRatings}
          debugError={data.error}
          showDebug={process.env.NODE_ENV !== "production"}
        />
      </div>
    </section>
  );
}
