'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { track } from '@/app/lib/analytics';
import { PHONE_DISPLAY, PHONE_TEL } from '@/app/lib/brand';
import TrackedLink from '@/app/components/TrackedLink';
import { Icon } from '@/app/components/BrandIcons';
import BunnyPeek from '@/app/components/BunnyPeek';
import s from './HeroPilotForm.module.css';

// What the form sends is unchanged from the old hero form (PmOnboardingForm): the same endpoint, field
// names, select values, lead label and analytics name, so leads arrive in Formspree exactly as before.
const LEAD_ENDPOINT = '/api/leads';
const LEAD_TYPE = 'PM Onboarding - Turnover Cleaning Page';
const TRACKING_NAME = 'pm_onboarding';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PHONE_DIGITS = 10;

// Values as before; labels from the design.
const PORTFOLIO_SIZES = [
  { value: '1-10 doors', label: '1 to 10 doors' },
  { value: '11-25', label: '11 to 25' },
  { value: '26-50', label: '26 to 50' },
  { value: '51-100', label: '51 to 100' },
  { value: '100+', label: 'More than 100' },
];

// The design words two steps differently on phones (its "Request received" phone frame).
const NEXT_STEPS = [
  {
    n: '01',
    title: 'Fit check',
    body: 'A 15-minute call about your doors, service area and standards.',
    phoneBody: 'A 15-minute call about your doors and standards.',
  },
  {
    n: '02',
    title: 'Setup',
    body: 'Calendar sync, your checklist, access and supplies.',
    phoneBody: 'Calendar sync, your checklist and access. You approve everything.',
  },
  { n: '03', title: 'Pilot turns', body: 'First turns within 72 hours of the call.', phoneBody: null },
];

// Below this width the hero uses its phone layout (Hero.module.css) and "request received" fills the screen.
const PHONE_LAYOUT_QUERY = '(max-width: 1023.98px)';

type Status = 'idle' | 'invalid' | 'sending' | 'failed' | 'sent';
type FieldKey = 'email' | 'phone' | 'portfolioSize' | 'consent';
type FieldErrors = Partial<Record<FieldKey, string>>;

// Same messages as before (and as in the design's error frames).
const MESSAGES: Record<FieldKey, string> = {
  email: 'Enter a valid email address.',
  phone: 'Phone number must include at least 10 digits.',
  portfolioSize: 'Select your portfolio size.',
  consent: 'Please confirm consent before submitting.',
};

const FIELD_ORDER: FieldKey[] = ['email', 'phone', 'portfolioSize', 'consent'];

const ID = {
  name: 'pilot-name',
  email: 'pilot-email',
  phone: 'pilot-phone',
  portfolioSize: 'pilot-size',
  consent: 'pilot-consent',
} as const;

function validate(data: FormData): FieldErrors {
  const text = (key: string) => ((data.get(key) as string | null) ?? '').trim();
  const errors: FieldErrors = {};
  if (text('phone').replace(/\D/g, '').length < MIN_PHONE_DIGITS) errors.phone = MESSAGES.phone;
  if (!EMAIL_PATTERN.test(text('email'))) errors.email = MESSAGES.email;
  if (!text('portfolioSize')) errors.portfolioSize = MESSAGES.portfolioSize;
  if (!data.get('consent')) errors.consent = MESSAGES.consent;
  return errors;
}

function ErrorText({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className={s.error}>
      <Icon name="alert" size={15} strokeWidth={2} />
      <span>{children}</span>
    </p>
  );
}

