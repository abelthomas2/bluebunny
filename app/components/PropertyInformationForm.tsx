'use client';

import { FormEvent, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { DEFAULT_WINDOW_MS } from '@/app/lib/rateLimiter';

const LEAD_ENDPOINT = '/api/leads';

// Every property travels in one Formspree submission, about 45 fields each. Formspree
// publishes no field limit, so raise this only after a real submission of that size arrives.
const MAX_PROPERTIES = 10;

// The server's own 429 message says to wait a minute; its window is longer than that.
const RATE_LIMITED = `Too many attempts from this device. Wait ${DEFAULT_WINDOW_MS / 60_000} minutes, then try again. Your answers will stay on this page.`;
const UNREACHABLE =
  "Couldn't reach the server. Check your connection and try again. Your answers are still on this page.";

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type ClientField = 'name' | 'email' | 'phone' | 'clientName';

type PropertyField =
  | 'propertyAddress' | 'city' | 'state' | 'zip' | 'bedrooms' | 'fullBaths' | 'halfBaths' | 'maxGuests'
  | 'checkinTime' | 'checkoutTime'
  | 'primaryAccess' | 'accessInstructions' | 'secondaryAccess' | 'gatedCommunity' | 'gateCode'
  | 'washer' | 'dryer' | 'appliancesFunctioning' | 'appliancesIssue' | 'linenStorage' | 'linenSets'
  | 'hasPool' | 'poolCleaning' | 'hasGrill' | 'grillCleaning' | 'grillType'
  | 'consumablesModel' | 'consumablesStorage'
  | 'thermostatTemp' | 'fanSetting' | 'thermostatLocation' | 'thermostatNotes'
  | 'stagingPreferences' | 'hasListingPhotos' | 'listingPhotosUrl' | 'hasWelcomeLights' | 'welcomeLightsDesc'
  | 'hasAlarm' | 'alarmInstructions' | 'specialSurfaces' | 'additionalNotes'
  | 'pmsPlatform' | 'pmsOther' | 'icalLink';

// Selects whose answer decides whether a follow-up field is shown.
const CONTROLLING = [
  'gatedCommunity', 'appliancesFunctioning', 'hasPool', 'hasGrill', 'consumablesModel',
  'hasListingPhotos', 'hasWelcomeLights', 'hasAlarm', 'pmsPlatform',
] as const satisfies readonly PropertyField[];

type Answers = Partial<Record<(typeof CONTROLLING)[number], string>>;

type ClientErrors = Partial<Record<ClientField, string>>;
type PropertyErrors = Partial<Record<PropertyField, string>>;

// Property errors are keyed by the block's stable id, so they stay attached to the right
// block when another one is removed and the rest are renumbered.
type FormErrors = { client: ClientErrors; properties: Record<number, PropertyErrors> };

const NO_ERRORS: FormErrors = { client: {}, properties: {} };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_PATTERN = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/i;
const ZIP_PATTERN = /^\d{5}$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;
const URL_PATTERN = /^https?:\/\/.+/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

function str(formData: FormData, key: string) {
  return (formData.get(key) as string | null)?.trim() ?? '';
}

function validateUrl(v: string) {
  return URL_PATTERN.test(v);
}

// Submitted name of a per-property field: property01_city, property02_city, ...
// Zero-padded because Formspree's dashboard lists fields alphabetically.
function fieldName(index: number, key: PropertyField) {
  return `property${String(index + 1).padStart(2, '0')}_${key}`;
}

const PROPERTY_NAME = /^property(\d+)_(.+)$/;

function readAnswers(get: (key: PropertyField) => string) {
  const answers: Answers = {};
  for (const key of CONTROLLING) answers[key] = get(key);
  return answers;
}

function sameAnswers(a: Answers = {}, b: Answers = {}) {
  return CONTROLLING.every((key) => (a[key] ?? '') === (b[key] ?? ''));
}

function without<T>(byId: Record<number, T>, id: number) {
  const rest = { ...byId };
  delete rest[id];
  return rest;
}

function validateClient(get: (key: ClientField) => string): ClientErrors {
  const errors: ClientErrors = {};

  if (!get('name')) errors.name = 'Name is required.';
  if (!EMAIL_PATTERN.test(get('email'))) errors.email = 'Enter a valid email address.';
  if (get('phone').replace(/\D/g, '').length < 10)
    errors.phone = 'Phone number must include at least 10 digits.';
  if (!get('clientName')) errors.clientName = 'Please enter your name to confirm.';

  return errors;
}

function validateProperty(get: (key: PropertyField) => string): PropertyErrors {
  const errors: PropertyErrors = {};

  // ── Property Details ──
  if (!get('propertyAddress')) errors.propertyAddress = 'Property address is required.';
  if (!get('city')) errors.city = 'City is required.';
  if (!STATE_PATTERN.test(get('state')))
    errors.state = 'Enter a valid 2-letter state code (e.g. FL).';
  if (!ZIP_PATTERN.test(get('zip')))
    errors.zip = 'Enter a valid 5-digit ZIP code.';
  const bedrooms = parseInt(get('bedrooms'), 10);
  if (isNaN(bedrooms) || bedrooms < 0)
    errors.bedrooms = 'Enter the number of bedrooms (0 or more).';
  const fullBaths = parseInt(get('fullBaths'), 10);
  if (isNaN(fullBaths) || fullBaths < 1)
    errors.fullBaths = 'Enter the number of full bathrooms (at least 1).';
  if (!WHOLE_NUMBER_PATTERN.test(get('maxGuests')) || parseInt(get('maxGuests'), 10) < 1)
    errors.maxGuests = 'Enter the maximum number of guests allowed (1 or more).';

  // ── Check-in & Checkout ──
  if (!TIME_PATTERN.test(get('checkinTime')))
    errors.checkinTime = 'Enter a valid check-in time (e.g., 3:00 PM).';
  if (!TIME_PATTERN.test(get('checkoutTime')))
    errors.checkoutTime = 'Enter a valid checkout time (e.g., 11:00 AM).';

  // ── Property Access ──
  if (!get('primaryAccess')) errors.primaryAccess = 'Select an access method.';
  if (!get('accessInstructions'))
    errors.accessInstructions = 'Access instructions are required.';
  if (!get('gatedCommunity'))
    errors.gatedCommunity = 'Indicate whether the property is in a gated community.';
  if (get('gatedCommunity') === 'Yes' && !get('gateCode'))
    errors.gateCode = 'Gate code or instructions are required.';

  // ── Appliances & Laundry ──
  if (!get('washer')) errors.washer = 'Indicate if a washer is on-site.';
  if (!get('dryer')) errors.dryer = 'Indicate if a dryer is on-site.';
  if (!get('appliancesFunctioning'))
    errors.appliancesFunctioning = 'Indicate if appliances are functioning.';
  const linenSets = parseInt(get('linenSets'), 10);
  if (!isNaN(linenSets) && linenSets > 0 && !get('linenStorage'))
    errors.linenStorage = 'Linen storage location is required when linens are on-site.';

  // ── Add-on Services ──
  if (!get('hasPool')) errors.hasPool = 'Indicate if the property has a pool.';
  if (get('hasPool') === 'Yes' && !get('poolCleaning'))
    errors.poolCleaning = 'Indicate whether to include pool cleaning.';
  if (!get('hasGrill')) errors.hasGrill = 'Indicate if the property has a grill.';
  if (get('hasGrill') === 'Yes') {
    if (!get('grillCleaning'))
      errors.grillCleaning = 'Indicate whether to include grill cleaning.';
    if (!get('grillType')) errors.grillType = 'Select the grill type.';
  }

  // ── Consumables ──
  if (!get('consumablesModel'))
    errors.consumablesModel = 'Select a consumables model.';
  if (get('consumablesModel') === 'Client-supplied' && !get('consumablesStorage'))
    errors.consumablesStorage = 'Indicate where consumables are stored.';

  // ── Thermostat ──
  if (!get('thermostatLocation'))
    errors.thermostatLocation = 'Thermostat location is required.';

  // ── Staging & Notes ──
  if (!get('hasListingPhotos'))
    errors.hasListingPhotos = 'Indicate whether listing photos are available.';
  if (get('hasListingPhotos') === 'Yes') {
    const photoUrl = get('listingPhotosUrl');
    if (!photoUrl || !validateUrl(photoUrl))
      errors.listingPhotosUrl = 'Enter a valid URL starting with https://.';
  }
  if (!get('hasWelcomeLights'))
    errors.hasWelcomeLights = 'Indicate whether there are designated arrival lights.';
  if (get('hasWelcomeLights') === 'Yes' && !get('welcomeLightsDesc'))
    errors.welcomeLightsDesc = 'Describe which lights to leave on.';
  if (!get('hasAlarm'))
    errors.hasAlarm = 'Indicate whether the property has an alarm system.';
  if (get('hasAlarm') === 'Yes' && !get('alarmInstructions'))
    errors.alarmInstructions = 'Arming instructions are required.';

  // ── PMS / Calendar ──
  if (!get('pmsPlatform')) errors.pmsPlatform = 'Select a PMS platform.';
  if (get('pmsPlatform') === 'Other' && !get('pmsOther'))
    errors.pmsOther = 'Specify the platform name.';
  const ical = get('icalLink');
  if (!ical || !validateUrl(ical))
    errors.icalLink = 'Enter a valid iCal URL starting with https://.';

  return errors;
}

// One line per submitted property for the confirmation: "123 Main St, Kissimmee, FL 34741"
function addressLine(get: (key: PropertyField) => string) {
  const stateZip = [get('state').toUpperCase(), get('zip')].filter(Boolean).join(' ');
  return [get('propertyAddress'), get('city'), stateZip].filter(Boolean).join(', ');
}

// After a failed submit an error goes away once its field is fixed; nothing new is flagged
// until the next submit.
function stillInvalid<K extends string>(shown: Partial<Record<K, string>>, fresh: Partial<Record<K, string>>) {
  const kept: Partial<Record<K, string>> = {};
  for (const key of Object.keys(shown) as K[]) {
    if (fresh[key]) kept[key] = fresh[key];
  }
  return kept;
}

// Untouched: nothing typed, every select still on its default option.
function isPristine(root: HTMLElement) {
  const controls = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  );
  return Array.from(controls).every((el) =>
    el instanceof HTMLSelectElement
      ? Array.from(el.options).every((option) => option.selected === option.defaultSelected)
      : el.value === el.defaultValue,
  );
}

