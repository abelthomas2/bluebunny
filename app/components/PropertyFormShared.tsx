'use client';

import { ReactNode, RefObject, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { DEFAULT_WINDOW_MS } from '@/app/lib/rateLimiter';

// What the Property Information Form and the Property Update Form have in common, so both ask
// the same questions with the same names, checks and messages.

const LEAD_ENDPOINT = '/api/leads';

// Every property travels in one Formspree submission, about 45 fields each. Formspree
// publishes no field limit, so raise this only after a real submission of that size arrives.
export const MAX_PROPERTIES = 10;

// The server's own 429 message says to wait a minute; its window is longer than that.
const RATE_LIMITED = `Too many attempts from this device. Wait ${DEFAULT_WINDOW_MS / 60_000} minutes, then try again. Your answers will stay on this page.`;
const UNREACHABLE =
  "Couldn't reach the server. Check your connection and try again. Your answers are still on this page.";

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export type ClientField = 'name' | 'email' | 'billingEmail' | 'phone' | 'clientName';

export type PropertyField =
  | 'propertyAddress' | 'city' | 'state' | 'zip' | 'bedrooms' | 'fullBaths' | 'halfBaths' | 'maxGuests'
  | 'firstTurnoverDate'
  | 'checkinTime' | 'checkoutTime'
  | 'primaryAccess' | 'accessInstructions' | 'secondaryAccess' | 'gatedCommunity' | 'gateCode'
  | 'washer' | 'dryer' | 'appliancesFunctioning' | 'appliancesIssue' | 'linenStorage' | 'linenSets'
  | 'hasPool' | 'poolCleaning' | 'hasGrill' | 'grillCleaning' | 'grillType'
  | 'consumablesModel' | 'consumablesStorage'
  | 'thermostatTemp' | 'fanSetting' | 'thermostatLocation' | 'thermostatNotes'
  | 'stagingPreferences' | 'listingPhotosUrl' | 'listingPhotosByEmail' | 'hasWelcomeLights' | 'welcomeLightsDesc'
  | 'hasAlarm' | 'alarmInstructions' | 'specialSurfaces' | 'additionalNotes'
  | 'pmsPlatform' | 'pmsOther' | 'icalLink';

// Selects whose answer decides whether a follow-up field is shown.
const CONTROLLING = [
  'gatedCommunity', 'washer', 'dryer', 'appliancesFunctioning', 'hasPool', 'hasGrill',
  'consumablesModel', 'hasWelcomeLights', 'hasAlarm', 'pmsPlatform',
] as const satisfies readonly PropertyField[];

type Answers = Partial<Record<(typeof CONTROLLING)[number], string>>;

export type ClientErrors = Partial<Record<ClientField, string>>;
export type PropertyErrors = Partial<Record<PropertyField, string>>;

type Choice = string | { value: string; label: string };

export const YES_NO: Choice[] = ['Yes', 'No'];
export const ACCESS_METHODS: Choice[] = [
  'Lockbox', 'Smart lock', 'Key (hidden location)', 'Gate code + door code', 'Other',
];
export const GRILL_TYPES: Choice[] = ['Gas (propane)', 'Gas (natural)', 'Charcoal', 'Electric'];
export const CONSUMABLES_MODELS: Choice[] = [
  {
    value: 'Blue Bunny-supplied',
    label: 'Blue Bunny-supplied ($7.00 base + $4.00 per full bathroom + $2.00 per half bathroom, per turnover)',
  },
  { value: 'Client-supplied', label: 'Client-supplied (no charge, restocked from on-site inventory)' },
];
export const PMS_PLATFORMS: Choice[] = [
  'Guesty', 'Hostaway', 'Hospitable', 'Lodgify', 'OwnerRez', 'Airbnb', 'VRBO', 'Other',
  'None, I will schedule turnovers directly',
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_PATTERN = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/i;
const ZIP_PATTERN = /^\d{5}$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;
const URL_PATTERN = /^https?:\/\/.+/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

// The checks and messages that more than one question, or both forms, use.
export const valid = {
  email: (v: string) => EMAIL_PATTERN.test(v),
  phone: (v: string) => v.replace(/\D/g, '').length >= 10,
  state: (v: string) => STATE_PATTERN.test(v),
  zip: (v: string) => ZIP_PATTERN.test(v),
  time: (v: string) => TIME_PATTERN.test(v),
  url: (v: string) => URL_PATTERN.test(v),
  bedrooms: (v: string) => parseInt(v, 10) >= 0,
  fullBaths: (v: string) => parseInt(v, 10) >= 1,
  maxGuests: (v: string) => WHOLE_NUMBER_PATTERN.test(v) && parseInt(v, 10) >= 1,
};

export const MSG = {
  email: 'Enter a valid email address.',
  phone: 'Phone number must include at least 10 digits.',
  propertyAddress: 'Property address is required.',
  city: 'City is required.',
  state: 'Enter a valid 2-letter state code (e.g. FL).',
  zip: 'Enter a valid 5-digit ZIP code.',
  bedrooms: 'Enter the number of bedrooms (0 or more).',
  fullBaths: 'Enter the number of full bathrooms (at least 1).',
  maxGuests: 'Enter the maximum number of guests allowed (1 or more).',
  checkinTime: 'Enter a valid check-in time (e.g., 3:00 PM).',
  checkoutTime: 'Enter a valid checkout time (e.g., 11:00 AM).',
  gateCode: 'Gate code or instructions are required.',
  grillType: 'Select the grill type.',
  consumablesStorage: 'Indicate where consumables are stored.',
  listingLink: 'Enter a link, or tick the box to email photos instead.',
  welcomeLightsDesc: 'Describe which lights to leave on.',
  alarmInstructions: 'Arming instructions are required.',
  pmsOther: 'Specify the platform name.',
  url: 'Enter a valid URL starting with http:// or https://.',
  ical: 'Enter a valid iCal URL starting with http:// or https://.',
};

export function str(formData: FormData, key: string) {
  return (formData.get(key) as string | null)?.trim() ?? '';
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
  // "Currently functioning?" is only asked while a machine is on-site.
  if (answers.washer !== 'Yes' && answers.dryer !== 'Yes') answers.appliancesFunctioning = '';
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

export function validateClient(get: (key: ClientField) => string): ClientErrors {
  const errors: ClientErrors = {};

  if (!get('name')) errors.name = 'Name is required.';
  if (!valid.email(get('email'))) errors.email = MSG.email;
  if (get('billingEmail') && !valid.email(get('billingEmail'))) errors.billingEmail = MSG.email;
  if (!valid.phone(get('phone'))) errors.phone = MSG.phone;
  if (!get('clientName')) errors.clientName = 'Please enter your name to confirm.';

  return errors;
}

function validateProperty(get: (key: PropertyField) => string): PropertyErrors {
  const errors: PropertyErrors = {};

  // ── Property Details ──
  if (!get('propertyAddress')) errors.propertyAddress = MSG.propertyAddress;
  if (!get('city')) errors.city = MSG.city;
  if (!valid.state(get('state'))) errors.state = MSG.state;
  if (!valid.zip(get('zip'))) errors.zip = MSG.zip;
  if (!valid.bedrooms(get('bedrooms'))) errors.bedrooms = MSG.bedrooms;
  if (!valid.fullBaths(get('fullBaths'))) errors.fullBaths = MSG.fullBaths;
  if (!valid.maxGuests(get('maxGuests'))) errors.maxGuests = MSG.maxGuests;

  // ── Check-in & Checkout ──
  if (!valid.time(get('checkinTime'))) errors.checkinTime = MSG.checkinTime;
  if (!valid.time(get('checkoutTime'))) errors.checkoutTime = MSG.checkoutTime;

  // ── Property Access ──
  if (!get('primaryAccess')) errors.primaryAccess = 'Select an access method.';
  if (!get('accessInstructions'))
    errors.accessInstructions = 'Access instructions are required.';
  if (!get('gatedCommunity'))
    errors.gatedCommunity = 'Indicate whether the property is in a gated community.';
  if (get('gatedCommunity') === 'Yes' && !get('gateCode')) errors.gateCode = MSG.gateCode;

  // ── Appliances & Laundry ──
  if (!get('washer')) errors.washer = 'Indicate if a washer is on-site.';
  if (!get('dryer')) errors.dryer = 'Indicate if a dryer is on-site.';
  if ((get('washer') === 'Yes' || get('dryer') === 'Yes') && !get('appliancesFunctioning'))
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
    if (!get('grillType')) errors.grillType = MSG.grillType;
  }

  // ── Consumables ──
  if (!get('consumablesModel'))
    errors.consumablesModel = 'Select a consumables model.';
  if (get('consumablesModel') === 'Client-supplied' && !get('consumablesStorage'))
    errors.consumablesStorage = MSG.consumablesStorage;

  // ── Thermostat ──
  if (!get('thermostatLocation'))
    errors.thermostatLocation = 'Thermostat location is required.';

  // ── Staging & Notes ──
  const listingLink = get('listingPhotosUrl');
  if (listingLink) {
    if (!valid.url(listingLink)) errors.listingPhotosUrl = MSG.url;
  } else if (!get('listingPhotosByEmail')) {
    errors.listingPhotosUrl = MSG.listingLink;
  }
  if (!get('hasWelcomeLights'))
    errors.hasWelcomeLights = 'Indicate whether there are designated arrival lights.';
  if (get('hasWelcomeLights') === 'Yes' && !get('welcomeLightsDesc'))
    errors.welcomeLightsDesc = MSG.welcomeLightsDesc;
  if (!get('hasAlarm'))
    errors.hasAlarm = 'Indicate whether the property has an alarm system.';
  if (get('hasAlarm') === 'Yes' && !get('alarmInstructions'))
    errors.alarmInstructions = MSG.alarmInstructions;

  // ── PMS / Calendar ──
  if (!get('pmsPlatform')) errors.pmsPlatform = 'Select a PMS platform.';
  if (get('pmsPlatform') === 'Other' && !get('pmsOther')) errors.pmsOther = MSG.pmsOther;
  // Not every client has a calendar feed, so the link is only checked when given.
  if (get('icalLink') && !valid.url(get('icalLink'))) errors.icalLink = MSG.ical;

  return errors;
}

// One line per property for the confirmation: "123 Main St, Kissimmee, FL 34741"
export function addressLine(get: (key: PropertyField) => string) {
  const stateZip = [get('state').toUpperCase(), get('zip')].filter(Boolean).join(' ');
  return [get('propertyAddress'), get('city'), stateZip].filter(Boolean).join(', ');
}

// After a failed submit an error goes away once its field is fixed; nothing new is flagged
// until the next submit.
export function stillInvalid<K extends string>(shown: Partial<Record<K, string>>, fresh: Partial<Record<K, string>>) {
  const kept: Partial<Record<K, string>> = {};
  for (const key of Object.keys(shown) as K[]) {
    if (fresh[key]) kept[key] = fresh[key];
  }
  return kept;
}

// Untouched: nothing typed or ticked, every select still on its default option.
function isPristine(root: HTMLElement) {
  const controls = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  );
  return Array.from(controls).every((el) => {
    if (el instanceof HTMLSelectElement)
      return Array.from(el.options).every((option) => option.selected === option.defaultSelected);
    if (el instanceof HTMLInputElement && el.type === 'checkbox') return el.checked === el.defaultChecked;
    return el.value === el.defaultValue;
  });
}

// Every programmatic focus move goes through here. Focus first, then scroll, so the explicit
// scroll has the last word over the browser's own focus scrolling. Instant, like the browser's
// built-in validation: iOS only raises the keyboard for a focus made inside the tap, and a
// smooth scroll would be cut short when it does.
export function reveal(el: HTMLElement, scrollTarget: Element = el) {
  el.focus();
  scrollTarget.scrollIntoView({ block: 'start', behavior: 'instant' });
}

// Lands in a property's first field with its header at the top of the screen.
export function revealProperty(id: number) {
  const group = document.getElementById(`p${id}`);
  const first = document.getElementById(`p${id}-propertyAddress`);
  if (group && first) reveal(first, group);
}

// Jumps to the first thing that needs attention. Call it once the errors are on the page:
// invalid controls carry aria-invalid="true" (a group that needs an answer, data-invalid),
// and DOM order is visual order.
export function revealFirstInvalid(form: HTMLFormElement, openProperty: (id: number) => void) {
  const first = form.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]');
  if (!first) return;
  // A field in a folded property can't take focus until the property is open. Only that one
  // opens; the others say how many fields they need in their headers.
  const owner = first.closest<HTMLElement>('[data-property]');
  if (owner) flushSync(() => openProperty(Number(owner.dataset.property)));
  // Scroll to the label, not the control, so label, field and message are all in view.
  reveal(first, (first as HTMLInputElement).labels?.[0] ?? first);
}

