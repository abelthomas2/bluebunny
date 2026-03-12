'use client';

import { FormEvent, useState } from 'react';

const LEAD_ENDPOINT = '/api/leads';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type FieldKey = 'phone' | 'email' | 'portfolioSize' | 'consent';
type FormErrors = Partial<Record<FieldKey, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PHONE_DIGITS = 10;

export default function PmOnboardingForm() {
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const validateForm = (formData: FormData) => {
    const errors: FormErrors = {};
    const phone = (formData.get('phone') as string | null)?.trim() ?? '';
    const email = (formData.get('email') as string | null)?.trim() ?? '';
    const portfolioSize = (formData.get('portfolioSize') as string | null)?.trim() ?? '';
    const consent = formData.get('consent');
    const phoneDigits = phone.replace(/\D/g, '');

    if (phoneDigits.length < MIN_PHONE_DIGITS) {
      errors.phone = 'Phone number must include at least 10 digits.';
    }

    if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!portfolioSize) {
      errors.portfolioSize = 'Select your portfolio size.';
    }

    if (!consent) {
      errors.consent = 'Please confirm consent before submitting.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formStatus === 'submitting') return;

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    if (!validateForm(formData)) {
      setFormStatus('error');
      return;
    }

    setFormStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error ?? 'Failed to submit form');
      }

      formElement.reset();
      setFieldErrors({});
      setFormStatus('success');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setErrorMessage(message);
      setFormStatus('error');
    }
  };

  const isSubmitting = formStatus === 'submitting';
  const buttonLabel = isSubmitting ? 'Sending...' : formStatus === 'error' ? 'Try Again' : 'Get Started';

  return (
    <div
      id="pm-onboarding-form"
      className="relative scroll-mt-[7rem] md:scroll-mt-[7.5rem] rounded-3xl border border-[#E2EEF5] bg-white p-5 pb-4 shadow-[0_22px_65px_rgba(12,16,20,0.16)] md:self-center md:px-8 md:pt-5 md:pb-5"
    >
      {/* Form content — always rendered to lock card height; hidden on success */}
      <div className={formStatus === 'success' ? 'invisible' : ''}>
        <div className="mb-4 md:mb-5">
          <p className="text-xs md:text-sm font-mono font-semibold uppercase tracking-[0.3em] text-[#2978A5]">
            Get Started
          </p>
          <h3 className="mt-2 text-3xl md:text-4xl font-semibold text-[#0C1014]">
            Request Onboarding
          </h3>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <input type="hidden" name="leadType" value="PM Onboarding - Turnover Cleaning Page" />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="name" className="mb-1 block text-sm md:text-base font-mono text-[#0C1014]">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Your name"
                className="w-full rounded-xl border border-[#90A4AE] px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm md:text-base font-mono text-[#0C1014]">
                Email <span className="text-[#2978A5]">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[#90A4AE] px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
              />
              {fieldErrors.email && (
                <p id="email-error" className="mt-1 text-xs font-mono text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm md:text-base font-mono text-[#0C1014]">
                Phone <span className="text-[#2978A5]">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                inputMode="tel"
                required
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                placeholder="(555) 555-5555"
                className="w-full rounded-xl border border-[#90A4AE] px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
              />
              {fieldErrors.phone && (
                <p id="phone-error" className="mt-1 text-xs font-mono text-red-600">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="portfolioSize" className="mb-1 block text-sm md:text-base font-mono text-[#0C1014]">
                Portfolio size <span className="text-[#2978A5]">*</span>
              </label>
              <select
                id="portfolioSize"
                name="portfolioSize"
                required
                defaultValue=""
                aria-invalid={Boolean(fieldErrors.portfolioSize)}
                aria-describedby={fieldErrors.portfolioSize ? 'portfolio-size-error' : undefined}
                className="h-10 w-full rounded-xl border border-[#90A4AE] bg-white px-3 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
              >
                <option value="" disabled>
                  Select one
                </option>
                <option value="1-10 doors">1–10 doors</option>
                <option value="11-25">11–25</option>
                <option value="26-50">26–50</option>
                <option value="51-100">51–100</option>
                <option value="100+">100+</option>
              </select>
              {fieldErrors.portfolioSize && (
                <p id="portfolio-size-error" className="mt-1 text-xs font-mono text-red-600">
                  {fieldErrors.portfolioSize}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                required
                aria-invalid={Boolean(fieldErrors.consent)}
                aria-describedby={fieldErrors.consent ? 'consent-error' : undefined}
                className="h-4 w-4 shrink-0 accent-[#2978A5]"
              />
              <label htmlFor="consent" className="text-xs md:text-sm font-mono text-[#0C1014]">
                I agree to be contacted by Blue Bunny.
              </label>
            </div>
            {fieldErrors.consent && (
              <p id="consent-error" className="text-xs font-mono text-red-600">
                {fieldErrors.consent}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] disabled:cursor-not-allowed disabled:opacity-75"
          >
            {buttonLabel}
          </button>

          {errorMessage && <p className="text-sm font-mono text-red-600">{errorMessage}</p>}
        </form>

        <p className="mt-3 md:mt-4 text-center text-xs font-mono text-[#0C1014]">
          Rated 5.0 on Google&nbsp;<span className="text-base text-[#F4B400]">★★★★★</span>
        </p>
      </div>

      {/* Success overlay — sits on top of invisible form, centered within the same card */}
      {formStatus === 'success' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-white p-5 text-center md:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF6FB]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path
                d="M5 14L11 20L23 8"
                stroke="#2978A5"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-[#0C1014]">Thanks!</h3>
          <p className="mt-2 max-w-sm text-sm font-mono text-[#0C1014]">
            We&apos;ll reach out as soon as possible.
          </p>
        </div>
      )}
    </div>
  );
}