// Every programmatic focus move goes through here. Focus first, then scroll, so the explicit
// scroll has the last word over the browser's own focus scrolling. Instant, like the browser's
// built-in validation: iOS only raises the keyboard for a focus made inside the tap, and a
// smooth scroll would be cut short when it does.
function reveal(el: HTMLElement, scrollTarget: Element = el) {
  el.focus();
  scrollTarget.scrollIntoView({ block: 'start', behavior: 'instant' });
}

// Lands in a property's first field with its header at the top of the screen.
function revealProperty(id: number) {
  const group = document.getElementById(`p${id}`);
  const first = document.getElementById(`p${id}-propertyAddress`);
  if (group && first) reveal(first, group);
}

// Sizes, radii and spacing follow the home page: its cards, eyebrow labels, body text and buttons.
const fieldBase =
  'w-full rounded-xl border border-[#90A4AE] bg-white px-3 text-sm text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]';
// Inputs and selects share one height, the same as the buttons.
const inp = fieldBase + ' h-11';
const sel = inp;
const ta = fieldBase + ' py-2.5 resize-none';
const lbl = 'mb-1 block scroll-mt-24 text-sm font-mono text-[#0C1014]';
const card = 'rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm';
const pill =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#E2EEF5] bg-white px-5 py-2.5 text-sm font-semibold text-[#2978A5] shadow-sm transition hover:border-[#5DAFD5]/40 hover:text-[#0C1014]';
const textButton = 'min-h-11 text-sm font-mono font-semibold transition';
const req = <span className="text-[#2978A5]"> *</span>;
const yesNo = (
  <>
    <option value="" disabled>Select one</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </>
);

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="mt-1 text-xs font-mono text-red-600">{msg}</p>;
}

