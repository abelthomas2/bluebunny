'use client';

import { FormEvent, useState } from 'react';

const LEAD_ENDPOINT = '/api/leads';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

type FieldKey =
  | 'name' | 'email' | 'phone'
  | 'propertyAddress' | 'city' | 'state' | 'zip' | 'bedrooms' | 'fullBaths'
  | 'primaryAccess' | 'accessInstructions' | 'gatedCommunity' | 'gateCode'
  | 'washer' | 'dryer' | 'appliancesFunctioning' | 'linenStorage'
  | 'hasPool' | 'poolCleaning' | 'hasGrill' | 'grillCleaning' | 'grillType'
  | 'consumablesModel' | 'consumablesStorage'
  | 'thermostatLocation'
  | 'hasListingPhotos' | 'listingPhotosUrl' | 'hasWelcomeLights' | 'welcomeLightsDesc'
  | 'hasAlarm' | 'alarmInstructions'
  | 'pmsPlatform' | 'pmsOther' | 'icalLink'
  | 'clientName';

type FormErrors = Partial<Record<FieldKey, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_PATTERN = /^\d{5}$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;
const URL_PATTERN = /^https?:\/\/.+/;

function str(formData: FormData, key: string) {
  return (formData.get(key) as string | null)?.trim() ?? '';
}

function validateUrl(v: string) {
  return URL_PATTERN.test(v);
}

const inp =
  'w-full rounded-xl border border-[#90A4AE] px-3 py-2.5 text-sm text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]';
const sel =
  'w-full rounded-xl border border-[#90A4AE] bg-white px-3 py-2.5 text-sm text-[#0C1014] font-mono focus:border-[#5DAFD5] focus:outline-none focus:ring-2 focus:ring-[#5DAFD5]';
const ta = inp + ' resize-none';
const lbl = 'mb-1 block text-sm font-mono text-[#0C1014]';
const card = 'rounded-3xl border border-[#E2EEF5] bg-white p-6 md:p-8';
const req = <span className="text-[#2978A5]"> *</span>;

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="mt-1 text-xs font-mono text-red-600">{msg}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 pb-4 border-b border-[#E2EEF5] text-lg font-semibold text-[#0C1014]">
      {children}
    </h2>
  );
}

