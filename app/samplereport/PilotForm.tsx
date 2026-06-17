'use client';

import PmOnboardingForm from '@/app/components/PmOnboardingForm';

// Pilot request form (build spec §3.7): reuses the exact main-site form component and
// /api/leads endpoint, with sample-report copy, the campaign hidden fields, and the
// mailer attribution (source, plus an optional wave from ?w=).
export default function PilotForm({ wave }: { wave?: string }) {
  const hiddenFields: Record<string, string> = {
    source: 'samplereport-mailer-2026-06',
  };
  if (wave) hiddenFields.wave = wave;

  return (
    <PmOnboardingForm
      eyebrow=""
      heading="Request a pilot"
      submitLabel="Get Started"
      leadType="Sample Report Pilot - samplereport"
      hiddenFields={hiddenFields}
      successTitle="Got it."
      successMessage="We'll call or text you within one business day to set up a 15-minute fit check."
      trackingName="pilot"
    />
  );
}
