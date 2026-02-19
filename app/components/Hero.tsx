'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';

const LEAD_ENDPOINT = '/api/leads';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';
type FieldKey = 'zipCode' | 'phone' | 'email' | 'consent';
type FormErrors = Partial<Record<FieldKey, string>>;

const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PHONE_DIGITS = 10;

export default function Hero() {
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const validateForm = (formData: FormData) => {
    const errors: FormErrors = {};
    const zipCode = (formData.get('zipCode') as string)?.trim() ?? '';
    const phone = (formData.get('phone') as string)?.trim() ?? '';
    const email = (formData.get('email') as string)?.trim() ?? '';
    const consent = formData.get('consent');
    const phoneDigits = phone.replace(/\D/g, '');

    if (!ZIP_PATTERN.test(zipCode)) {
      errors.zipCode = 'Enter a valid 5-digit zip (e.g., 32801).';
    }

    if (phoneDigits.length < MIN_PHONE_DIGITS) {
      errors.phone = 'Phone number must include 10 digits.';
    }

    if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!consent) {
      errors.consent = 'Please confirm consent before submitting.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formStatus === 'submitting') return;

    const formElement = event.currentTarget;
    setFormStatus('submitting');
    setErrorMessage(null);

    try {
      const formData = new FormData(formElement);
      if (!validateForm(formData)) {
        setFormStatus('error');
        return;
      }

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
          : 'Get a Quote';

  return (
    <section id="home" className="relative w-full min-h-screen">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <Image
          src="/banner4.png"
          alt="Blue Bunny Turnover Services"
          fill
          priority
          quality={100}
          className="object-cover object-[75%_50%]"
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 pt-35 pb-24 md:mt-[var(--navbar-height)] md:min-h-[calc(100vh-var(--navbar-height))] md:flex-col md:pt-0 md:pb-0">
        <div className="w-full text-center">
          <h1 className="text-5xl md:text-7xl font-semibold !text-[#F5F0DF] mb-4">
            Orlando&rsquo;s <span className="!text-[#5DAFD5]">#1</span><br />STR Turnover Service
          </h1>
          <p className="text-base md:text-lg !text-[#F5F0DF] font-mono mb-3 border-1 border-[#F5F0DF] rounded-lg px-4 py-2 inline-block bg-white/10 backdrop-blur-md">
            LICENSED + INSURED + VETTED
          </p>
          <p className="text-lg md:text-2xl !text-[#F5F0DF] font-mono mb-10 max-w-3xl mx-auto">
            Your hassle-free solution for perfectly timed Airbnb turnovers.
          </p>
          
          {/* Lead Form */}
          <div className="bg-[#F5F0DF] p-4 rounded-lg max-w-6xl mx-auto w-full">
            <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                <div className="md:col-span-1 flex flex-col gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Zip Code"
                    name="zipCode"
                    required
                    aria-invalid={Boolean(fieldErrors.zipCode)}
                    aria-describedby={fieldErrors.zipCode ? 'zipCode-error' : undefined}
                    className="px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m md:text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                  />
                  {fieldErrors.zipCode && (
                    <p id="zipCode-error" className="text-xs text-red-600 font-mono text-left">
                      {fieldErrors.zipCode}
                    </p>
                  )}
                </div>

                <div className="md:col-span-1 flex flex-col gap-1">
                  <select
                    name="bedrooms"
                    className="px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m md:text-m w-full appearance-none bg-[#F5F0DF] bg-[length:16px_16px] bg-[right_0.6rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230C1014' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                    }}
                  >
                    <option value="1 bedroom">1 bedroom</option>
                    <option value="2 bedrooms">2 bedrooms</option>
                    <option value="3 bedrooms">3 bedrooms</option>
                    <option value="4+ bedrooms">4+ bedrooms</option>
                  </select>
                </div>

                <div className="md:col-span-1 flex flex-col gap-1">
                  <select
                    name="bathrooms"
                    className="px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m md:text-m w-full appearance-none bg-[#F5F0DF] bg-[length:16px_16px] bg-[right_0.6rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230C1014' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                    }}
                  >
                    <option value="1 bathroom">1 bathroom</option>
                    <option value="2 bathrooms">2 bathrooms</option>
                    <option value="3 bathrooms">3 bathrooms</option>
                    <option value="4+ bathrooms">4+ bathrooms</option>
                  </select>
                </div>

                <div className="md:col-span-1 flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    className="px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                  />
                </div>

                <div className="md:col-span-1 flex flex-col gap-1">
                  <input
                    type="tel"
                    placeholder="Phone"
                    name="phone"
                    required
                    inputMode="tel"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                    className="px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                  />
                  {fieldErrors.phone && (
                    <p id="phone-error" className="text-xs text-red-600 font-mono text-left">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-1 flex flex-col gap-1">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    required
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    className="px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="text-xs text-red-600 font-mono text-left">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-1 flex self-start">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#2978A5] text-[#F5F0DF] font-mono text-m font-medium rounded w-full hover:bg-[#0C1014] transition-colors whitespace-nowrap flex items-center justify-center disabled:opacity-75"
                  >
                    {buttonLabel}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1">
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
                  <label htmlFor="consent" className="text-sm text-[#0C1014] font-mono text-left">
                    I consent to Blue Bunny Turnover Services collecting my phone number and potentially contacting me, in compliance with US regulations.
                  </label>
                </div>
                {fieldErrors.consent && (
                  <p id="consent-error" className="text-xs text-red-600 font-mono text-left">
                    {fieldErrors.consent}
                  </p>
                )}
              </div>

              {errorMessage && (
                <p className="mt-3 text-sm text-red-600 font-mono text-left">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
