import { getImageProps } from 'next/image';
import TrackedLink from '@/app/components/TrackedLink';
import HeroPilotForm from '@/app/components/HeroPilotForm';
import { Icon, Star } from '@/app/components/BrandIcons';
import { FORM_ANCHOR, PHONE_DISPLAY, PHONE_TEL } from '@/app/lib/brand';
import { GOOGLE_RATING, GOOGLE_RATING_COUNT } from '@/app/lib/reviews';
import s from './Hero.module.css';

// Copy from the design file, word for word.
const EYEBROW = 'Orlando / Disney corridor';
const HEADLINE = 'Vacation rental cleaning that reports back.';

// Desktop: the lead breaks exactly where the design's does (its column is 560 px at every desktop width), so a
// browser that wraps text a little differently (Safari) still shows the same three lines.
const LEAD_DESKTOP_LINES = [
  'We clean, reset linens and restock your short-term rentals, then',
  'send a full report within 30 minutes of lockup. You stop',
  'managing cleaners.',
];

// Phones: wraps naturally with the screen (on a 390 px phone exactly as in the design, "short-" ending the first
// line), but never leaves one word alone on a last line or splits "guest-ready" (Safari does both otherwise).
// \u00A0 is a no-break space and \u2060 an invisible word joiner: same letters, same spacing as the design.
const LEAD_MOBILE =
  'We clean, reset linens and restock your short-term rentals, then send a full report within 30 minutes of lockup. You stop managing\u00A0cleaners.';
const CHECKS_MOBILE = [
  'Cleaning, linens and restock from one\u00A0partner',
  'A photo and damage report on every\u00A0turn',
  'A free reclean if a turn is not\u00A0guest-\u2060ready',
];

const CHECKS = [
  'Cleaning, linens and restock from one partner',
  'A photo and damage report on every turn',
  'A free reclean if a turn is not guest-ready',
];

// A 1 x 1 transparent GIF. Each photo's <picture> swaps to it on the layout that doesn't show that photo,
// so a phone never downloads the desktop photo and a computer never downloads the phone crop.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// herotesthq, the whole photo scaled to 2400 x 1350 (nothing retouched). Shown 1000 to 1150 px wide.
const desktopPhoto = getImageProps({
  src: '/hero-desktop-herotesthq.jpg',
  alt: 'Abel Thomas, owner of Blue Bunny Turnover Services, in the Blue Bunny polo',
  width: 2400,
  height: 1350,
  sizes: '1150px',
  loading: 'eager',
  fetchPriority: 'high',
}).props;

// banner4, cropped to exactly what the design's 390 x 256 band shows (from the full-size original).
const mobilePhoto = getImageProps({
  src: '/hero-mobile-banner4.jpg',
  alt: 'A Blue Bunny specialist wiping down a stainless refrigerator door',
  width: 2048,
  height: 1344,
  sizes: '100vw',
  loading: 'eager',
  fetchPriority: 'high',
}).props;

function Checks({ className, mobile }: { className: string; mobile?: boolean }) {
  return (
    <ul className={`${s.checks} ${className}`}>
      {CHECKS.map((item, i) => (
        <li key={item}>
          <Icon name="check" size={18} strokeWidth={2.2} />
          <span>{mobile ? CHECKS_MOBILE[i] : item}</span>
        </li>
      ))}
    </ul>
  );
}

const rating = GOOGLE_RATING !== null ? GOOGLE_RATING.toFixed(1) : null;
const ratingDesktop =
  rating === null
    ? 'Rated on Google'
    : `${rating} on Google${GOOGLE_RATING_COUNT !== null ? ` · ${GOOGLE_RATING_COUNT} reviews` : ''}`;
const ratingMobile = rating === null ? 'Rated on Google' : `${rating} on Google`;