export default function PropertyInformationForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [formKey, setFormKey] = useState(0);

  // Conditional visibility
  const [gated, setGated] = useState('');
  const [appliancesOk, setAppliancesOk] = useState('');
  const [hasPool, setHasPool] = useState('');
  const [hasGrill, setHasGrill] = useState('');
  const [consumablesModel, setConsumablesModel] = useState('');
  const [hasPhotos, setHasPhotos] = useState('');
  const [hasLights, setHasLights] = useState('');
  const [hasAlarm, setHasAlarm] = useState('');
  const [pms, setPms] = useState('');

  const validateForm = (formData: FormData): boolean => {
    const errors: FormErrors = {};

    // ── Client Information ──
    if (!str(formData, 'name')) errors.name = 'Name is required.';
    if (!EMAIL_PATTERN.test(str(formData, 'email'))) errors.email = 'Enter a valid email address.';
    if (str(formData, 'phone').replace(/\D/g, '').length < 10)
      errors.phone = 'Phone number must include at least 10 digits.';

    // ── Property Details ──
    if (!str(formData, 'propertyAddress')) errors.propertyAddress = 'Property address is required.';
    if (!str(formData, 'city')) errors.city = 'City is required.';
    if (!STATE_PATTERN.test(str(formData, 'state')))
      errors.state = 'Enter a valid 2-letter state code (e.g. FL).';
    if (!ZIP_PATTERN.test(str(formData, 'zip')))
      errors.zip = 'Enter a valid 5-digit ZIP code.';
    const bedrooms = parseInt(str(formData, 'bedrooms'), 10);
    if (isNaN(bedrooms) || bedrooms < 0)
      errors.bedrooms = 'Enter the number of bedrooms (0 or more).';
    const fullBaths = parseInt(str(formData, 'fullBaths'), 10);
    if (isNaN(fullBaths) || fullBaths < 1)
      errors.fullBaths = 'Enter the number of full bathrooms (at least 1).';

    // ── Property Access ──
    if (!str(formData, 'primaryAccess')) errors.primaryAccess = 'Select an access method.';
    if (!str(formData, 'accessInstructions'))
      errors.accessInstructions = 'Access instructions are required.';
    if (!str(formData, 'gatedCommunity'))
      errors.gatedCommunity = 'Indicate whether the property is in a gated community.';
    if (str(formData, 'gatedCommunity') === 'Yes' && !str(formData, 'gateCode'))
      errors.gateCode = 'Gate code or instructions are required.';

    // ── Appliances & Laundry ──
    if (!str(formData, 'washer')) errors.washer = 'Indicate if a washer is on-site.';
    if (!str(formData, 'dryer')) errors.dryer = 'Indicate if a dryer is on-site.';
    if (!str(formData, 'appliancesFunctioning'))
      errors.appliancesFunctioning = 'Indicate if appliances are functioning.';
    const linenSetsVal = str(formData, 'linenSets');
    const linenSetsNum = parseInt(linenSetsVal, 10);
    if (linenSetsVal !== '' && !isNaN(linenSetsNum) && linenSetsNum > 0 && !str(formData, 'linenStorage'))
      errors.linenStorage = 'Linen storage location is required when linens are on-site.';

    // ── Add-on Services ──
    if (!str(formData, 'hasPool')) errors.hasPool = 'Indicate if the property has a pool.';
    if (str(formData, 'hasPool') === 'Yes' && !str(formData, 'poolCleaning'))
      errors.poolCleaning = 'Indicate whether to include pool cleaning.';
    if (!str(formData, 'hasGrill')) errors.hasGrill = 'Indicate if the property has a grill.';
    if (str(formData, 'hasGrill') === 'Yes') {
      if (!str(formData, 'grillCleaning'))
        errors.grillCleaning = 'Indicate whether to include grill cleaning.';
      if (!str(formData, 'grillType')) errors.grillType = 'Select the grill type.';
    }

    // ── Consumables ──
    if (!str(formData, 'consumablesModel'))
      errors.consumablesModel = 'Select a consumables model.';
    if (
      str(formData, 'consumablesModel') === 'Client-supplied' &&
      !str(formData, 'consumablesStorage')
    )
      errors.consumablesStorage = 'Indicate where consumables are stored.';

    // ── Thermostat ──
    if (!str(formData, 'thermostatLocation'))
      errors.thermostatLocation = 'Thermostat location is required.';

    // ── Staging & Notes ──
    if (!str(formData, 'hasListingPhotos'))
      errors.hasListingPhotos = 'Indicate whether listing photos are available.';
    if (str(formData, 'hasListingPhotos') === 'Yes') {
      const photoUrl = str(formData, 'listingPhotosUrl');
      if (!photoUrl || !validateUrl(photoUrl))
        errors.listingPhotosUrl = 'Enter a valid URL starting with https://.';
    }
    if (!str(formData, 'hasWelcomeLights'))
      errors.hasWelcomeLights = 'Indicate whether there are designated arrival lights.';
    if (str(formData, 'hasWelcomeLights') === 'Yes' && !str(formData, 'welcomeLightsDesc'))
      errors.welcomeLightsDesc = 'Describe which lights to leave on.';
    if (!str(formData, 'hasAlarm'))
      errors.hasAlarm = 'Indicate whether the property has an alarm system.';
    if (str(formData, 'hasAlarm') === 'Yes' && !str(formData, 'alarmInstructions'))
      errors.alarmInstructions = 'Arming instructions are required.';

    // ── PMS / Calendar ──
    if (!str(formData, 'pmsPlatform')) errors.pmsPlatform = 'Select a PMS platform.';
    if (str(formData, 'pmsPlatform') === 'Other' && !str(formData, 'pmsOther'))
      errors.pmsOther = 'Specify the platform name.';
    const ical = str(formData, 'icalLink');
    if (!ical || !validateUrl(ical))
      errors.icalLink = 'Enter a valid iCal URL starting with https://.';

    // ── Confirmation ──
    if (!str(formData, 'clientName')) errors.clientName = 'Please enter your name to confirm.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting' || status === 'success') return;

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    if (!validateForm(formData)) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMsg(null);

    try {
      const res = await fetch(LEAD_ENDPOINT, { method: 'POST', body: formData });
      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        throw new Error(result?.error ?? 'Failed to submit form');
      }

      setFormKey((k) => k + 1);
      setGated('');
      setAppliancesOk('');
      setHasPool('');
      setHasGrill('');
      setConsumablesModel('');
      setHasPhotos('');
      setHasLights('');
      setHasAlarm('');
      setPms('');
      setFieldErrors({});
      setStatus('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
      setStatus('error');
    }
  };

  const fe = fieldErrors;

  return (
    <form key={formKey} onSubmit={handleSubmit} noValidate className="space-y-5">
      <input type="hidden" name="leadType" value="Property Information Form" />

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

      {/* ── Property Details ── */}
      <div className={card}>
        <SectionTitle>Property Details</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="propertyAddress" className={lbl}>Property address{req}</label>
            <input
              id="propertyAddress" name="propertyAddress" type="text"
              aria-invalid={Boolean(fe.propertyAddress)}
              aria-describedby={fe.propertyAddress ? 'address-error' : undefined}
              className={inp} placeholder="123 Main St"
            />
            <Err id="address-error" msg={fe.propertyAddress} />
          </div>
          <div>
            <label htmlFor="city" className={lbl}>City{req}</label>
            <input
              id="city" name="city" type="text"
              aria-invalid={Boolean(fe.city)}
              aria-describedby={fe.city ? 'city-error' : undefined}
              className={inp} placeholder="Kissimmee"
            />
            <Err id="city-error" msg={fe.city} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className={lbl}>State{req}</label>
              <input
                id="state" name="state" type="text"
                aria-invalid={Boolean(fe.state)}
                aria-describedby={fe.state ? 'state-error' : undefined}
                className={inp} placeholder="FL" maxLength={2}
              />
              <Err id="state-error" msg={fe.state} />
            </div>
            <div>
              <label htmlFor="zip" className={lbl}>ZIP{req}</label>
              <input
                id="zip" name="zip" type="text" inputMode="numeric"
                aria-invalid={Boolean(fe.zip)}
                aria-describedby={fe.zip ? 'zip-error' : undefined}
                className={inp} placeholder="34741" maxLength={5}
              />
              <Err id="zip-error" msg={fe.zip} />
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="bedrooms" className={lbl}>Bedrooms{req}</label>
              <input
                id="bedrooms" name="bedrooms" type="number" min="0"
                aria-invalid={Boolean(fe.bedrooms)}
                aria-describedby={fe.bedrooms ? 'bedrooms-error' : undefined}
                className={inp} placeholder="3"
              />
              <Err id="bedrooms-error" msg={fe.bedrooms} />
            </div>
            <div>
              <label htmlFor="fullBaths" className={lbl}>Bathrooms{req}</label>
              <input
                id="fullBaths" name="fullBaths" type="number" min="1"
                aria-invalid={Boolean(fe.fullBaths)}
                aria-describedby={fe.fullBaths ? 'full-baths-error' : undefined}
                className={inp} placeholder="2"
              />
              <Err id="full-baths-error" msg={fe.fullBaths} />
            </div>
            <div>
              <label htmlFor="halfBaths" className={lbl}>Half baths</label>
              <input id="halfBaths" name="halfBaths" type="number" min="0" className={inp} placeholder="1" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Check-in & Checkout ── */}
      <div className={card}>
        <SectionTitle>Check-in & Checkout</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="checkinTime" className={lbl}>Guest check-in time</label>
            <input id="checkinTime" name="checkinTime" type="time" defaultValue="15:00" className={inp} />
          </div>
          <div>
            <label htmlFor="checkoutTime" className={lbl}>Guest checkout time</label>
            <input id="checkoutTime" name="checkoutTime" type="time" defaultValue="11:00" className={inp} />
          </div>
        </div>
      </div>

      {/* ── Property Access ── */}
      <div className={card}>
        <SectionTitle>Property Access</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="primaryAccess" className={lbl}>Primary access method{req}</label>
            <select
              id="primaryAccess" name="primaryAccess" defaultValue=""
              aria-invalid={Boolean(fe.primaryAccess)}
              aria-describedby={fe.primaryAccess ? 'primary-access-error' : undefined}
              className={sel}
            >
              <option value="" disabled>Select one</option>
              <option value="Lockbox">Lockbox</option>
              <option value="Smart lock">Smart lock</option>
              <option value="Key (hidden location)">Key (hidden location)</option>
              <option value="Gate code + door code">Gate code + door code</option>
              <option value="Other">Other</option>
            </select>
            <Err id="primary-access-error" msg={fe.primaryAccess} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="accessInstructions" className={lbl}>Access instructions{req}</label>
            <textarea
              id="accessInstructions" name="accessInstructions" rows={2}
              aria-invalid={Boolean(fe.accessInstructions)}
              aria-describedby={fe.accessInstructions ? 'access-instructions-error' : undefined}
              className={ta}
              placeholder="e.g., Lockbox on front door handle, code 4821. Gate code for community entrance: #1234"
            />
            <Err id="access-instructions-error" msg={fe.accessInstructions} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="secondaryAccess" className={lbl}>Secondary access or backup entry method, if any</label>
            <textarea id="secondaryAccess" name="secondaryAccess" rows={2} className={ta} />
          </div>
          <div>
            <label htmlFor="gatedCommunity" className={lbl}>Inside a gated community?{req}</label>
            <select
              id="gatedCommunity" name="gatedCommunity" defaultValue=""
              aria-invalid={Boolean(fe.gatedCommunity)}
              aria-describedby={fe.gatedCommunity ? 'gated-error' : undefined}
              className={sel}
              onChange={(e) => setGated(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="gated-error" msg={fe.gatedCommunity} />
          </div>
          {gated === 'Yes' && (
            <div>
              <label htmlFor="gateCode" className={lbl}>Gate code or access instructions{req}</label>
              <input
                id="gateCode" name="gateCode" type="text"
                aria-invalid={Boolean(fe.gateCode)}
                aria-describedby={fe.gateCode ? 'gate-code-error' : undefined}
                className={inp} placeholder="Gate code or instructions"
              />
              <Err id="gate-code-error" msg={fe.gateCode} />
            </div>
          )}
        </div>
      </div>

      {/* ── Appliances & Laundry ── */}
      <div className={card}>
        <SectionTitle>Appliances & Laundry</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="washer" className={lbl}>Washer on-site?{req}</label>
            <select
              id="washer" name="washer" defaultValue=""
              aria-invalid={Boolean(fe.washer)}
              aria-describedby={fe.washer ? 'washer-error' : undefined}
              className={sel}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="washer-error" msg={fe.washer} />
          </div>
          <div>
            <label htmlFor="dryer" className={lbl}>Dryer on-site?{req}</label>
            <select
              id="dryer" name="dryer" defaultValue=""
              aria-invalid={Boolean(fe.dryer)}
              aria-describedby={fe.dryer ? 'dryer-error' : undefined}
              className={sel}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="dryer-error" msg={fe.dryer} />
          </div>
          <div>
            <label htmlFor="appliancesFunctioning" className={lbl}>Both currently functioning?{req}</label>
            <select
              id="appliancesFunctioning" name="appliancesFunctioning" defaultValue=""
              aria-invalid={Boolean(fe.appliancesFunctioning)}
              aria-describedby={fe.appliancesFunctioning ? 'appliances-error' : undefined}
              className={sel}
              onChange={(e) => setAppliancesOk(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="appliances-error" msg={fe.appliancesFunctioning} />
          </div>
          {appliancesOk === 'No' && (
            <div className="md:col-span-2">
              <label htmlFor="appliancesIssue" className={lbl}>Describe the issue</label>
              <textarea id="appliancesIssue" name="appliancesIssue" rows={2} className={ta} />
            </div>
          )}
          <div>
            <label htmlFor="linenStorage" className={lbl}>Linen storage location</label>
            <input
              id="linenStorage" name="linenStorage" type="text"
              aria-invalid={Boolean(fe.linenStorage)}
              aria-describedby={fe.linenStorage ? 'linen-storage-error' : undefined}
              className={inp} placeholder="e.g., Hall closet upstairs"
            />
            <Err id="linen-storage-error" msg={fe.linenStorage} />
          </div>
          <div>
            <label htmlFor="linenSets" className={lbl}>Approximate linen sets on-site</label>
            <input id="linenSets" name="linenSets" type="number" min="0" className={inp} placeholder="4" />
          </div>
        </div>
      </div>

      {/* ── Add-on Services ── */}
      <div className={card}>
        <SectionTitle>Add-on Services</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="hasPool" className={lbl}>Property has a pool?{req}</label>
            <select
              id="hasPool" name="hasPool" defaultValue=""
              aria-invalid={Boolean(fe.hasPool)}
              aria-describedby={fe.hasPool ? 'has-pool-error' : undefined}
              className={sel}
              onChange={(e) => setHasPool(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="has-pool-error" msg={fe.hasPool} />
          </div>
          {hasPool === 'Yes' && (
            <div>
              <label htmlFor="poolCleaning" className={lbl}>Include pool cleaning each turn?{req}</label>
              <select
                id="poolCleaning" name="poolCleaning" defaultValue=""
                aria-invalid={Boolean(fe.poolCleaning)}
                aria-describedby={fe.poolCleaning ? 'pool-cleaning-error' : undefined}
                className={sel}
              >
                <option value="" disabled>Select one</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <Err id="pool-cleaning-error" msg={fe.poolCleaning} />
            </div>
          )}
          <div>
            <label htmlFor="hasGrill" className={lbl}>Property has a grill?{req}</label>
            <select
              id="hasGrill" name="hasGrill" defaultValue=""
              aria-invalid={Boolean(fe.hasGrill)}
              aria-describedby={fe.hasGrill ? 'has-grill-error' : undefined}
              className={sel}
              onChange={(e) => setHasGrill(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="has-grill-error" msg={fe.hasGrill} />
          </div>
          {hasGrill === 'Yes' && (
            <>
              <div>
                <label htmlFor="grillCleaning" className={lbl}>Include grill cleaning each turn?{req}</label>
                <select
                  id="grillCleaning" name="grillCleaning" defaultValue=""
                  aria-invalid={Boolean(fe.grillCleaning)}
                  aria-describedby={fe.grillCleaning ? 'grill-cleaning-error' : undefined}
                  className={sel}
                >
                  <option value="" disabled>Select one</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <Err id="grill-cleaning-error" msg={fe.grillCleaning} />
              </div>
              <div>
                <label htmlFor="grillType" className={lbl}>Grill type{req}</label>
                <select
                  id="grillType" name="grillType" defaultValue=""
                  aria-invalid={Boolean(fe.grillType)}
                  aria-describedby={fe.grillType ? 'grill-type-error' : undefined}
                  className={sel}
                >
                  <option value="" disabled>Select one</option>
                  <option value="Gas (propane)">Gas (propane)</option>
                  <option value="Gas (natural)">Gas (natural)</option>
                  <option value="Charcoal">Charcoal</option>
                  <option value="Electric">Electric</option>
                </select>
                <Err id="grill-type-error" msg={fe.grillType} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Consumables ── */}
      <div className={card}>
        <SectionTitle>Consumables</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="consumablesModel" className={lbl}>Consumables model{req}</label>
            <select
              id="consumablesModel" name="consumablesModel" defaultValue=""
              aria-invalid={Boolean(fe.consumablesModel)}
              aria-describedby={fe.consumablesModel ? 'consumables-model-error' : undefined}
              className={sel}
              onChange={(e) => setConsumablesModel(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Blue Bunny-supplied">
                Blue Bunny-supplied ($7.00 base + $4.00 per bathroom per turn)
              </option>
              <option value="Client-supplied">
                Client-supplied (no charge, restocked from on-site inventory)
              </option>
            </select>
            <Err id="consumables-model-error" msg={fe.consumablesModel} />
          </div>
          {consumablesModel === 'Client-supplied' && (
            <div className="md:col-span-2">
              <label htmlFor="consumablesStorage" className={lbl}>Where are consumables stored?{req}</label>
              <input
                id="consumablesStorage" name="consumablesStorage" type="text"
                aria-invalid={Boolean(fe.consumablesStorage)}
                aria-describedby={fe.consumablesStorage ? 'consumables-storage-error' : undefined}
                className={inp} placeholder="e.g., Under kitchen sink"
              />
              <Err id="consumables-storage-error" msg={fe.consumablesStorage} />
            </div>
          )}
        </div>
      </div>

      {/* ── Thermostat & Climate ── */}
      <div className={card}>
        <SectionTitle>Thermostat & Climate</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="thermostatTemp" className={lbl}>Default thermostat setting (°F)</label>
            <input
              id="thermostatTemp" name="thermostatTemp" type="number"
              min="60" max="85" defaultValue="74" className={inp}
            />
          </div>
          <div>
            <label htmlFor="fanSetting" className={lbl}>Fan setting</label>
            <select id="fanSetting" name="fanSetting" defaultValue="Auto" className={sel}>
              <option value="Auto">Auto</option>
              <option value="On">On</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="thermostatLocation" className={lbl}>Thermostat location{req}</label>
            <input
              id="thermostatLocation" name="thermostatLocation" type="text"
              aria-invalid={Boolean(fe.thermostatLocation)}
              aria-describedby={fe.thermostatLocation ? 'thermostat-location-error' : undefined}
              className={inp} placeholder="e.g., Hallway between bedrooms"
            />
            <Err id="thermostat-location-error" msg={fe.thermostatLocation} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="thermostatNotes" className={lbl}>Smart thermostat instructions, if any</label>
            <textarea id="thermostatNotes" name="thermostatNotes" rows={2} className={ta} />
          </div>
        </div>
      </div>

      {/* ── Staging & Property Notes ── */}
      <div className={card}>
        <SectionTitle>Staging & Property Notes</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="stagingPreferences" className={lbl}>Pillow or bed staging preferences</label>
            <textarea
              id="stagingPreferences" name="stagingPreferences" rows={3} className={ta}
              placeholder="e.g., Chop fold on throw pillows, accent blanket draped on left side of couch"
            />
          </div>
          <div>
            <label htmlFor="hasListingPhotos" className={lbl}>Listing photos for staging reference?{req}</label>
            <select
              id="hasListingPhotos" name="hasListingPhotos" defaultValue=""
              aria-invalid={Boolean(fe.hasListingPhotos)}
              aria-describedby={fe.hasListingPhotos ? 'has-photos-error' : undefined}
              className={sel}
              onChange={(e) => setHasPhotos(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="has-photos-error" msg={fe.hasListingPhotos} />
          </div>
          {hasPhotos === 'Yes' && (
            <div>
              <label htmlFor="listingPhotosUrl" className={lbl}>Photo link{req}</label>
              <input
                id="listingPhotosUrl" name="listingPhotosUrl" type="url"
                aria-invalid={Boolean(fe.listingPhotosUrl)}
                aria-describedby={fe.listingPhotosUrl ? 'photos-url-error' : undefined}
                className={inp} placeholder="https://..."
              />
              <Err id="photos-url-error" msg={fe.listingPhotosUrl} />
            </div>
          )}
          <div>
            <label htmlFor="hasWelcomeLights" className={lbl}>Designated welcome / arrival lights to leave on?{req}</label>
            <select
              id="hasWelcomeLights" name="hasWelcomeLights" defaultValue=""
              aria-invalid={Boolean(fe.hasWelcomeLights)}
              aria-describedby={fe.hasWelcomeLights ? 'welcome-lights-error' : undefined}
              className={sel}
              onChange={(e) => setHasLights(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="welcome-lights-error" msg={fe.hasWelcomeLights} />
          </div>
          {hasLights === 'Yes' && (
            <div>
              <label htmlFor="welcomeLightsDesc" className={lbl}>Describe{req}</label>
              <input
                id="welcomeLightsDesc" name="welcomeLightsDesc" type="text"
                aria-invalid={Boolean(fe.welcomeLightsDesc)}
                aria-describedby={fe.welcomeLightsDesc ? 'welcome-lights-desc-error' : undefined}
                className={inp} placeholder="e.g., Porch light and kitchen island pendant"
              />
              <Err id="welcome-lights-desc-error" msg={fe.welcomeLightsDesc} />
            </div>
          )}
          <div>
            <label htmlFor="hasAlarm" className={lbl}>Alarm or security system?{req}</label>
            <select
              id="hasAlarm" name="hasAlarm" defaultValue=""
              aria-invalid={Boolean(fe.hasAlarm)}
              aria-describedby={fe.hasAlarm ? 'has-alarm-error' : undefined}
              className={sel}
              onChange={(e) => setHasAlarm(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <Err id="has-alarm-error" msg={fe.hasAlarm} />
          </div>
          {hasAlarm === 'Yes' && (
            <div className="md:col-span-2">
              <label htmlFor="alarmInstructions" className={lbl}>Arming instructions{req}</label>
              <textarea
                id="alarmInstructions" name="alarmInstructions" rows={2}
                aria-invalid={Boolean(fe.alarmInstructions)}
                aria-describedby={fe.alarmInstructions ? 'alarm-instructions-error' : undefined}
                className={ta}
              />
              <Err id="alarm-instructions-error" msg={fe.alarmInstructions} />
            </div>
          )}
          <div className="md:col-span-2">
            <label htmlFor="specialSurfaces" className={lbl}>Surfaces requiring special care, if any</label>
            <textarea
              id="specialSurfaces" name="specialSurfaces" rows={2} className={ta}
              placeholder="e.g., Natural stone countertops — use pH-neutral cleaner only"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="additionalNotes" className={lbl}>Additional property-specific notes</label>
            <textarea
              id="additionalNotes" name="additionalNotes" rows={3} className={ta}
              placeholder="Anything else the cleaning team should know"
            />
          </div>
        </div>
      </div>

      {/* ── PMS / Calendar Integration ── */}
      <div className={card}>
        <SectionTitle>PMS / Calendar Integration</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="pmsPlatform" className={lbl}>PMS platform{req}</label>
            <select
              id="pmsPlatform" name="pmsPlatform" defaultValue=""
              aria-invalid={Boolean(fe.pmsPlatform)}
              aria-describedby={fe.pmsPlatform ? 'pms-platform-error' : undefined}
              className={sel}
              onChange={(e) => setPms(e.target.value)}
            >
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
            <Err id="pms-platform-error" msg={fe.pmsPlatform} />
          </div>
          {pms === 'Other' && (
            <div>
              <label htmlFor="pmsOther" className={lbl}>Specify platform{req}</label>
              <input
                id="pmsOther" name="pmsOther" type="text"
                aria-invalid={Boolean(fe.pmsOther)}
                aria-describedby={fe.pmsOther ? 'pms-other-error' : undefined}
                className={inp}
              />
              <Err id="pms-other-error" msg={fe.pmsOther} />
            </div>
          )}
          <div className="md:col-span-2">
            <label htmlFor="icalLink" className={lbl}>iCal link for this property{req}</label>
            <input
              id="icalLink" name="icalLink" type="url"
              aria-invalid={Boolean(fe.icalLink)}
              aria-describedby={fe.icalLink ? 'ical-link-error' : undefined}
              className={inp} placeholder="https://..."
            />
            <Err id="ical-link-error" msg={fe.icalLink} />
          </div>
        </div>
      </div>

      {/* ── Confirmation ── */}
      <div className={card}>
        <SectionTitle>Confirmation</SectionTitle>
        <div className="space-y-5">
          <p className="text-sm font-mono text-[#0C1014]/70 leading-relaxed">
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
            type="submit"
            disabled={status === 'submitting'}
            className={`w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition ${
              status === 'success'
                ? 'pointer-events-none bg-[#2978A5]'
                : 'bg-[#2978A5] hover:bg-[#0C1014] disabled:cursor-not-allowed disabled:opacity-75'
            }`}
          >
            {status === 'success' ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 28 28" fill="none" aria-hidden>
                  <path d="M5 14L11 20L23 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submitted
              </span>
            ) : status === 'submitting' ? 'Submitting…' : status === 'error' ? 'Try Again' : 'Submit Property Information'}
          </button>
          {errorMsg && <p className="text-sm font-mono text-red-600">{errorMsg}</p>}
        </div>
      </div>
    </form>
  );
}