// Sends one submission. Resolves to a message for the client if it failed, null if it went through.
export async function submitLead(formData: FormData): Promise<string | null> {
  try {
    const res = await fetch(LEAD_ENDPOINT, { method: 'POST', body: formData });
    const result = await res.json().catch(() => null);
    if (res.status === 429) return RATE_LIMITED;
    if (!res.ok || !result?.success) return result?.error ?? 'Failed to submit form';
    return null;
  } catch {
    // fetch only rejects when the request never got an answer
    return UNREACHABLE;
  }
}

// Sizes, radii and spacing follow the home page: its cards, body text and buttons.
const fieldBase =
  'w-full rounded-xl border border-[#90A4AE] bg-white px-3 text-sm text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]';
// Inputs and selects share one height, the same as the buttons.
export const inp = fieldBase + ' h-11';
export const sel = inp;
export const ta = fieldBase + ' py-2.5 resize-none';
export const lbl = 'mb-1 block scroll-mt-24 text-sm font-mono text-[#0C1014]';
export const card = 'rounded-2xl border border-[#E2EEF5] bg-white p-6 shadow-sm';
export const pill =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#E2EEF5] bg-white px-5 py-2.5 text-sm font-semibold text-[#2978A5] shadow-sm transition hover:border-[#5DAFD5]/40 hover:text-[#0C1014]';
// A price or term the client is agreeing to, shown where the choice is made.
export const note =
  'rounded-xl border border-[#E2EEF5] bg-[#F0F9FF] px-5 py-4 text-sm font-mono leading-relaxed text-[#0C1014]';
