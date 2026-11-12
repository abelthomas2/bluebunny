/**
 * Homepage reviews — hand-curated, no Google API involved.
 *
 * To change what the site shows: edit the values below, then deploy
 * (commit on main + push). Nothing else needs to be touched.
 *
 * Reviews are listed newest first. Every entry in the list is displayed
 * (carousel on mobile, grid on desktop), so trim the list to control
 * how many appear.
 */

export type Review = {
  author: string;
  /** 1–5 */
  rating: number;
  text: string;
  /**
   * Date the review was posted, YYYY-MM-DD. The site turns this into
   * "2 weeks ago" / "6 months ago" automatically, so it never goes stale.
   * The exact day is visible in your Google Business Profile if you want
   * to tighten these up; the ones below are estimated from Google's
   * "N weeks/months ago" labels.
   */
  date: string;
};

/** A review plus its server-rendered "time ago" label (see TimeAgo component). */
export type ReviewCard = Review & { postedLabel: string };

/** Google Business Profile place ID — used only to build the public Maps link. */
const GOOGLE_PLACE_ID = 'ChIJq95SjQGs-OURjO-If8tXwmc';

/** "View all Google reviews" button target. Public Maps URL, no API key required. */
export const REVIEWS_URL = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`;

/** Overall Google rating shown in the rating bar. `null` hides the number. */
export const GOOGLE_RATING: number | null = 5.0;

/** Total Google review count shown next to the rating. `null` hides it. */
export const GOOGLE_RATING_COUNT: number | null = 6;

export const reviews: Review[] = [
  {
    author: 'Chunks 1994',
    rating: 5,
    text: "Been using this company to service my portfolio for a month now and they've given me no issues thus far. I'd recommend Blue Bunny to anyone looking to take the hassle of turnover cleaning off their plate",
    date: '2026-10-26',
  },
  {
    author: 'L T',
    rating: 5,
    // Excerpt — the full review is on Google.
    text: 'Blue Bunny Turnover Service did an excellent job with the vacation rental cleaning! They were professional, reliable, and thorough, making sure everything was clean, fresh, and ready for the next guests…',
    date: '2026-10-24',
  },
  {
    author: 'Amy Jones',
    rating: 5,
    text: 'Good reliable cleaners. Show up on time and do a good job. I would recommend them!',
    date: '2026-09-05',
  },
  {
    author: 'Laura Cyriac',
    rating: 5,
    text: "Abel and his team do a great job cleaning our rentals. If you're looking for a reliable cleaner look no further. Love that they send us detailed reports after every clean as well, gives us great peace of mind.",
    date: '2026-05-05',
  },
  {
    author: 'VACATION HOMES IN THE SUN LLC',
    rating: 5,
    text: 'Came through for a last-minute clean. Great service',
    date: '2026-02-05',
  },
  {
    author: 'Chloe brown',
    rating: 5,
    text: 'Airbnb turnover clean was quick and there were no guest complaints. 👍 would recommend',
    date: '2025-12-01',
  },
];
