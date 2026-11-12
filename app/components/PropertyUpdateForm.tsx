'use client';

import { FormEvent, ReactNode, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { CHANGE_GROUPS, ChangeGroup } from '@/app/lib/propertyForms';
import {
  ACCESS_METHODS,
  CONSUMABLES_MODELS,
  ClientInformation,
  ConfirmationCard,
  Err,
  FormStatus,
  GRILL_TYPES,
  MSG,
  PMS_PLATFORMS,
  PropertyCards,
  SectionTitle,
  SuccessPanel,
  YES_NO,
  addressLine,
  card,
  checkbox,
  choices,
  inp,
  lbl,
  note,
  req,
  reveal,
  revealFirstInvalid,
  sel,
  stillInvalid,
  str,
  submitLead,
  ta,
  usePropertyCards,
  valid,
  validateClient,
} from '@/app/components/PropertyFormShared';

type Request = 'add' | 'change' | 'remove';
type Errors = Partial<Record<string, string>>;

const REQUESTS: { value: Request; label: string }[] = [
  { value: 'add', label: 'Add a property' },
  { value: 'change', label: "Change a property's details" },
  { value: 'remove', label: 'Remove a property' },
];

// When each kind of request takes effect. A change has one line for access details and one
// for everything else.
const EXPECT: { request: Request; line: string }[] = [
  {
    request: 'add',
    line: 'Blue Bunny will email you the date service starts at each new property. That date can be up to 7 days after we receive this form.',
  },
  {
    request: 'change',
    line: 'Changes to access details take effect when Blue Bunny acknowledges them, which we do promptly.',
  },
  {
    request: 'change',
    line: 'Other changes apply to turnovers whose guest checkout is at least 24 hours after we receive this form, unless Blue Bunny confirms sooner.',
  },
  { request: 'remove', line: 'A removal takes effect when Blue Bunny confirms it.' },
];

// The questions each tick box opens. All are optional, but a ticked box needs one answer.
const GROUP_FIELDS: Record<ChangeGroup, readonly string[]> = {
  access: [
    'primaryAccess', 'accessInstructions', 'secondaryAccess', 'gatedCommunity', 'gateCode',
    'hasAlarm', 'alarmInstructions', 'accessEffectiveFrom',
  ],
  times: ['checkinTime', 'checkoutTime'],
  counts: ['bedrooms', 'fullBaths', 'halfBaths', 'maxGuests'],
  addons: ['poolCleaning', 'grillCleaning', 'grillType'],
  consumables: ['consumablesModel', 'consumablesStorage'],
  laundry: ['washer', 'dryer', 'appliancesFunctioning', 'appliancesIssue', 'linenStorage', 'linenSets'],
  thermostat: ['thermostatTemp', 'fanSetting', 'thermostatLocation', 'thermostatNotes'],
  staging: [
    'stagingPreferences', 'listingPhotosUrl', 'hasWelcomeLights', 'welcomeLightsDesc',
    'specialSurfaces', 'additionalNotes',
  ],
  calendar: ['pmsPlatform', 'pmsOther', 'icalLink'],
  contact: ['newEmail', 'newPhone', 'billingEmail'],
  other: ['otherChange'],
};

// The price or term that comes with a kind of change, shown with its questions.
const GROUP_NOTES: Partial<Record<ChangeGroup, string>> = {
  access: 'Takes effect when Blue Bunny acknowledges it. If a turnover is scheduled today, also call or text us.',
  counts: 'Your turnover price follows the bedroom and bathroom count.',
  addons:
    '$18.00 pool, $12.00 grill, charged at every turnover until you remove it. Keep a skimmer net or grill brush at the property.',
  consumables:
    'Blue Bunny-supplied costs $7.00 base + $4.00 per full bathroom + $2.00 per half bathroom, per turnover, and is stocked in cycles of about six months. If you switch to client-supplied, the remaining Blue Bunny stock is billed at documented cost.',
  laundry:
    'While a washer or dryer is missing or out of service, offsite laundry applies: $20.00 handling + laundry charges at cost + $1.00 per mile beyond ten miles, each trip. Keep a backup linen set at the property.',
  contact: 'Blue Bunny sends notices and invoices to the most recent addresses you give us.',
};

const REMOVAL_NOTICES = [
  'The removal takes effect when Blue Bunny confirms it.',
  'Turnovers we have already accepted at this property will still be performed and billed unless you cancel them. Cancelling is free up to 12 hours before guest checkout.',
  "If Blue Bunny supplies the consumables at this property, the remaining stock is billed at Blue Bunny's documented cost, including shipping and sales tax.",
  "Please remove Blue Bunny's access to this property's calendar. We delete the property's access details within 30 days after the removal.",
  "Removing a property does not end your Client Service Agreement. To end it, send Blue Bunny 7 days' written notice by email.",
];

// Selects on the Change branch whose answer brings up a follow-up question.
const FOLLOW_UPS = [
  'gatedCommunity', 'hasAlarm', 'grillCleaning', 'consumablesModel', 'appliancesFunctioning',
  'hasWelcomeLights', 'pmsPlatform',
] as const;

type FollowUp = (typeof FOLLOW_UPS)[number];

// What the form is showing: the request, the ticked boxes, and the answers that bring up
// follow-up questions. The DOM holds all three; this mirrors them for rendering.
type View = { request: Request | ''; groups: ChangeGroup[]; follow: Partial<Record<FollowUp, string>> };

const BLANK_VIEW: View = { request: '', groups: [], follow: {} };

function readView(formData: FormData): View {
  const request = str(formData, 'requestType') as View['request'];
  // A tick box only counts while its branch is on the page, and a follow-up only while its box
  // is ticked: what leaves the page starts blank if it comes back.
  const groups = request === 'change' ? (formData.getAll('changeGroups') as ChangeGroup[]) : [];
  const follow: View['follow'] = {};
  for (const key of FOLLOW_UPS) {
    const onPage = groups.some((group) => GROUP_FIELDS[group].includes(key));
    follow[key] = onPage ? str(formData, key) : '';
  }
  return { request, groups, follow };
}

function sameView(a: View, b: View) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Client details, the request and, for a change or a removal, its questions. Properties being
// added are checked by the property cards themselves.
function validateUpdate(formData: FormData): Errors {
  const get = (key: string) => str(formData, key);
  const errors: Errors = { ...validateClient(get) };
  const request = get('requestType');

  if (!request) errors.requestType = 'Select what you would like to do.';
  if (request !== 'change' && request !== 'remove') return errors;

  if (!get('propertyAddress')) errors.propertyAddress = MSG.propertyAddress;
  if (!get('city')) errors.city = MSG.city;
  if (!valid.state(get('state'))) errors.state = MSG.state;
  if (!valid.zip(get('zip'))) errors.zip = MSG.zip;
  if (request === 'remove') return errors;

  const groups = formData.getAll('changeGroups') as ChangeGroup[];
  if (groups.length === 0) errors.changeGroups = 'Select at least one thing that is changing.';

  // A blank answer means no change. A filled one follows the information form's rule.
  const check = (key: string, ok: (value: string) => boolean, message: string) => {
    if (get(key) && !ok(get(key))) errors[key] = message;
  };
  check('checkinTime', valid.time, MSG.checkinTime);
  check('checkoutTime', valid.time, MSG.checkoutTime);
  check('bedrooms', valid.bedrooms, MSG.bedrooms);
  check('fullBaths', valid.fullBaths, MSG.fullBaths);
  check('maxGuests', valid.maxGuests, MSG.maxGuests);
  check('listingPhotosUrl', valid.url, MSG.url);
  check('icalLink', valid.url, MSG.ical);
  check('newEmail', valid.email, MSG.email);
  check('newPhone', valid.phone, MSG.phone);

  // Follow-up questions keep their rules.
  const needs = (parent: string, answer: string, key: string, message: string) => {
    if (get(parent) === answer && !get(key)) errors[key] = message;
  };
  needs('gatedCommunity', 'Yes', 'gateCode', MSG.gateCode);
  needs('hasAlarm', 'Yes', 'alarmInstructions', MSG.alarmInstructions);
  needs('grillCleaning', 'Yes', 'grillType', MSG.grillType);
  needs('consumablesModel', 'Client-supplied', 'consumablesStorage', MSG.consumablesStorage);
  needs('hasWelcomeLights', 'Yes', 'welcomeLightsDesc', MSG.welcomeLightsDesc);
  needs('pmsPlatform', 'Other', 'pmsOther', MSG.pmsOther);

  for (const group of groups) {
    if (group === 'other') {
      if (!get('otherChange')) errors.otherChange = 'Describe the change.';
    } else if (!GROUP_FIELDS[group].some((key) => get(key))) {
      errors[`group:${group}`] = 'Enter at least one change in this section.';
    }
  }

  return errors;
}

// On a change or a removal a blank answer means "no change", so it is not sent at all.
function withoutBlanks(formData: FormData) {
  const filled = new FormData();
  for (const [name, value] of formData) {
    if (typeof value !== 'string' || value.trim() !== '') filled.append(name, value);
  }
  return filled;
}

// A radio or tick box as a tappable row, the height of the other fields.
function option(chosen: boolean) {
  return `flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm font-mono text-[#0C1014] ${
    chosen ? 'border-[#2978A5] bg-[#F0F9FF]' : 'border-[#90A4AE] bg-white'
  }`;
}

const groupError = 'text-xs font-mono text-red-600';

// Spread onto a control on the Change and Remove branches. One update is about one property,
// so ids and names are the bare field names.
function bind(errors: Errors) {
  return (key: string) => ({
    id: key,
    name: key,
    'aria-invalid': Boolean(errors[key]),
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  });
}

function RequestCard({ request, error }: { request: View['request']; error?: string }) {
  // Before a choice, every line; after it, only that request's.
  const lines = EXPECT.filter((item) => !request || item.request === request);

  return (
    <div className={card}>
      <div
        role="radiogroup" aria-labelledby="requestType-title" tabIndex={-1}
        data-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'requestType-error' : undefined}
        className="scroll-mt-24 focus:outline-none"
      >
        <SectionTitle id="requestType-title">What would you like to do?</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {REQUESTS.map(({ value, label }) => (
            <label key={value} className={option(request === value)}>
              <input type="radio" name="requestType" value={value} className={checkbox} />
              {label}
            </label>
          ))}
        </div>
        {error && <p id="requestType-error" className={`${groupError} mt-3`}>{error}</p>}
      </div>

      <div className={`${note} mt-5`}>
        <p className="font-semibold">What to expect</p>
        <ul className="mt-2 space-y-2">
          {lines.map((item) => (
            <li key={item.line}>{item.line}</li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-sm font-mono leading-relaxed text-[#0C1014]">
        This form does not cancel or reschedule a turnover, and it does not end your Client Service
        Agreement.
      </p>
    </div>
  );
}

function WhichProperty({ errors: fe, children }: { errors: Errors; children?: ReactNode }) {
  const f = bind(fe);

  return (
    <div className={card}>
      <SectionTitle>Which property?</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="propertyAddress" className={lbl}>Property address{req}</label>
          <input {...f('propertyAddress')} type="text" className={inp} placeholder="123 Main St" />
          <Err id="propertyAddress-error" msg={fe.propertyAddress} />
        </div>
        <div>
          <label htmlFor="city" className={lbl}>City{req}</label>
          <input {...f('city')} type="text" className={inp} placeholder="Kissimmee" />
          <Err id="city-error" msg={fe.city} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className={lbl}>State{req}</label>
            <input {...f('state')} type="text" className={inp} placeholder="FL" maxLength={2} />
            <Err id="state-error" msg={fe.state} />
          </div>
          <div>
            <label htmlFor="zip" className={lbl}>ZIP{req}</label>
            <input {...f('zip')} type="text" inputMode="numeric" className={inp} placeholder="34741" maxLength={5} />
            <Err id="zip-error" msg={fe.zip} />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// The questions behind one tick box: the information form's, with nothing pre-filled. Selects
// start on "No change", which sends nothing.
function ChangeFields({ group, errors: fe, follow }: { group: ChangeGroup; errors: Errors; follow: View['follow'] }) {
  const f = bind(fe);
  const noChange = 'No change';

  switch (group) {
    case 'access':
      return (
        <>
          <div className="md:col-span-2">
            <label htmlFor="primaryAccess" className={lbl}>Primary access method</label>
            <select {...f('primaryAccess')} defaultValue="" className={sel}>
              {choices(ACCESS_METHODS, noChange)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="accessInstructions" className={lbl}>Access instructions</label>
            <textarea
              {...f('accessInstructions')} rows={2} className={ta}
              placeholder="e.g., Lockbox on front door handle, code 4821."
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="secondaryAccess" className={lbl}>Secondary access or backup entry method, if any</label>
            <textarea {...f('secondaryAccess')} rows={2} className={ta} />
          </div>
          <div>
            <label htmlFor="gatedCommunity" className={lbl}>Inside a gated community?</label>
            <select {...f('gatedCommunity')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          {follow.gatedCommunity === 'Yes' && (
            <div>
              <label htmlFor="gateCode" className={lbl}>Gate code or access instructions{req}</label>
              <input {...f('gateCode')} type="text" className={inp} placeholder="Gate code or instructions" />
              <Err id="gateCode-error" msg={fe.gateCode} />
            </div>
          )}
          <div>
            <label htmlFor="hasAlarm" className={lbl}>Alarm or security system?</label>
            <select {...f('hasAlarm')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          {follow.hasAlarm === 'Yes' && (
            <div className="md:col-span-2">
              <label htmlFor="alarmInstructions" className={lbl}>Arming instructions{req}</label>
              <textarea {...f('alarmInstructions')} rows={2} className={ta} />
              <Err id="alarmInstructions-error" msg={fe.alarmInstructions} />
            </div>
          )}
          <div className="md:col-span-2">
            <label htmlFor="accessEffectiveFrom" className={lbl}>When do the new details start working?</label>
            <input {...f('accessEffectiveFrom')} type="text" className={inp} placeholder="e.g., Today at 2:00 PM" />
          </div>
        </>
      );

    case 'times':
      return (
        <>
          <div>
            <label htmlFor="checkinTime" className={lbl}>Guest check-in time</label>
            <input {...f('checkinTime')} type="text" className={inp} placeholder="e.g., 3:00 PM" />
            <Err id="checkinTime-error" msg={fe.checkinTime} />
          </div>
          <div>
            <label htmlFor="checkoutTime" className={lbl}>Guest checkout time</label>
            <input {...f('checkoutTime')} type="text" className={inp} placeholder="e.g., 11:00 AM" />
            <Err id="checkoutTime-error" msg={fe.checkoutTime} />
          </div>
        </>
      );

    case 'counts':
      return (
        <div className="md:col-span-2 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="bedrooms" className={lbl}>Bedrooms</label>
            <input {...f('bedrooms')} type="number" min="0" className={inp} />
            <Err id="bedrooms-error" msg={fe.bedrooms} />
          </div>
          <div>
            <label htmlFor="fullBaths" className={`${lbl} whitespace-nowrap`}>Full bathrooms</label>
            <input {...f('fullBaths')} type="number" min="1" className={inp} />
            <Err id="fullBaths-error" msg={fe.fullBaths} />
          </div>
          <div>
            <label htmlFor="halfBaths" className={lbl}>Half baths</label>
            <input {...f('halfBaths')} type="number" min="0" className={inp} />
          </div>
          <div>
            <label htmlFor="maxGuests" className={lbl}>Max guests</label>
            <input {...f('maxGuests')} type="number" inputMode="numeric" min="1" className={inp} />
            <Err id="maxGuests-error" msg={fe.maxGuests} />
          </div>
        </div>
      );

    case 'addons':
      return (
        <>
          <div>
            <label htmlFor="poolCleaning" className={lbl}>Pool cleaning each turn?</label>
            <select {...f('poolCleaning')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          <div>
            <label htmlFor="grillCleaning" className={lbl}>Grill cleaning each turn?</label>
            <select {...f('grillCleaning')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          {follow.grillCleaning === 'Yes' && (
            <div>
              <label htmlFor="grillType" className={lbl}>Grill type{req}</label>
              <select {...f('grillType')} defaultValue="" className={sel}>
                {choices(GRILL_TYPES)}
              </select>
              <Err id="grillType-error" msg={fe.grillType} />
            </div>
          )}
        </>
      );

    case 'consumables':
      return (
        <>
          <div className="md:col-span-2">
            <label htmlFor="consumablesModel" className={lbl}>Consumables model</label>
            <select {...f('consumablesModel')} defaultValue="" className={sel}>
              {choices(CONSUMABLES_MODELS, noChange)}
            </select>
          </div>
          {follow.consumablesModel === 'Client-supplied' && (
            <div className="md:col-span-2">
              <label htmlFor="consumablesStorage" className={lbl}>Where are consumables stored?{req}</label>
              <input {...f('consumablesStorage')} type="text" className={inp} placeholder="e.g., Under kitchen sink" />
              <Err id="consumablesStorage-error" msg={fe.consumablesStorage} />
            </div>
          )}
        </>
      );

    case 'laundry':
      return (
        <>
          <div>
            <label htmlFor="washer" className={lbl}>Washer on-site?</label>
            <select {...f('washer')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          <div>
            <label htmlFor="dryer" className={lbl}>Dryer on-site?</label>
            <select {...f('dryer')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          <div>
            <label htmlFor="appliancesFunctioning" className={lbl}>Currently functioning?</label>
            <select {...f('appliancesFunctioning')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          {follow.appliancesFunctioning === 'No' && (
            <div className="md:col-span-2">
              <label htmlFor="appliancesIssue" className={lbl}>Describe the issue</label>
              <textarea {...f('appliancesIssue')} rows={2} className={ta} />
            </div>
          )}
          <div className="grid gap-4 md:col-span-2 lg:grid-cols-[2fr_3fr]">
            <div>
              <label htmlFor="linenStorage" className={lbl}>Linen storage location</label>
              <input {...f('linenStorage')} type="text" className={inp} placeholder="e.g., Hall closet upstairs" />
            </div>
            <div>
              <label htmlFor="linenSets" className={lbl}>Approximate linen sets on-site, including backup sets</label>
              <input {...f('linenSets')} type="number" min="0" className={inp} />
            </div>
          </div>
        </>
      );

    case 'thermostat':
      return (
        <>
          <div>
            <label htmlFor="thermostatTemp" className={lbl}>Default thermostat setting (°F)</label>
            <input {...f('thermostatTemp')} type="number" min="60" max="85" className={inp} />
          </div>
          <div>
            <label htmlFor="fanSetting" className={lbl}>Fan setting</label>
            <select {...f('fanSetting')} defaultValue="" className={sel}>
              {choices(['Auto', 'On'], noChange)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="thermostatLocation" className={lbl}>Thermostat location</label>
            <input
              {...f('thermostatLocation')} type="text" className={inp}
              placeholder="e.g., Hallway between bedrooms"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="thermostatNotes" className={lbl}>Smart thermostat instructions, if any</label>
            <textarea {...f('thermostatNotes')} rows={2} className={ta} />
          </div>
        </>
      );

    case 'staging':
      return (
        <>
          <div className="md:col-span-2">
            <label htmlFor="stagingPreferences" className={lbl}>Pillow or bed staging preferences</label>
            <textarea
              {...f('stagingPreferences')} rows={3} className={ta}
              placeholder="e.g., Chop fold on throw pillows, accent blanket draped on left side of couch"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="listingPhotosUrl" className={lbl}>Listing link, or link to staging photos</label>
            <input {...f('listingPhotosUrl')} type="url" className={inp} placeholder="https://..." />
            <Err id="listingPhotosUrl-error" msg={fe.listingPhotosUrl} />
          </div>
          <div>
            <label htmlFor="hasWelcomeLights" className={lbl}>Designated welcome lights to leave on?</label>
            <select {...f('hasWelcomeLights')} defaultValue="" className={sel}>
              {choices(YES_NO, noChange)}
            </select>
          </div>
          {follow.hasWelcomeLights === 'Yes' && (
            <div>
              <label htmlFor="welcomeLightsDesc" className={lbl}>Describe{req}</label>
              <input
                {...f('welcomeLightsDesc')} type="text" className={inp}
                placeholder="e.g., Porch light and kitchen island pendant"
              />
              <Err id="welcomeLightsDesc-error" msg={fe.welcomeLightsDesc} />
            </div>
          )}
          <div className="md:col-span-2">
            <label htmlFor="specialSurfaces" className={lbl}>Surfaces requiring special care, if any</label>
            <textarea
              {...f('specialSurfaces')} rows={2} className={ta}
              placeholder="e.g., Natural stone countertops — use pH-neutral cleaner only"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="additionalNotes" className={lbl}>Additional property-specific notes</label>
            <textarea
              {...f('additionalNotes')} rows={3} className={ta}
              placeholder="Anything else the cleaning team should know"
            />
          </div>
        </>
      );

    case 'calendar':
      return (
        <>
          <div>
            <label htmlFor="pmsPlatform" className={lbl}>PMS platform</label>
            <select {...f('pmsPlatform')} defaultValue="" className={sel}>
              {choices(PMS_PLATFORMS, noChange)}
            </select>
          </div>
          {follow.pmsPlatform === 'Other' && (
            <div>
              <label htmlFor="pmsOther" className={lbl}>Specify platform{req}</label>
              <input {...f('pmsOther')} type="text" className={inp} />
              <Err id="pmsOther-error" msg={fe.pmsOther} />
            </div>
          )}
          <div className="md:col-span-2">
            <label htmlFor="icalLink" className={lbl}>iCal link for this property</label>
            <input {...f('icalLink')} type="url" className={inp} placeholder="https://..." />
            <Err id="icalLink-error" msg={fe.icalLink} />
          </div>
        </>
      );

    case 'contact':
      return (
        <>
          <div>
            <label htmlFor="newEmail" className={lbl}>New email</label>
            <input {...f('newEmail')} type="email" className={inp} placeholder="you@company.com" />
            <Err id="newEmail-error" msg={fe.newEmail} />
          </div>
          <div>
            <label htmlFor="newPhone" className={lbl}>New phone</label>
            <input {...f('newPhone')} type="tel" inputMode="tel" className={inp} placeholder="(555) 555-5555" />
            <Err id="newPhone-error" msg={fe.newPhone} />
          </div>
          <div>
            <label htmlFor="billingEmail" className={lbl}>Billing email</label>
            <input {...f('billingEmail')} type="email" className={inp} placeholder="billing@company.com" />
            <Err id="billingEmail-error" msg={fe.billingEmail} />
          </div>
        </>
      );

    case 'other':
      return (
        <div className="md:col-span-2">
          <label htmlFor="otherChange" className={lbl}>Describe the change{req}</label>
          <textarea {...f('otherChange')} rows={3} className={ta} />
          <Err id="otherChange-error" msg={fe.otherChange} />
        </div>
      );
  }
}

function ChangeBranch({ view, errors: fe }: { view: View; errors: Errors }) {
  return (
    <>
      <WhichProperty errors={fe} />

      <div className={card}>
        <div
          role="group" aria-labelledby="changeGroups-title" tabIndex={-1}
          data-invalid={fe.changeGroups ? 'true' : undefined}
          aria-describedby={fe.changeGroups ? 'changeGroups-error' : undefined}
          className="scroll-mt-24 focus:outline-none"
        >
          <SectionTitle id="changeGroups-title">What is changing?</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {CHANGE_GROUPS.map(({ key, label }) => (
              <label key={key} className={option(view.groups.includes(key))}>
                <input type="checkbox" name="changeGroups" value={key} className={checkbox} />
                {label}
              </label>
            ))}
          </div>
          {fe.changeGroups && <p id="changeGroups-error" className={`${groupError} mt-3`}>{fe.changeGroups}</p>}
        </div>
      </div>

      {CHANGE_GROUPS.filter(({ key }) => view.groups.includes(key)).map(({ key, label }) => {
        const error = fe[`group:${key}`];
        return (
          <div
            key={key} role="group" aria-labelledby={`${key}-title`} tabIndex={-1}
            data-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${key}-error` : undefined}
            className={`${card} scroll-mt-24 focus:outline-none`}
          >
            <SectionTitle as="h3" id={`${key}-title`}>{label}</SectionTitle>
            {error && <p id={`${key}-error`} className={`${groupError} mb-4`}>{error}</p>}
            {GROUP_NOTES[key] && <p className={`${note} mb-5`}>{GROUP_NOTES[key]}</p>}
            <div className="grid gap-4 md:grid-cols-2">
              <ChangeFields group={key} errors={fe} follow={view.follow} />
            </div>
          </div>
        );
      })}
    </>
  );
}

function RemoveBranch({ errors: fe }: { errors: Errors }) {
  return (
    <>
      <WhichProperty errors={fe}>
        <div className="md:col-span-2">
          <label htmlFor="removalNotes" className={lbl}>Anything we should know?</label>
          <textarea id="removalNotes" name="removalNotes" rows={2} className={ta} />
        </div>
      </WhichProperty>

      <div className={card}>
        <SectionTitle>Before you submit</SectionTitle>
        <ol className="list-decimal space-y-3 pl-5 text-sm font-mono leading-relaxed text-[#0C1014]">
          {REMOVAL_NOTICES.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ol>
      </div>
    </>
  );
}

// What the confirmation says back. It only ever says "received": a change takes effect when
// Blue Bunny itself replies.
type Receipt = { request: Request; addresses: string[]; access: boolean; other: boolean };

function ReceiptMessage({ receipt }: { receipt: Receipt }) {
  const { request, addresses } = receipt;

  if (request === 'add') {
    return (
      <>
        <p>We received your request to add:</p>
        <ol className="space-y-1">
          {addresses.map((line, i) => (
            <li key={i}>{addresses.length > 1 ? `${i + 1}. ${line}` : line}</li>
          ))}
        </ol>
        <p>
          Blue Bunny will email you the date service starts at each property. That date can be up to 7
          days from now.
        </p>
      </>
    );
  }

  if (request === 'remove') {
    return (
      <>
        <p>We received your request to remove {addresses[0]}.</p>
        <p>
          The removal takes effect when Blue Bunny confirms it. Turnovers already accepted will still be
          performed and billed unless you cancel them.
        </p>
      </>
    );
  }

  return (
    <>
      <p>We received your update for {addresses[0]}.</p>
      {receipt.access && (
        <p>
          Access changes take effect when Blue Bunny acknowledges them, which we do promptly. If a
          turnover is scheduled today, please also call or text us.
        </p>
      )}
      {receipt.other && (
        <p>
          These changes apply to turnovers whose guest checkout is at least 24 hours from now, unless
          Blue Bunny confirms sooner.
        </p>
      )}
    </>
  );
}

export default function PropertyUpdateForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [view, setView] = useState<View>(BLANK_VIEW);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  // Bumped after a submission: remounts everything below the client's details, blank.
  const [round, setRound] = useState(0);
  const cards = usePropertyCards();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const errorCount = Object.keys(errors).length + cards.errorCount;

  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const { name = '' } = e.target as HTMLInputElement;
    if (cards.handleChange(form, name)) return;

    // The request, a tick box, or an answer with a follow-up: what is on the page changes.
    const structural =
      name === 'requestType' || name === 'changeGroups' || (FOLLOW_UPS as readonly string[]).includes(name);
    if (!structural && Object.keys(errors).length === 0) return;

    const formData = new FormData(form);
    if (structural) setView(readView(formData));
    // Switching request clears the other branch, the property cards included.
    if (name === 'requestType') cards.reset();

    // Re-check so fixed fields lose their message as the client works.
    if (Object.keys(errors).length > 0) {
      const kept = stillInvalid(errors, validateUpdate(formData));
      if (Object.keys(kept).length !== Object.keys(errors).length) setErrors(kept);
    }
  };

  const handleSubmit = async () => {
    const form = formRef.current;
    if (!form || status === 'submitting') return;

    let formData = new FormData(form);
    // A browser restoring the page (reload, Back) can set a control without a change event.
    // Re-read what is chosen so the questions on the page match it before anything is checked.
    const live = readView(formData);
    if (!sameView(live, view)) {
      flushSync(() => setView(live));
      formData = new FormData(form);
    }
    const adding = live.request === 'add';
    if (adding && cards.sync(formData)) formData = new FormData(form);

    const found = validateUpdate(formData);
    const properties = adding ? cards.validate(formData) : {};

    if (Object.keys(found).length > 0 || Object.keys(properties).length > 0) {
      // Commit first, so the invalid fields are marked before going to look for one.
      flushSync(() => {
        setErrors(found);
        cards.setErrors(properties);
        setErrorMsg(null);
        setStatus('error');
      });
      revealFirstInvalid(form, cards.open);
      return;
    }

    setErrors({});
    cards.setErrors({});
    setErrorMsg(null);
    setStatus('submitting');

    // Added properties go out exactly as the information form sends them.
    const failure = await submitLead(adding ? formData : withoutBlanks(formData));
    if (failure) {
      setErrorMsg(failure);
      setStatus('error');
      return;
    }

    // Everything below the client's details starts over, in case there is another update.
    flushSync(() => {
      setReceipt({
        request: live.request as Request,
        addresses: adding ? cards.addresses(formData) : [addressLine((key) => str(formData, key))],
        access: live.groups.includes('access'),
        other: live.groups.some((group) => group !== 'access'),
      });
      setView(BLANK_VIEW);
      setRound((n) => n + 1);
      cards.reset();
      setStatus('success');
    });
    if (successRef.current) reveal(successRef.current);
  };

  const submitAnother = () => {
    flushSync(() => setStatus('idle'));
    const first = formRef.current?.querySelector<HTMLElement>('input[name="requestType"]');
    if (first) reveal(first, first.closest('[role="radiogroup"]') ?? first);
  };

  return (
    <>
      {status === 'success' && receipt && (
        <SuccessPanel headingRef={successRef} actionLabel="Submit another update" onAction={submitAnother}>
          <ReceiptMessage receipt={receipt} />
        </SuccessPanel>
      )}

      {/* No submit button inside: Enter in a field must not send (or half-validate) the form. */}
      <form
        ref={formRef} hidden={status === 'success'}
        onSubmit={(e) => e.preventDefault()} onChange={handleChange} noValidate
        className="space-y-5"
      >
        <input type="hidden" name="leadType" value="Property Update" />

        <ClientInformation errors={errors} />

        <div key={round} className="space-y-5">
          <RequestCard request={view.request} error={errors.requestType} />

          {view.request === 'add' && (
            <>
              <input type="hidden" name="propertyCount" value={cards.ids.length} />
              <PropertyCards cards={cards} />
            </>
          )}
          {view.request === 'change' && <ChangeBranch view={view} errors={errors} />}
          {view.request === 'remove' && <RemoveBranch errors={errors} />}
        </div>

        <ConfirmationCard
          statement="By submitting this form, I confirm that I am authorized to make this update and that the information provided is accurate and complete. I understand that Blue Bunny Turnover Services is not responsible for service issues resulting from inaccurate or outdated property information."
          error={errors.clientName}
          submitLabel="Submit Property Update"
          status={status}
          errorCount={errorCount}
          errorMsg={errorMsg}
          onSubmit={handleSubmit}
        />
      </form>
    </>
  );
}