export const hint = 'mt-1 text-xs font-mono leading-relaxed text-[#0C1014]/75';
export const checkbox = 'h-4 w-4 shrink-0 accent-[#2978A5]';
const textButton = 'min-h-11 text-sm font-mono font-semibold transition';
export const req = <span className="text-[#2978A5]"> *</span>;

// A select's options. The first is a prompt that can't be picked or, where leaving the
// question alone is an answer, a blank the client can go back to.
export function choices(values: readonly Choice[], blank?: string) {
  return (
    <>
      {blank === undefined ? <option value="" disabled>Select one</option> : <option value="">{blank}</option>}
      {values.map((choice) => {
        const { value, label } = typeof choice === 'string' ? { value: choice, label: choice } : choice;
        return <option key={value} value={value}>{label}</option>;
      })}
    </>
  );
}

const yesNo = choices(YES_NO);

export function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="mt-1 text-xs font-mono text-red-600">{msg}</p>;
}

export function SectionTitle({
  as: Tag = 'h2',
  id,
  children,
}: {
  as?: 'h2' | 'h3';
  id?: string;
  children: ReactNode;
}) {
  return (
    <Tag id={id} className="mb-5 pb-4 border-b border-[#E2EEF5] text-lg font-bold text-[#0C1014]">
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

  const hasMachine = answers.washer === 'Yes' || answers.dryer === 'Yes';
  const notFunctioning = hasMachine && answers.appliancesFunctioning === 'No';
  // Offsite laundry applies while either machine is absent or out of service.
  const offsiteLaundry = answers.washer === 'No' || answers.dryer === 'No' || notFunctioning;

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
                {/* Kept on one line: a wrapped label would drop this field below its neighbour on narrow phones. */}
                <label htmlFor={fid('fullBaths')} className={`${lbl} whitespace-nowrap`}>Full bathrooms{req}</label>
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
            <div>
              <label htmlFor={fid('firstTurnoverDate')} className={lbl}>First turnover date, if known</label>
              <input {...field('firstTurnoverDate')} type="date" className={inp} />
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
                {choices(ACCESS_METHODS)}
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
            {hasMachine && (
              <div>
                <label htmlFor={fid('appliancesFunctioning')} className={lbl}>Currently functioning?{req}</label>
                <select {...field('appliancesFunctioning')} defaultValue="" className={sel}>
                  {yesNo}
                </select>
                <Err id={eid('appliancesFunctioning')} msg={fe.appliancesFunctioning} />
              </div>
            )}
            {notFunctioning && (
              <div className="md:col-span-2">
                <label htmlFor={fid('appliancesIssue')} className={lbl}>Describe the issue</label>
                <textarea {...field('appliancesIssue')} rows={2} className={ta} />
              </div>
            )}
            {/* The second label is long: side by side only where it fits on one line. */}
            <div className="grid gap-4 md:col-span-2 lg:grid-cols-[2fr_3fr]">
              <div>
                <label htmlFor={fid('linenStorage')} className={lbl}>Linen storage location</label>
                <input {...field('linenStorage')} type="text" className={inp} placeholder="e.g., Hall closet upstairs" />
                <Err id={eid('linenStorage')} msg={fe.linenStorage} />
              </div>
              <div>
                <label htmlFor={fid('linenSets')} className={lbl}>Approximate linen sets on-site, including backup sets</label>
                <input {...field('linenSets')} type="number" min="0" className={inp} placeholder="4" />
              </div>
            </div>
            {offsiteLaundry && (
              <p className={`${note} md:col-span-2`}>
                Offsite laundry applies at this property: $20.00 handling + laundry charges at cost + $1.00
                per mile beyond ten miles, each trip. Keep a backup linen set at the property.
              </p>
            )}
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
                <p className={hint}>$18.00 per turnover. Keep a skimmer net at the property.</p>
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
                  <p className={hint}>$12.00 per turnover. Keep a grill brush at the property.</p>
                </div>
                <div>
                  <label htmlFor={fid('grillType')} className={lbl}>Grill type{req}</label>
                  <select {...field('grillType')} defaultValue="" className={sel}>
                    {choices(GRILL_TYPES)}
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
                {choices(CONSUMABLES_MODELS)}
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
            {answers.consumablesModel === 'Blue Bunny-supplied' && (
              <p className={`${note} md:col-span-2`}>
                Blue Bunny stocks the property in cycles of about six months. If the property leaves the
                program or is removed before the stock is used, the remaining stock is billed at Blue
                Bunny&apos;s documented cost.
              </p>
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
            <div className="md:col-span-2">
              <label htmlFor={fid('listingPhotosUrl')} className={lbl}>Listing link, or link to staging photos{req}</label>
              <input {...field('listingPhotosUrl')} type="url" className={inp} placeholder="https://..." />
              <Err id={eid('listingPhotosUrl')} msg={fe.listingPhotosUrl} />
              <label className="mt-2 flex items-center gap-2.5 text-sm font-mono text-[#0C1014]">
                <input
                  type="checkbox" id={fid('listingPhotosByEmail')} name={fieldName(index, 'listingPhotosByEmail')}
                  value="Yes" className={checkbox}
                />
                I don&apos;t have a link. I will email staging photos.
              </label>
            </div>
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
                {choices(PMS_PLATFORMS)}
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
              <label htmlFor={fid('icalLink')} className={lbl}>iCal link for this property</label>
              <input {...field('icalLink')} type="url" className={inp} placeholder="https://..." />
              <Err id={eid('icalLink')} msg={fe.icalLink} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The list of property cards: which exist, which are folded, their follow-up answers and errors. */
export function usePropertyCards() {
  // One id per card, in display order.
  const [ids, setIds] = useState<number[]>([0]);
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  // Each card's answers to the controlling selects, by card id. The DOM holds the answers;
  // this mirrors them so the right follow-up fields render.
  const [answers, setAnswers] = useState<Record<number, Answers>>({});
  // By card id too, so errors stay with their card when another is removed and the rest renumber.
  const [errors, setErrors] = useState<Record<number, PropertyErrors>>({});
  const nextId = useRef(1);

  const getter = (formData: FormData, index: number) => (key: PropertyField) =>
    str(formData, fieldName(index, key));

  const add = () => {
    if (ids.length >= MAX_PROPERTIES) return;
    const id = nextId.current++;
    // Commit first: the new card has to exist, and the others have to be folded away,
    // before there is a final position to scroll to.
    flushSync(() => {
      setCollapsedIds(ids);
      setIds([...ids, id]);
    });
    revealProperty(id);
  };

  const remove = (id: number) => {
    if (ids.length <= 1) return;
    const index = ids.indexOf(id);
    const remaining = ids.filter((p) => p !== id);
    flushSync(() => {
      setIds(remaining);
      setCollapsedIds((folded) => folded.filter((p) => p !== id));
      setAnswers((prev) => without(prev, id));
      setErrors((prev) => without(prev, id));
    });
    // Keep keyboard focus beside where the card was: on whatever slid into its place.
    const neighbour = remaining[Math.min(index, remaining.length - 1)];
    document.getElementById(`p${neighbour}-heading`)?.focus();
  };

  const toggle = (id: number) =>
    setCollapsedIds((folded) => (folded.includes(id) ? folded.filter((p) => p !== id) : [...folded, id]));

  const open = (id: number) => setCollapsedIds((folded) => folded.filter((p) => p !== id));

  // A browser restoring the page (reload, Back) can set a select without a change event.
  // Re-reads the answers so a follow-up field is never required while it is not on screen.
  // True when fields appeared or went: take a fresh FormData.
  const sync = (formData: FormData) => {
    const live: Record<number, Answers> = {};
    ids.forEach((id, index) => {
      live[id] = readAnswers(getter(formData, index));
    });
    if (ids.every((id) => sameAnswers(live[id], answers[id]))) return false;
    flushSync(() => setAnswers(live));
    return true;
  };

  const validate = (formData: FormData) => {
    const found: Record<number, PropertyErrors> = {};
    ids.forEach((id, index) => {
      const cardErrors = validateProperty(getter(formData, index));
      if (Object.keys(cardErrors).length > 0) found[id] = cardErrors;
    });
    return found;
  };

  // For the form's change handler. False when the field is not a property card's.
  const handleChange = (form: HTMLFormElement, name: string) => {
    const match = PROPERTY_NAME.exec(name);
    if (!match) return false;

    const index = Number(match[1]) - 1;
    const id = ids[index];
    const controlling = (CONTROLLING as readonly string[]).includes(match[2]);
    const shown = errors[id];
    if (!controlling && !shown) return true;

    const get = getter(new FormData(form), index);
    // Show or hide the follow-up fields for this property's answers.
    if (controlling) setAnswers((prev) => ({ ...prev, [id]: readAnswers(get) }));
    // Re-check the property so fixed fields lose their message as the client works.
    if (shown) {
      const kept = stillInvalid(shown, validateProperty(get));
      if (Object.keys(kept).length !== Object.keys(shown).length) setErrors((prev) => ({ ...prev, [id]: kept }));
    }
    return true;
  };

  // Back to one fresh card.
  const reset = () => {
    setIds([nextId.current++]);
    setCollapsedIds([]);
    setAnswers({});
    setErrors({});
  };

  const addresses = (formData: FormData) => ids.map((_, index) => addressLine(getter(formData, index)));

  const errorCount = Object.values(errors).reduce((n, cardErrors) => n + Object.keys(cardErrors).length, 0);

  return {
    ids, collapsedIds, answers, errors, errorCount,
    add, remove, toggle, open, sync, validate, setErrors, handleChange, reset, addresses,
  };
}

export function PropertyCards({ cards }: { cards: ReturnType<typeof usePropertyCards> }) {
  const several = cards.ids.length > 1;

  return (
    <>
      {cards.ids.map((id, index) => (
        <PropertySection
          key={id} id={id} index={index}
          errors={cards.errors[id] ?? {}}
          answers={cards.answers[id] ?? {}}
          collapsed={several && cards.collapsedIds.includes(id)}
          removable={several}
          onToggle={() => cards.toggle(id)}
          onRemove={() => cards.remove(id)}
        />
      ))}

      {cards.ids.length < MAX_PROPERTIES ? (
        <button
          type="button" onClick={cards.add}
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
    </>
  );
}

export function ClientInformation({ errors: fe, billingEmail = false }: { errors: ClientErrors; billingEmail?: boolean }) {
  return (
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
        {billingEmail && (
          <div>
            <label htmlFor="billingEmail" className={lbl}>Billing email, if different</label>
            <input
              id="billingEmail" name="billingEmail" type="email"
              aria-invalid={Boolean(fe.billingEmail)}
              aria-describedby={fe.billingEmail ? 'billingEmail-error' : undefined}
              className={inp} placeholder="billing@company.com"
            />
            <Err id="billingEmail-error" msg={fe.billingEmail} />
          </div>
        )}
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
  );
}

type ConfirmationCardProps = {
  /** What the client attests to by submitting. */
  statement: string;
  /** Error on the typed name. */
  error?: string;
  submitLabel: string;
  status: FormStatus;
  errorCount: number;
  errorMsg: string | null;
  onSubmit: () => void;
};

export function ConfirmationCard({
  statement, error, submitLabel, status, errorCount, errorMsg, onSubmit,
}: ConfirmationCardProps) {
  return (
    <div className={card}>
      <SectionTitle>Confirmation</SectionTitle>
      <div className="space-y-5">
        <p className="text-sm font-mono leading-relaxed text-[#0C1014]">{statement}</p>
        <div>
          <label htmlFor="clientName" className={lbl}>Client name{req}</label>
          <input
            id="clientName" name="clientName" type="text" required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'client-name-error' : undefined}
            className={inp} placeholder="Full name"
          />
          <Err id="client-name-error" msg={error} />
        </div>
        <button
          type="button" onClick={onSubmit}
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
  );
}

type SuccessPanelProps = {
  headingRef: RefObject<HTMLHeadingElement | null>;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
};

export function SuccessPanel({ headingRef, actionLabel, onAction, children }: SuccessPanelProps) {
  return (
    <div className={`${card} text-center`}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF6FB]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <path d="M5 14L11 20L23 8" stroke="#2978A5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2
        ref={headingRef} tabIndex={-1}
        className="mt-5 scroll-mt-40 text-2xl font-semibold text-[#0C1014] focus:outline-none"
      >
        Thanks!
      </h2>
      <div className="mt-2 space-y-3 text-sm font-mono leading-relaxed text-[#0C1014]">{children}</div>
      <button type="button" onClick={onAction} className={`${pill} mt-6`}>
        {actionLabel}
      </button>
    </div>
  );
}