function SectionTitle({ as: Tag = 'h2', children }: { as?: 'h2' | 'h3'; children: React.ReactNode }) {
  return (
    <Tag className="mb-5 pb-4 border-b border-[#E2EEF5] text-lg font-bold text-[#0C1014]">
      {children}
    </Tag>
  );
}

type PropertySectionProps = {
  /** Stable for the life of the block: React key and element ids. */
  id: number;
  /** Position in the list: visible number and submitted field names. */
  index: number;
  errors: PropertyErrors;
  /** This block's answers to the controlling selects: which follow-up fields to show. */
  answers: Answers;
  collapsed: boolean;
  /** False while this is the only property: nothing to fold away, nothing to remove. */
  removable: boolean;
  onToggle: () => void;
  onRemove: () => void;
};

function PropertySection({
  id, index, errors: fe, answers, collapsed, removable, onToggle, onRemove,
}: PropertySectionProps) {
  // Mirrored only to label the block's header
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const removeRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  const uid = `p${id}`;
  const title = `Property ${index + 1}`;
  const fid = (key: PropertyField) => `${uid}-${key}`;
  const eid = (key: PropertyField) => `${uid}-${key}-error`;
  // Spread onto a control: its id and submitted name, plus the error wiring.
  const field = (key: PropertyField) => ({
    id: fid(key),
    name: fieldName(index, key),
    'aria-invalid': Boolean(fe[key]),
    'aria-describedby': fe[key] ? eid(key) : undefined,
  });

  const summary = [address.trim(), city.trim()].filter(Boolean).join(', ');
  const errorCount = Object.keys(fe).length;
  const hasDetails = summary !== '' || errorCount > 0;

  // A block nobody has typed in goes straight away; anything else asks first.
  const requestRemove = () => {
    if (groupRef.current && isPristine(groupRef.current)) return onRemove();
    flushSync(() => setConfirmingRemove(true));
    keepRef.current?.focus();
  };

  const cancelRemove = () => {
    flushSync(() => setConfirmingRemove(false));
    removeRef.current?.focus();
  };

  return (
    <div
      ref={groupRef} id={uid} data-property={id} role="group" aria-labelledby={`${uid}-title`}
      className="flex scroll-mt-28 flex-col gap-5"
    >
      {/* A plain heading on the page background, lined up with the cards' content. */}
      <div className="px-6 pt-3">
        <div className="border-b border-[#C8DDE8] pb-3">
          <div className="flex items-center gap-3 md:gap-5">
            <h2 id={`${uid}-heading`} tabIndex={-1} className="min-w-0 flex-1 whitespace-nowrap text-xl font-bold tracking-tight text-[#0C1014] focus:outline-none md:text-2xl">
              {removable ? (
                <button
                  type="button" onClick={onToggle}
                  aria-expanded={!collapsed} aria-controls={`${uid}-fields`}
                  aria-describedby={hasDetails ? `${uid}-details` : undefined}
                  className="flex min-h-11 w-full items-center justify-between gap-3 text-left md:gap-5"
                >
                  <span id={`${uid}-title`}>{title}</span>
                  {/* The button's name stays the same; aria-expanded carries the state. */}
                  <span aria-hidden className="flex items-center gap-2 text-sm font-mono font-semibold tracking-normal text-[#2978A5]">
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                      className={collapsed ? '' : 'rotate-180'}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    {collapsed ? 'Edit' : 'Collapse'}
                  </span>
                </button>
              ) : (
                <span id={`${uid}-title`}>{title}</span>
              )}
            </h2>
            {removable && (
              <button
                ref={removeRef} type="button" onClick={requestRemove} aria-label={`Remove ${title}`}
                className={`${textButton} shrink-0 text-[#0C1014]/60 hover:text-[#0C1014]`}
              >
                Remove
              </button>
            )}
          </div>
          {hasDetails && (
            <div id={`${uid}-details`} className="font-mono">
              {summary && <p className="truncate text-sm text-[#0C1014]/75">{summary}</p>}
              {errorCount > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  {errorCount === 1 ? '1 field needs attention' : `${errorCount} fields need attention`}
                </p>
              )}
            </div>
          )}
        </div>
        {removable && confirmingRemove && (
          <div
            onKeyDown={(e) => e.key === 'Escape' && cancelRemove()}
            className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 pt-4"
          >
            <p id={`${uid}-confirm`} className="text-sm font-mono leading-relaxed text-[#0C1014]">
              Remove {title}{summary && ` (${summary})`}? Everything entered for it will be deleted.
            </p>
            <div className="flex gap-3">
              <button
                ref={keepRef} type="button" onClick={cancelRemove} aria-describedby={`${uid}-confirm`}
                className={pill}
              >
                Cancel
              </button>
              <button
                type="button" onClick={onRemove} aria-describedby={`${uid}-confirm`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#0C1014] bg-[#0C1014] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-[#0C1014]"
              >
                Remove property
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collapsed blocks stay mounted so their values are kept and still submitted. */}
      <div id={`${uid}-fields`} hidden={collapsed} className="flex flex-col gap-5">
        {/* ── Property Details ── */}
        <div className={card}>
          <SectionTitle as="h3">Property Details</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor={fid('propertyAddress')} className={lbl}>Property address{req}</label>
              <input
                {...field('propertyAddress')} type="text" className={inp} placeholder="123 Main St"
                onChange={(e) => setAddress(e.target.value)}
              />
              <Err id={eid('propertyAddress')} msg={fe.propertyAddress} />
            </div>
            <div>
              <label htmlFor={fid('city')} className={lbl}>City{req}</label>
              <input
                {...field('city')} type="text" className={inp} placeholder="Kissimmee"
                onChange={(e) => setCity(e.target.value)}
              />
              <Err id={eid('city')} msg={fe.city} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={fid('state')} className={lbl}>State{req}</label>
                <input {...field('state')} type="text" className={inp} placeholder="FL" maxLength={2} />
                <Err id={eid('state')} msg={fe.state} />
              </div>
              <div>
                <label htmlFor={fid('zip')} className={lbl}>ZIP{req}</label>
                <input
                  {...field('zip')} type="text" inputMode="numeric" className={inp} placeholder="34741" maxLength={5}
                />
                <Err id={eid('zip')} msg={fe.zip} />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <label htmlFor={fid('bedrooms')} className={lbl}>Bedrooms{req}</label>
                <input {...field('bedrooms')} type="number" min="0" className={inp} placeholder="3" />
                <Err id={eid('bedrooms')} msg={fe.bedrooms} />
              </div>
              <div>
                <label htmlFor={fid('fullBaths')} className={lbl}>Bathrooms{req}</label>
                <input {...field('fullBaths')} type="number" min="1" className={inp} placeholder="2" />
                <Err id={eid('fullBaths')} msg={fe.fullBaths} />
              </div>
              <div>
                <label htmlFor={fid('halfBaths')} className={lbl}>Half baths</label>
                <input {...field('halfBaths')} type="number" min="0" className={inp} placeholder="1" />
              </div>
              <div>
                <label htmlFor={fid('maxGuests')} className={lbl}>Max guests{req}</label>
                <input
                  {...field('maxGuests')} type="number" inputMode="numeric" min="1" className={inp} placeholder="8"
                />
                <Err id={eid('maxGuests')} msg={fe.maxGuests} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Check-in & Checkout ── */}
        <div className={card}>
          <SectionTitle as="h3">Check-in & Checkout</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={fid('checkinTime')} className={lbl}>Guest check-in time{req}</label>
              <input {...field('checkinTime')} type="text" className={inp} placeholder="e.g., 3:00 PM" />
              <Err id={eid('checkinTime')} msg={fe.checkinTime} />
            </div>
            <div>
              <label htmlFor={fid('checkoutTime')} className={lbl}>Guest checkout time{req}</label>
              <input {...field('checkoutTime')} type="text" className={inp} placeholder="e.g., 11:00 AM" />
              <Err id={eid('checkoutTime')} msg={fe.checkoutTime} />
            </div>
          </div>
        </div>

        {/* ── Property Access ── */}
        <div className={card}>
          <SectionTitle as="h3">Property Access</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor={fid('primaryAccess')} className={lbl}>Primary access method{req}</label>
              <select {...field('primaryAccess')} defaultValue="" className={sel}>
                <option value="" disabled>Select one</option>
                <option value="Lockbox">Lockbox</option>
                <option value="Smart lock">Smart lock</option>
                <option value="Key (hidden location)">Key (hidden location)</option>
                <option value="Gate code + door code">Gate code + door code</option>
                <option value="Other">Other</option>
              </select>
              <Err id={eid('primaryAccess')} msg={fe.primaryAccess} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor={fid('accessInstructions')} className={lbl}>Access instructions{req}</label>
              <textarea
                {...field('accessInstructions')} rows={2} className={ta}
                placeholder="e.g., Lockbox on front door handle, code 4821."
              />
              <Err id={eid('accessInstructions')} msg={fe.accessInstructions} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor={fid('secondaryAccess')} className={lbl}>Secondary access or backup entry method, if any</label>
              <textarea {...field('secondaryAccess')} rows={2} className={ta} />
            </div>
            <div>
              <label htmlFor={fid('gatedCommunity')} className={lbl}>Inside a gated community?{req}</label>
              <select {...field('gatedCommunity')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('gatedCommunity')} msg={fe.gatedCommunity} />
            </div>
            {answers.gatedCommunity === 'Yes' && (
              <div>
                <label htmlFor={fid('gateCode')} className={lbl}>Gate code or access instructions{req}</label>
                <input {...field('gateCode')} type="text" className={inp} placeholder="Gate code or instructions" />
                <Err id={eid('gateCode')} msg={fe.gateCode} />
              </div>
            )}
          </div>
        </div>

        {/* ── Appliances & Laundry ── */}
        <div className={card}>
          <SectionTitle as="h3">Appliances & Laundry</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={fid('washer')} className={lbl}>Washer on-site?{req}</label>
              <select {...field('washer')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('washer')} msg={fe.washer} />
            </div>
            <div>
              <label htmlFor={fid('dryer')} className={lbl}>Dryer on-site?{req}</label>
              <select {...field('dryer')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('dryer')} msg={fe.dryer} />
            </div>
            <div>
              <label htmlFor={fid('appliancesFunctioning')} className={lbl}>Both currently functioning?{req}</label>
              <select {...field('appliancesFunctioning')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('appliancesFunctioning')} msg={fe.appliancesFunctioning} />
            </div>
            {answers.appliancesFunctioning === 'No' && (
              <div className="md:col-span-2">
                <label htmlFor={fid('appliancesIssue')} className={lbl}>Describe the issue</label>
                <textarea {...field('appliancesIssue')} rows={2} className={ta} />
              </div>
            )}
            <div>
              <label htmlFor={fid('linenStorage')} className={lbl}>Linen storage location</label>
              <input {...field('linenStorage')} type="text" className={inp} placeholder="e.g., Hall closet upstairs" />
              <Err id={eid('linenStorage')} msg={fe.linenStorage} />
            </div>
            <div>
              <label htmlFor={fid('linenSets')} className={lbl}>Approximate linen sets on-site</label>
              <input {...field('linenSets')} type="number" min="0" className={inp} placeholder="4" />
            </div>
          </div>
        </div>

        {/* ── Add-on Services ── */}
        <div className={card}>
          <SectionTitle as="h3">Add-on Services</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={fid('hasPool')} className={lbl}>Property has a pool?{req}</label>
              <select {...field('hasPool')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('hasPool')} msg={fe.hasPool} />
            </div>
            {answers.hasPool === 'Yes' && (
              <div>
                <label htmlFor={fid('poolCleaning')} className={lbl}>Include pool cleaning each turn?{req}</label>
                <select {...field('poolCleaning')} defaultValue="" className={sel}>
                  {yesNo}
                </select>
                <Err id={eid('poolCleaning')} msg={fe.poolCleaning} />
              </div>
            )}
            <div>
              <label htmlFor={fid('hasGrill')} className={lbl}>Property has a grill?{req}</label>
              <select {...field('hasGrill')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('hasGrill')} msg={fe.hasGrill} />
            </div>
            {answers.hasGrill === 'Yes' && (
              <>
                <div>
                  <label htmlFor={fid('grillCleaning')} className={lbl}>Include grill cleaning each turn?{req}</label>
                  <select {...field('grillCleaning')} defaultValue="" className={sel}>
                    {yesNo}
                  </select>
                  <Err id={eid('grillCleaning')} msg={fe.grillCleaning} />
                </div>
                <div>
                  <label htmlFor={fid('grillType')} className={lbl}>Grill type{req}</label>
                  <select {...field('grillType')} defaultValue="" className={sel}>
                    <option value="" disabled>Select one</option>
                    <option value="Gas (propane)">Gas (propane)</option>
                    <option value="Gas (natural)">Gas (natural)</option>
                    <option value="Charcoal">Charcoal</option>
                    <option value="Electric">Electric</option>
                  </select>
                  <Err id={eid('grillType')} msg={fe.grillType} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Consumables ── */}
        <div className={card}>
          <SectionTitle as="h3">Consumables</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor={fid('consumablesModel')} className={lbl}>Consumables model{req}</label>
              <select {...field('consumablesModel')} defaultValue="" className={sel}>
                <option value="" disabled>Select one</option>
                <option value="Blue Bunny-supplied">
                  Blue Bunny-supplied ($7.00 base + $4.00 per bathroom per turn)
                </option>
                <option value="Client-supplied">
                  Client-supplied (no charge, restocked from on-site inventory)
                </option>
              </select>
              <Err id={eid('consumablesModel')} msg={fe.consumablesModel} />
            </div>
            {answers.consumablesModel === 'Client-supplied' && (
              <div className="md:col-span-2">
                <label htmlFor={fid('consumablesStorage')} className={lbl}>Where are consumables stored?{req}</label>
                <input {...field('consumablesStorage')} type="text" className={inp} placeholder="e.g., Under kitchen sink" />
                <Err id={eid('consumablesStorage')} msg={fe.consumablesStorage} />
              </div>
            )}
          </div>
        </div>

        {/* ── Thermostat & Climate ── */}
        <div className={card}>
          <SectionTitle as="h3">Thermostat & Climate</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={fid('thermostatTemp')} className={lbl}>Default thermostat setting (°F)</label>
              <input {...field('thermostatTemp')} type="number" min="60" max="85" defaultValue="74" className={inp} />
            </div>
            <div>
              <label htmlFor={fid('fanSetting')} className={lbl}>Fan setting</label>
              <select {...field('fanSetting')} defaultValue="Auto" className={sel}>
                <option value="Auto">Auto</option>
                <option value="On">On</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor={fid('thermostatLocation')} className={lbl}>Thermostat location{req}</label>
              <input
                {...field('thermostatLocation')} type="text" className={inp}
                placeholder="e.g., Hallway between bedrooms"
              />
              <Err id={eid('thermostatLocation')} msg={fe.thermostatLocation} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor={fid('thermostatNotes')} className={lbl}>Smart thermostat instructions, if any</label>
              <textarea {...field('thermostatNotes')} rows={2} className={ta} />
            </div>
          </div>
        </div>

        {/* ── Staging & Property Notes ── */}
        <div className={card}>
          <SectionTitle as="h3">Staging & Property Notes</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor={fid('stagingPreferences')} className={lbl}>Pillow or bed staging preferences</label>
              <textarea
                {...field('stagingPreferences')} rows={3} className={ta}
                placeholder="e.g., Chop fold on throw pillows, accent blanket draped on left side of couch"
              />
            </div>
            <div>
              <label htmlFor={fid('hasListingPhotos')} className={lbl}>Listing photos for staging reference?{req}</label>
              <select {...field('hasListingPhotos')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('hasListingPhotos')} msg={fe.hasListingPhotos} />
            </div>
            {answers.hasListingPhotos === 'Yes' && (
              <div>
                <label htmlFor={fid('listingPhotosUrl')} className={lbl}>Photo link{req}</label>
                <input {...field('listingPhotosUrl')} type="url" className={inp} placeholder="https://..." />
                <Err id={eid('listingPhotosUrl')} msg={fe.listingPhotosUrl} />
              </div>
            )}
            <div>
              <label htmlFor={fid('hasWelcomeLights')} className={lbl}>Designated welcome lights to leave on?{req}</label>
              <select {...field('hasWelcomeLights')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('hasWelcomeLights')} msg={fe.hasWelcomeLights} />
            </div>
            {answers.hasWelcomeLights === 'Yes' && (
              <div>
                <label htmlFor={fid('welcomeLightsDesc')} className={lbl}>Describe{req}</label>
                <input
                  {...field('welcomeLightsDesc')} type="text" className={inp}
                  placeholder="e.g., Porch light and kitchen island pendant"
                />
                <Err id={eid('welcomeLightsDesc')} msg={fe.welcomeLightsDesc} />
              </div>
            )}
            <div>
              <label htmlFor={fid('hasAlarm')} className={lbl}>Alarm or security system?{req}</label>
              <select {...field('hasAlarm')} defaultValue="" className={sel}>
                {yesNo}
              </select>
              <Err id={eid('hasAlarm')} msg={fe.hasAlarm} />
            </div>
            {answers.hasAlarm === 'Yes' && (
              <div className="md:col-span-2">
                <label htmlFor={fid('alarmInstructions')} className={lbl}>Arming instructions{req}</label>
                <textarea {...field('alarmInstructions')} rows={2} className={ta} />
                <Err id={eid('alarmInstructions')} msg={fe.alarmInstructions} />
              </div>
            )}
            <div className="md:col-span-2">
              <label htmlFor={fid('specialSurfaces')} className={lbl}>Surfaces requiring special care, if any</label>
              <textarea
                {...field('specialSurfaces')} rows={2} className={ta}
                placeholder="e.g., Natural stone countertops — use pH-neutral cleaner only"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor={fid('additionalNotes')} className={lbl}>Additional property-specific notes</label>
              <textarea
                {...field('additionalNotes')} rows={3} className={ta}
                placeholder="Anything else the cleaning team should know"
              />
            </div>
          </div>
        </div>

        {/* ── PMS / Calendar Integration ── */}
        <div className={card}>
          <SectionTitle as="h3">PMS / Calendar Integration</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor={fid('pmsPlatform')} className={lbl}>PMS platform{req}</label>
              <select {...field('pmsPlatform')} defaultValue="" className={sel}>
                <option value="" disabled>Select one</option>
                <option value="Guesty">Guesty</option>
                <option value="Hostaway">Hostaway</option>
                <option value="Hospitable">Hospitable</option>
                <option value="Lodgify">Lodgify</option>
                <option value="OwnerRez">OwnerRez</option>
                <option value="Airbnb">Airbnb</option>
                <option value="VRBO">VRBO</option>
                <option value="Other">Other</option>
              </select>
              <Err id={eid('pmsPlatform')} msg={fe.pmsPlatform} />
            </div>
            {answers.pmsPlatform === 'Other' && (
              <div>
                <label htmlFor={fid('pmsOther')} className={lbl}>Specify platform{req}</label>
                <input {...field('pmsOther')} type="text" className={inp} />
                <Err id={eid('pmsOther')} msg={fe.pmsOther} />
              </div>
            )}
            <div className="md:col-span-2">
              <label htmlFor={fid('icalLink')} className={lbl}>iCal link for this property{req}</label>
              <input {...field('icalLink')} type="url" className={inp} placeholder="https://..." />
              <Err id={eid('icalLink')} msg={fe.icalLink} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyInformationForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>(NO_ERRORS);
  // Address lines of the properties just submitted, listed on the confirmation.
  const [receipt, setReceipt] = useState<string[]>([]);

  // One id per property block, in display order.
  const [propertyIds, setPropertyIds] = useState<number[]>([0]);
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  // Each block's answers to the controlling selects, by block id. The DOM holds the answers;
  // this mirrors them so the right follow-up fields render.
  const [answers, setAnswers] = useState<Record<number, Answers>>({});
  const nextPropertyId = useRef(1);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const addProperty = () => {
    if (propertyIds.length >= MAX_PROPERTIES) return;
    const id = nextPropertyId.current++;
    // Commit first: the new block has to exist, and the others have to be folded away,
    // before there is a final position to scroll to.
    flushSync(() => {
      setCollapsedIds(propertyIds);
      setPropertyIds([...propertyIds, id]);
    });
    revealProperty(id);
  };

  const removeProperty = (id: number) => {
    if (propertyIds.length <= 1) return;
    const index = propertyIds.indexOf(id);
    const remaining = propertyIds.filter((p) => p !== id);
    flushSync(() => {
      setPropertyIds(remaining);
      setCollapsedIds((ids) => ids.filter((p) => p !== id));
      setAnswers((prev) => without(prev, id));
      setFieldErrors((prev) => ({ ...prev, properties: without(prev.properties, id) }));
    });
    // Keep keyboard focus beside where the block was: on whatever slid into its place.
    const neighbour = remaining[Math.min(index, remaining.length - 1)];
    document.getElementById(`p${neighbour}-heading`)?.focus();
  };

  const toggleProperty = (id: number) =>
    setCollapsedIds((ids) => (ids.includes(id) ? ids.filter((p) => p !== id) : [...ids, id]));

  const errorCount =
    Object.keys(fieldErrors.client).length +
    Object.values(fieldErrors.properties).reduce((n, errors) => n + Object.keys(errors).length, 0);

  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    const match = PROPERTY_NAME.exec((e.target as HTMLInputElement).name ?? '');
    const controlling = match !== null && (CONTROLLING as readonly string[]).includes(match[2]);
    if (!controlling && errorCount === 0) return;

    const formData = new FormData(e.currentTarget);

    if (!match) {
      const kept = stillInvalid(fieldErrors.client, validateClient((key) => str(formData, key)));
      if (Object.keys(kept).length !== Object.keys(fieldErrors.client).length)
        setFieldErrors((prev) => ({ ...prev, client: kept }));
      return;
    }

    const index = Number(match[1]) - 1;
    const id = propertyIds[index];
    const get = (key: PropertyField) => str(formData, fieldName(index, key));

    // Show or hide the follow-up fields for this property's answers.
    if (controlling) setAnswers((prev) => ({ ...prev, [id]: readAnswers(get) }));

    // Re-check the property so fixed fields lose their message as the user works.
    const shown = fieldErrors.properties[id];
    if (!shown) return;
    const kept = stillInvalid(shown, validateProperty(get));
    if (Object.keys(kept).length !== Object.keys(shown).length)
      setFieldErrors((prev) => ({ ...prev, properties: { ...prev.properties, [id]: kept } }));
  };

  const handleSubmit = async () => {
    const formElement = formRef.current;
    if (!formElement || status === 'submitting') return;

    let formData = new FormData(formElement);
    const getter = (index: number) => (key: PropertyField) => str(formData, fieldName(index, key));

    // A browser restoring the page (reload, Back) can set a select without a change event.
    // Re-read the answers so a follow-up field is never required while it is not on screen.
    const live: Record<number, Answers> = {};
    propertyIds.forEach((id, index) => {
      live[id] = readAnswers(getter(index));
    });
    if (propertyIds.some((id) => !sameAnswers(live[id], answers[id]))) {
      flushSync(() => setAnswers(live));
      formData = new FormData(formElement);
    }

    const clientErrors = validateClient((key) => str(formData, key));
    const propertyErrors: Record<number, PropertyErrors> = {};
    propertyIds.forEach((id, index) => {
      const errors = validateProperty(getter(index));
      if (Object.keys(errors).length > 0) propertyErrors[id] = errors;
    });

    if (Object.keys(clientErrors).length > 0 || Object.keys(propertyErrors).length > 0) {
      // Commit first, so the invalid fields are marked before going to look for one.
      flushSync(() => {
        setFieldErrors({ client: clientErrors, properties: propertyErrors });
        setErrorMsg(null);
        setStatus('error');
      });
      // Invalid controls carry aria-invalid="true", and DOM order is visual order.
      const first = formElement.querySelector<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('[aria-invalid="true"]');
      if (!first) return;
      // A field in a folded property can't take focus until the property is open. Only that
      // one opens; the others say how many fields they need in their headers.
      const owner = first.closest<HTMLElement>('[data-property]');
      if (owner) {
        const ownerId = Number(owner.dataset.property);
        flushSync(() => setCollapsedIds((ids) => ids.filter((id) => id !== ownerId)));
      }
      // Scroll to the label, not the control, so label, field and message are all in view.
      reveal(first, first.labels?.[0] ?? first);
      return;
    }

    setFieldErrors(NO_ERRORS);
    setErrorMsg(null);
    setStatus('submitting');

    let failure: string | null = null;
    try {
      const res = await fetch(LEAD_ENDPOINT, { method: 'POST', body: formData });
      const result = await res.json().catch(() => null);
      if (res.status === 429) failure = RATE_LIMITED;
      else if (!res.ok || !result?.success) failure = result?.error ?? 'Failed to submit form';
    } catch {
      // fetch only rejects when the request never got an answer
      failure = UNREACHABLE;
    }

    if (failure) {
      setErrorMsg(failure);
      setStatus('error');
      return;
    }

    // The submitted blocks give way to one fresh block. The client's own details stay in the
    // (hidden) form in case there are more properties to send.
    const freshId = nextPropertyId.current++;
    flushSync(() => {
      setReceipt(propertyIds.map((_, index) => addressLine(getter(index))));
      setPropertyIds([freshId]);
      setCollapsedIds([]);
      setAnswers({});
      setStatus('success');
    });
    if (successRef.current) reveal(successRef.current);
  };

  const submitMore = () => {
    flushSync(() => setStatus('idle'));
    revealProperty(propertyIds[0]);
  };

  const fe = fieldErrors.client;
  const submitLabel =
    propertyIds.length > 1 ? `Submit ${propertyIds.length} Properties` : 'Submit Property Information';

  return (
    <>
      {status === 'success' && (
        <div className={`${card} text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF6FB]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M5 14L11 20L23 8" stroke="#2978A5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            ref={successRef} tabIndex={-1}
            className="mt-5 scroll-mt-40 text-2xl font-semibold text-[#0C1014] focus:outline-none"
          >
            Thanks!
          </h2>
          <p className="mt-2 text-sm font-mono leading-relaxed text-[#0C1014]">
            {receipt.length === 1
              ? 'We received the information for this property:'
              : `We received the information for these ${receipt.length} properties:`}
          </p>
          <ol className="mt-3 space-y-1 text-sm font-mono leading-relaxed text-[#0C1014]">
            {receipt.map((line, i) => (
              <li key={i}>{receipt.length > 1 ? `${i + 1}. ${line}` : line}</li>
            ))}
          </ol>
          <button type="button" onClick={submitMore} className={`${pill} mt-6`}>
            Submit more properties
          </button>
        </div>
      )}

      {/* No submit button inside: Enter in a field must not send (or half-validate) the form. */}
      <form
        ref={formRef} hidden={status === 'success'}
        onSubmit={(e) => e.preventDefault()} onChange={handleChange} noValidate
        className="space-y-5"
      >
        <input type="hidden" name="leadType" value="Property Information Form" />
        <input type="hidden" name="propertyCount" value={propertyIds.length} />

        {/* ── Client Information ── */}
        <div className={card}>
          <SectionTitle>Client Information</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className={lbl}>Name{req}</label>
              <input
                id="name" name="name" type="text"
                aria-invalid={Boolean(fe.name)}
                aria-describedby={fe.name ? 'name-error' : undefined}
                className={inp} placeholder="Full name"
              />
              <Err id="name-error" msg={fe.name} />
            </div>
            <div>
              <label htmlFor="company" className={lbl}>Company</label>
              <input id="company" name="company" type="text" className={inp} placeholder="Company name" />
            </div>
            <div>
              <label htmlFor="email" className={lbl}>Email{req}</label>
              <input
                id="email" name="email" type="email" required
                aria-invalid={Boolean(fe.email)}
                aria-describedby={fe.email ? 'email-error' : undefined}
                className={inp} placeholder="you@company.com"
              />
              <Err id="email-error" msg={fe.email} />
            </div>
            <div>
              <label htmlFor="phone" className={lbl}>Phone{req}</label>
              <input
                id="phone" name="phone" type="tel" required inputMode="tel"
                aria-invalid={Boolean(fe.phone)}
                aria-describedby={fe.phone ? 'phone-error' : undefined}
                className={inp} placeholder="(555) 555-5555"
              />
              <Err id="phone-error" msg={fe.phone} />
            </div>
          </div>
        </div>

        {propertyIds.map((id, index) => (
          <PropertySection
            key={id} id={id} index={index}
            errors={fieldErrors.properties[id] ?? {}}
            answers={answers[id] ?? {}}
            collapsed={propertyIds.length > 1 && collapsedIds.includes(id)}
            removable={propertyIds.length > 1}
            onToggle={() => toggleProperty(id)}
            onRemove={() => removeProperty(id)}
          />
        ))}

        {propertyIds.length < MAX_PROPERTIES ? (
          <button
            type="button" onClick={addProperty}
            className="w-full rounded-2xl border-2 border-dashed border-[#5DAFD5] bg-white/60 px-6 py-5 text-sm font-semibold text-[#2978A5] transition hover:bg-white"
          >
            + Add another property
          </button>
        ) : (
          <p className="px-6 text-center text-sm font-mono leading-relaxed text-[#0C1014]">
            {MAX_PROPERTIES} properties is the most one submission can take. Submit these, then send the
            rest in a second one.
          </p>
        )}

        {/* ── Confirmation ── */}
        <div className={card}>
          <SectionTitle>Confirmation</SectionTitle>
          <div className="space-y-5">
            <p className="text-sm font-mono leading-relaxed text-[#0C1014]">
              By submitting this form, I confirm that the information provided is accurate and
              complete. I understand that Blue Bunny Turnover Services is not responsible for service
              issues resulting from inaccurate or outdated property information.
            </p>
            <div>
              <label htmlFor="clientName" className={lbl}>Client name{req}</label>
              <input
                id="clientName" name="clientName" type="text" required
                aria-invalid={Boolean(fe.clientName)}
                aria-describedby={fe.clientName ? 'client-name-error' : undefined}
                className={inp} placeholder="Full name"
              />
              <Err id="client-name-error" msg={fe.clientName} />
            </div>
            <button
              type="button" onClick={handleSubmit}
              disabled={status === 'submitting'}
              aria-describedby={errorCount > 0 ? 'form-error-count' : undefined}
              className="w-full rounded-xl bg-[#2978A5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0C1014] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {status === 'submitting' ? 'Submitting…' : status === 'error' ? 'Try Again' : submitLabel}
            </button>
          </div>
          {/* Both stay in the DOM while empty so screen readers announce what appears in them. */}
          <div id="form-error-count" role="status">
            {errorCount > 0 && (
              <p className="mt-5 text-sm font-mono text-red-600">
                {errorCount === 1 ? '1 field needs attention.' : `${errorCount} fields need attention.`}
              </p>
            )}
          </div>
          <div role="alert">
            {errorMsg && <p className="mt-5 text-sm font-mono text-red-600">{errorMsg}</p>}
          </div>
        </div>
      </form>
    </>
  );
}
