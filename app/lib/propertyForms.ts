// What a Property Update can change, in the order the form lists it. The update form's tick
// boxes and the subject of the alert email both come from this list.
export const CHANGE_GROUPS = [
  { key: 'access', label: 'Access details' },
  { key: 'times', label: 'Check-in or checkout time' },
  { key: 'counts', label: 'Bedrooms, bathrooms or guest count' },
  { key: 'addons', label: 'Pool or grill cleaning' },
  { key: 'consumables', label: 'Consumables' },
  { key: 'laundry', label: 'Washer, dryer or linens' },
  { key: 'thermostat', label: 'Thermostat' },
  { key: 'staging', label: 'Staging, notes or listing link' },
  { key: 'calendar', label: 'Calendar or PMS' },
  { key: 'contact', label: 'My contact or billing email' },
  { key: 'other', label: 'Something else' },
] as const;

export type ChangeGroup = (typeof CHANGE_GROUPS)[number]['key'];

const PROPERTY_FORMS = ['Property Information Form', 'Property Update'];

// "Nov 11, 2026, 9:42:07 PM EST"
const EASTERN = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'medium',
  timeStyle: 'long',
});

function updateSubject(form: FormData) {
  const text = (name: string) => {
    const value = form.get(name);
    return typeof value === 'string' ? value.trim() : '';
  };
  const address = (prefix = '') => {
    const stateZip = [text(`${prefix}state`).toUpperCase(), text(`${prefix}zip`)].filter(Boolean).join(' ');
    return [text(`${prefix}propertyAddress`), text(`${prefix}city`), stateZip].filter(Boolean).join(', ');
  };

  switch (text('requestType')) {
    case 'add': {
      const count = Number(text('propertyCount')) || 1;
      const others = count > 1 ? ` and ${count - 1} more` : '';
      return `Property Update: Add - ${address('property01_')}${others}`;
    }
    case 'change': {
      const ticked = form.getAll('changeGroups');
      const labels = CHANGE_GROUPS.filter((group) => ticked.includes(group.key)).map((group) => group.label);
      // Access changes take effect when Blue Bunny acknowledges them, so they can't wait.
      const urgent = ticked.includes('access') ? 'URGENT: ' : '';
      return `${urgent}Property Update: Change (${labels.join(', ')}) - ${address()}`;
    }
    case 'remove':
      return `Property Update: Remove - ${address()}`;
    default:
      return 'Property Update';
  }
}

/**
 * The property forms are part of the client agreement, so the server, not the browser, records
 * when each submission arrived. A Property Update also gets a subject saying what it asks for.
 * Other forms pass through untouched.
 */
export function stampPropertySubmission(incoming: FormData, now = new Date()): FormData {
  const leadType = incoming.get('leadType');
  if (typeof leadType !== 'string' || !PROPERTY_FORMS.includes(leadType)) return incoming;

  const outgoing = new FormData();
  for (const [name, value] of incoming) {
    // Only the server sets these two.
    if (name === 'receivedAt' || name === 'subject') continue;
    outgoing.append(name, value);
    if (name === 'leadType') {
      outgoing.append('receivedAt', EASTERN.format(now));
      // Formspree uses a field named "subject" as the notification's subject line.
      if (leadType === 'Property Update') outgoing.append('subject', updateSubject(incoming));
    }
  }
  return outgoing;
}