export default function Hero() {
  return (
    <>
      {/* id kept from the old hero: the logo and older links point at #pm-hero */}
      <section id="pm-hero" className={s.hero}>
        {/* ---------- phone and small windows: Staggered ---------- */}
        <div className={s.mobileOnly}>
          <div className={s.band}>
            <picture>
              <source media="(min-width: 1024px)" srcSet={BLANK} />
              <img {...mobilePhoto} alt={mobilePhoto.alt} className={s.bandPhoto} />
            </picture>
            <p className={`${s.chip} ${s.mono}`}>
              <span>{EYEBROW}</span>
            </p>
            <h1 className={s.bandTitle}>
              <span className={s.plateTop}>
                <span className={s.plate}>Vacation rental cleaning</span>
              </span>{' '}
              <span className={s.plateBottom}>
                <span className={s.plate}>that reports back.</span>
              </span>
            </h1>
          </div>

          <div className={s.rest}>
            <p className={s.leadMobile}>{LEAD_MOBILE}</p>
            <Checks className={s.checksMobile} mobile />
            <div className={s.ctaRow}>
              <TrackedLink
                href={FORM_ANCHOR}
                event="cta_onboarding_tap"
                eventProps={{ location: 'hero' }}
                className={`${s.btn} ${s.btnPrimary} ${s.ctaPilot}`}
              >
                Start a pilot
              </TrackedLink>
              <TrackedLink
                href={PHONE_TEL}
                event="cta_call_tap"
                eventProps={{ location: 'hero' }}
                className={`${s.btn} ${s.btnSecondary} ${s.ctaCall}`}
              >
                Call or text {PHONE_DISPLAY}
              </TrackedLink>
            </div>
          </div>

          <div className={s.ribbonMobile}>
            <ul className={`${s.ribbonMobileList} ${s.mono}`}>
              <li>
                <Star size={15} />
                <span>{ratingMobile}</span>
              </li>
              <li>
                <Icon name="shield" size={16} className={s.ribbonIcon} />
                <span>Insured, bonded</span>
              </li>
              <li>
                <Icon name="file" size={16} className={s.ribbonIcon} />
                <span>Public SOP</span>
              </li>
              <li>
                <Icon name="clock" size={16} className={s.ribbonIcon} />
                <span>Report in 30 min</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------- desktop: Fade ---------- */}
        <div className={s.desktopOnly}>
          <div className={s.photo}>
            <picture>
              <source media="(max-width: 1023.98px)" srcSet={BLANK} />
              <img {...desktopPhoto} alt={desktopPhoto.alt} />
            </picture>
          </div>
          <div className={s.veil} aria-hidden="true" />
          <div className={s.copy}>
            <p className={`${s.eyebrow} ${s.mono}`}>{EYEBROW}</p>
            <h1 className={s.title}>{HEADLINE}</h1>
            <p className={s.lead}>
              {LEAD_DESKTOP_LINES.map((line, i) => (
                <span key={line} className={s.leadLine}>
                  {line}
                  {i < LEAD_DESKTOP_LINES.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
            <Checks className={s.checksDesktop} />
            <div className={s.talk}>
              <Icon name="phone" size={18} />
              <p>
                Prefer to talk?{' '}
                <TrackedLink
                  href={PHONE_TEL}
                  event="cta_call_tap"
                  eventProps={{ location: 'hero' }}
                  className={s.talkLink}
                >
                  Call or text {PHONE_DISPLAY}
                </TrackedLink>
              </p>
            </div>
          </div>
        </div>

        {/* The pilot form: a card under the ribbon on phones, one wide card across the bottom on desktop. */}
        <HeroPilotForm />
      </section>

      {/* ---------- desktop trust ribbon, right under the hero ---------- */}
      <div className={s.ribbonDesktop}>
        <ul className={`${s.ribbonDesktopList} ${s.mono}`}>
          <li>
            <Star size={16} />
            <span>{ratingDesktop}</span>
          </li>
          <li>
            <Icon name="shield" size={18} className={s.ribbonIcon} />
            <span>Insured and bonded</span>
          </li>
          <li>
            <Icon name="file" size={18} className={s.ribbonIcon} />
            <span>Public 25-page SOP</span>
          </li>
          <li>
            <Icon name="clock" size={18} className={s.ribbonIcon} />
            <span>Report within 30 minutes of lockup</span>
          </li>
        </ul>
      </div>
    </>
  );
}
