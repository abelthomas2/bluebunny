'use client';

import { FormEvent, useState } from 'react';

const LEAD_ENDPOINT = '/api/leads';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type FieldKey =
  | 'phone'
  | 'email'
  | 'serviceArea'
  | 'portfolioSize'
  | 'pmsType'
  | 'consent';
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
    const serviceArea = (formData.get('serviceArea') as string | null)?.trim() ?? '';
    const portfolioSize = (formData.get('portfolioSize') as string | null)?.trim() ?? '';
    const pmsType = (formData.get('pmsType') as string | null)?.trim() ?? '';
    const consent = formData.get('consent');
    const phoneDigits = phone.replace(/\D/g, '');

    if (phoneDigits.length < MIN_PHONE_DIGITS) {
      errors.phone = 'Phone number must include at least 10 digits.';
    }

    if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!serviceArea) {
      errors.serviceArea = 'Enter a service area or zip code.';
    }

    if (!portfolioSize) {
      errors.portfolioSize = 'Select your portfolio size.';
    }

    if (!pmsType) {
      errors.pmsType = 'Select your PMS or calendar type.';
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
  const buttonLabel =
    formStatus === 'success'
      ? 'Submitted!'
      : formStatus === 'error'
        ? 'Try Again'
        : isSubmitting
          ? 'Sending...'
          : 'Get Availability + Onboarding Steps';

  return (
    <div
      id="pm-onboarding-form"
      className="scroll-mt-43 rounded-3xl border border-[#5DAFD5]/40 bg-white p-5 shadow-[0_22px_65px_rgba(12,16,20,0.16)] md:scroll-mt-30 md:p-8"
    >
      <div className="mb-4 md:mb-5">
        <p className="text-xs md:text-sm font-mono uppercase tracking-[0.28em] text-[#2978A5]">
          PM Intake Form
        </p>
        <h3 className="mt-1 text-2xl md:text-3xl font-semibold text-[#0C1014]">
          Request PM Onboarding
        </h3>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <input type="hidden" name="leadType" value="PM Onboarding - Turnover Cleaning Page" />

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-mono text-[#0C1014]">
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
            <label htmlFor="company" className="mb-1 block text-sm font-mono text-[#0C1014]">
              Company
            </label>
            <input
              id="company"
              type="text"
              name="company"
              placeholder="Company name"
              className="w-full rounded-xl border border-[#90A4AE] px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-mono text-[#0C1014]">
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

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-mono text-[#0C1014]">
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

          <div className="md:col-span-2">
            <label htmlFor="serviceArea" className="mb-1 block text-sm font-mono text-[#0C1014]">
              Primary service area or zip code <span className="text-[#2978A5]">*</span>
            </label>
            <input
              id="serviceArea"
              type="text"
              name="serviceArea"
              required
              aria-invalid={Boolean(fieldErrors.serviceArea)}
              aria-describedby={fieldErrors.serviceArea ? 'service-area-error' : undefined}
              placeholder="Example: Lake Buena Vista / 32830"
              className="w-full rounded-xl border border-[#90A4AE] px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
            />
            {fieldErrors.serviceArea && (
              <p id="service-area-error" className="mt-1 text-xs font-mono text-red-600">
                {fieldErrors.serviceArea}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="portfolioSize" className="mb-1 block text-sm font-mono text-[#0C1014]">
              Portfolio size <span className="text-[#2978A5]">*</span>
            </label>
            <select
              id="portfolioSize"
              name="portfolioSize"
              required
              defaultValue=""
              aria-invalid={Boolean(fieldErrors.portfolioSize)}
              aria-describedby={fieldErrors.portfolioSize ? 'portfolio-size-error' : undefined}
              className="w-full rounded-xl border border-[#90A4AE] bg-white px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="1-2">1-2</option>
              <option value="3-10">3-10</option>
              <option value="11-25">11-25</option>
              <option value="25+">25+</option>
            </select>
            {fieldErrors.portfolioSize && (
              <p id="portfolio-size-error" className="mt-1 text-xs font-mono text-red-600">
                {fieldErrors.portfolioSize}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="pmsType" className="mb-1 block text-sm font-mono text-[#0C1014]">
              PMS / calendar type <span className="text-[#2978A5]">*</span>
            </label>
            <select
              id="pmsType"
              name="pmsType"
              required
              defaultValue=""
              aria-invalid={Boolean(fieldErrors.pmsType)}
              aria-describedby={fieldErrors.pmsType ? 'pms-type-error' : undefined}
              className="w-full rounded-xl border border-[#90A4AE] bg-white px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
            >
              <option value="" disabled>
                Select one
              </option>
              <option value="Guesty">Guesty</option>
              <option value="Hostaway">Hostaway</option>
              <option value="OwnerRez">OwnerRez</option>
              <option value="iCal">iCal</option>
              <option value="Other">Other</option>
            </select>
            {fieldErrors.pmsType && (
              <p id="pms-type-error" className="mt-1 text-xs font-mono text-red-600">
                {fieldErrors.pmsType}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="mb-1 block text-sm font-mono text-[#0C1014]">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Anything special about your standards/checklists?"
              className="w-full rounded-xl border border-[#90A4AE] px-3 py-2.5 text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              required
              aria-invalid={Boolean(fieldErrors.consent)}
              aria-describedby={fieldErrors.consent ? 'consent-error' : undefined}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-xs md:text-sm text-[#0C1014] font-mono text-left">
              I consent to Blue Bunny Turnover Services collecting my phone number and potentially
              contacting me, in compliance with US regulations.
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
          className="w-full rounded-xl bg-[#2978A5] px-4 py-3 text-sm md:text-base font-semibold text-white transition hover:bg-[#0C1014] disabled:cursor-not-allowed disabled:opacity-75"
        >
          {buttonLabel}
        </button>

        {errorMessage && <p className="text-sm font-mono text-red-600">{errorMessage}</p>}
      </form>

      <p className="mt-4 text-xs md:text-sm font-mono text-[#0C1014]/80">
        Licensed • Insured • Vetted cleaners • STR-focused
      </p>
    </div>
  );
}