export default function HeroPilotForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failMessage, setFailMessage] = useState<string | null>(null);
  const startedRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);

  // Once the request is in, move focus to the confirmation so screen readers announce it. On phones the
  // confirmation is its own screen: scroll it up to sit right under the header, as in the design.
  useEffect(() => {
    if (status !== 'sent') return;
    const phone = window.matchMedia(PHONE_LAYOUT_QUERY).matches;
    if (phone) wrapRef.current?.scrollIntoView({ block: 'start' });
    sentHeadingRef.current?.focus({ preventScroll: phone });
  }, [status]);

  const handleFirstFocus = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      track('form_start', { form: TRACKING_NAME });
    }
  };

  // A field's error clears as soon as it is edited; the rest stay until the next send.
  const handleChange = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name as FieldKey;
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const found = validate(data);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus('invalid');
      track('form_error', { form: TRACKING_NAME, reason: 'validation' });
      const first = FIELD_ORDER.find((key) => found[key]);
      if (first) document.getElementById(ID[first])?.focus();
      return;
    }

    setStatus('sending');
    setFailMessage(null);

    try {
      const response = await fetch(LEAD_ENDPOINT, { method: 'POST', body: data });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        // The rate-limit reply tells the person what to do, so it is shown as written.
        if (response.status === 429 && typeof result?.error === 'string') setFailMessage(result.error);
        throw new Error(result?.error ?? 'Failed to submit form');
      }
      setStatus('sent');
      track('form_submit', { form: TRACKING_NAME });
    } catch (error) {
      console.error(error);
      setStatus('failed');
      track('form_error', { form: TRACKING_NAME, reason: 'submit' });
    }
  };

  const failed = status === 'failed';
  const sending = status === 'sending';
  const hasErrors = Object.keys(errors).length > 0;
  const errorId = (key: FieldKey) => `${ID[key]}-error`;

  if (status === 'sent') {
    return (
      <div id="pm-onboarding-form" ref={wrapRef} className={`${s.wrap} ${s.wrapSent}`}>
        <div className={`${s.card} ${s.cardSent}`}>
          <div className={s.sentIntro}>
            <div className={s.receivedRow}>
              <span className={s.checkdot} aria-hidden="true">
                <Icon name="check" size={20} strokeWidth={2.6} />
              </span>
              <p className={`${s.label} ${s.receivedLabel} ${s.mono}`}>Request received</p>
            </div>
            <h2 ref={sentHeadingRef} tabIndex={-1} className={s.sentTitle}>
              Thanks. We&rsquo;ll reach out as soon as possible.
            </h2>
            <p className={s.sentLead}>Here is what happens next.</p>
          </div>
          <div className={s.sentMain}>
            <ol className={s.steps}>
              {NEXT_STEPS.map((step) => (
                <li key={step.n} className={s.step}>
                  <span className={`${s.stepNumber} ${s.mono}`}>{step.n}</span>
                  <span className={s.stepText}>
                    <span className={s.stepTitle}>{step.title}</span>
                    {step.phoneBody ? (
                      <>
                        <span className={`${s.stepBody} ${s.onDesktop}`}>{step.body}</span>
                        <span className={`${s.stepBody} ${s.onPhone}`}>{step.phoneBody}</span>
                      </>
                    ) : (
                      <span className={s.stepBody}>{step.body}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            {/* desktop and phone frames of the design offer different next moves */}
            <div className={`${s.sentActions} ${s.onDesktop}`}>
              <TrackedLink
                href="/samplereport"
                event="sample_report_tap"
                eventProps={{ location: 'pilot_sent' }}
                className={`${s.btn} ${s.btnPrimary}`}
              >
                See a real turnover report
              </TrackedLink>
              <a href="/sop.pdf" target="_blank" rel="noopener" className={`${s.btn} ${s.btnSecondary}`}>
                Read the SOP
              </a>
            </div>
            <div className={`${s.sentActions} ${s.onPhone}`}>
              <TrackedLink
                href="/samplereport"
                event="sample_report_tap"
                eventProps={{ location: 'pilot_sent' }}
                className={`${s.btn} ${s.btnPrimary}`}
              >
                See a sample report while you wait
              </TrackedLink>
              <TrackedLink
                href={PHONE_TEL}
                event="cta_call_tap"
                eventProps={{ location: 'pilot_sent' }}
                className={`${s.btn} ${s.btnSecondary}`}
              >
                Call or text {PHONE_DISPLAY}
              </TrackedLink>
            </div>
          </div>
          {/* phones: the bunny peeks up from the bottom of the screen, as in the menu */}
          <div className={`${s.sentFill} ${s.onPhone}`} aria-hidden="true" />
          <div className={s.onPhone}>
            <BunnyPeek />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="pm-onboarding-form" ref={wrapRef} className={s.wrap}>
      <div className={s.card}>
        <div className={s.intro}>
          <p className={`${s.label} ${s.mono}`}>Start a pilot</p>
          <h2 className={s.heading}>Try us on 3 to 5 doors</h2>
          <p className={s.sub}>Keep your current setup on the rest. No long-term contract, no deposit.</p>
        </div>

        <form
          className={`${s.form} ${failed ? s.formFailed : ''} ${hasErrors ? s.formHasErrors : ''}`}
          onSubmit={handleSubmit}
          onFocus={handleFirstFocus}
          onChange={handleChange}
          noValidate
          aria-label="Start a pilot"
        >
          <input type="hidden" name="leadType" value={LEAD_TYPE} />

          <div className={s.fields}>
            <div className={s.field}>
              <label htmlFor={ID.name} className={s.fieldLabel}>
                Name
              </label>
              <input
                id={ID.name}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className={s.input}
              />
            </div>

            {/* email and phone share a row when there is room (on desktop they join the four-column row) */}
            <div className={s.pair}>
              <div className={s.field}>
                <label htmlFor={ID.email} className={s.fieldLabel}>
                  Email<span className={s.required} aria-hidden="true"> *</span>
                </label>
                <input
                  id={ID.email}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? errorId('email') : undefined}
                  className={s.input}
                />
                {errors.email && <ErrorText id={errorId('email')}>{errors.email}</ErrorText>}
              </div>

              <div className={s.field}>
                <label htmlFor={ID.phone} className={s.fieldLabel}>
                  Phone<span className={s.required} aria-hidden="true"> *</span>
                </label>
                <input
                  id={ID.phone}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="(555) 555-5555"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? errorId('phone') : undefined}
                  className={s.input}
                />
                {errors.phone && <ErrorText id={errorId('phone')}>{errors.phone}</ErrorText>}
              </div>
            </div>

            <div className={s.field}>
              <label htmlFor={ID.portfolioSize} className={s.fieldLabel}>
                Portfolio size<span className={s.required} aria-hidden="true"> *</span>
              </label>
              <select
                id={ID.portfolioSize}
                name="portfolioSize"
                required
                defaultValue=""
                aria-invalid={Boolean(errors.portfolioSize)}
                aria-describedby={errors.portfolioSize ? errorId('portfolioSize') : undefined}
                className={`${s.input} ${s.select}`}
              >
                <option value="" disabled>
                  Select one
                </option>
                {PORTFOLIO_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              {errors.portfolioSize && (
                <ErrorText id={errorId('portfolioSize')}>{errors.portfolioSize}</ErrorText>
              )}
            </div>
          </div>

          <div className={s.consent}>
            <label htmlFor={ID.consent} className={s.consentLabel}>
              <input
                id={ID.consent}
                name="consent"
                type="checkbox"
                required
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? errorId('consent') : undefined}
                className={s.checkbox}
              />
              <span>I agree to be contacted by Blue Bunny Turnover Services.</span>
            </label>
            {errors.consent && <ErrorText id={errorId('consent')}>{errors.consent}</ErrorText>}
          </div>

          {failed && (
            <div className={s.banner} role="alert">
              <Icon name="alert" size={20} strokeWidth={2} />
              <p className={s.bannerText}>{failMessage ?? 'Something went wrong. Please try again.'}</p>
            </div>
          )}

          <div className={s.actions}>
            <button type="submit" className={s.submit} disabled={sending}>
              {sending ? 'Sending…' : failed ? 'Try again' : 'Request my pilot'}
            </button>
            {/* On desktop each half is its own line, as in the design, so every browser breaks it in the same place. */}
            <p className={s.note}>
              {failed ? (
                <>
                  <span className={s.noteLine}>Your answers are still</span>{' '}
                  <span className={s.noteLine}>here. Nothing was sent.</span>
                </>
              ) : (
                <>
                  <span className={s.noteLine}>We call or text back as soon as possible</span>{' '}
                  <span className={s.noteLine}>to set up a 15-minute fit check.</span>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
