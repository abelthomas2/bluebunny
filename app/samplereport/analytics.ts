// Provider-agnostic analytics for /samplereport (build spec §10).
// Fires to Plausible and/or a GA4-style dataLayer if either is present on the page;
// no-ops otherwise so events are wired and ready before a vendor is chosen.

export type SampleEvent =
  | 'page_view'
  | 'video_play'
  | 'video_50'
  | 'video_complete'
  | 'album_view'
  | 'lightbox_open'
  | 'pdf_download'
  | 'cta_call_tap'
  | 'cta_pilot_tap'
  | 'form_submit';

type Props = Record<string, string | number>;

export function track(event: SampleEvent, props?: Props): void {
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
