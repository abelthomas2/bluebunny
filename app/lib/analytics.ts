// Provider-agnostic analytics, shared across the whole site.
// Fires to Plausible and/or a GA4-style dataLayer if either is present on the page
// (GA4 loads via NEXT_PUBLIC_GA_ID in app/layout.tsx); no-ops otherwise so events
// stay wired and ready even before/without a vendor.

export type AnalyticsEvent =
  // ── Sample report (/samplereport) ──
  | 'page_view'
  | 'album_view'
  | 'lightbox_open'
  | 'album_room_select'
  | 'pdf_download'
  | 'cta_pilot_tap'
  // ── Homepage (/) ──
  | 'cta_onboarding_tap'
  | 'sample_report_tap'
  | 'reviews_link_tap'
  | 'calculator_use'
  | 'faq_open'
  | 'faq_show_more'
  | 'carousel_advance'
  // ── Shared across surfaces ──
  | 'video_play'
  | 'video_50'
  | 'video_complete'
  | 'cta_call_tap'
  | 'cta_email_tap'
  | 'form_start'
  | 'form_error'
  | 'form_submit';

type Props = Record<string, string | number>;

export function track(event: AnalyticsEvent, props?: Props): void {
  if (typeof window === 'undefined') return;

  const w = window as typeof window & {
    plausible?: (event: string, options?: { props?: Props }) => void;
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  };

  try {
    w.plausible?.(event, props ? { props } : undefined);
    w.gtag?.('event', event, props ?? {});
  } catch {
    /* analytics must never break the page */
  }
}
