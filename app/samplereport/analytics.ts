// Analytics for /samplereport now lives in the shared module so the homepage and
// the sample report fire through one provider-agnostic `track`. Re-exported here
// (with the historical `SampleEvent` name) so existing imports keep working.
export { track } from '@/app/lib/analytics';
export type { AnalyticsEvent as SampleEvent } from '@/app/lib/analytics';
