'use client';

import { FormEvent, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ClientErrors,
  ClientInformation,
  ConfirmationCard,
  FormStatus,
  PropertyCards,
  SuccessPanel,
  reveal,
  revealFirstInvalid,
  revealProperty,
  stillInvalid,
  str,
  submitLead,
  usePropertyCards,
  validateClient,
} from '@/app/components/PropertyFormShared';

export default function PropertyInformationForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  // Address lines of the properties just submitted, listed on the confirmation.
  const [receipt, setReceipt] = useState<string[]>([]);
  const cards = usePropertyCards();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const errorCount = Object.keys(clientErrors).length + cards.errorCount;

  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    const { name = '' } = e.target as HTMLInputElement;
    if (cards.handleChange(e.currentTarget, name)) return;

    // Re-check the client's own fields so fixed ones lose their message as the client works.
    if (Object.keys(clientErrors).length === 0) return;
    const formData = new FormData(e.currentTarget);
    const kept = stillInvalid(clientErrors, validateClient((key) => str(formData, key)));
    if (Object.keys(kept).length !== Object.keys(clientErrors).length) setClientErrors(kept);
  };

  const handleSubmit = async () => {
    const form = formRef.current;
    if (!form || status === 'submitting') return;

    let formData = new FormData(form);
    if (cards.sync(formData)) formData = new FormData(form);

    const client = validateClient((key) => str(formData, key));
    const properties = cards.validate(formData);

    if (Object.keys(client).length > 0 || Object.keys(properties).length > 0) {
      // Commit first, so the invalid fields are marked before going to look for one.
      flushSync(() => {
        setClientErrors(client);
        cards.setErrors(properties);
        setErrorMsg(null);
        setStatus('error');
      });
      revealFirstInvalid(form, cards.open);
      return;
    }

    setClientErrors({});
    cards.setErrors({});
    setErrorMsg(null);
    setStatus('submitting');

    const failure = await submitLead(formData);
    if (failure) {
      setErrorMsg(failure);
      setStatus('error');
      return;
    }

    // The submitted cards give way to one fresh card. The client's own details stay in the
    // (hidden) form in case there are more properties to send.
    flushSync(() => {
      setReceipt(cards.addresses(formData));
      cards.reset();
      setStatus('success');
    });
    if (successRef.current) reveal(successRef.current);
  };

  const submitMore = () => {
    flushSync(() => setStatus('idle'));
    revealProperty(cards.ids[0]);
  };

  return (
    <>
      {status === 'success' && (
        <SuccessPanel headingRef={successRef} actionLabel="Submit more properties" onAction={submitMore}>
          <p>
            {receipt.length === 1
              ? 'We received the information for this property:'
              : `We received the information for these ${receipt.length} properties:`}
          </p>
          <ol className="space-y-1">
            {receipt.map((line, i) => (
              <li key={i}>{receipt.length > 1 ? `${i + 1}. ${line}` : line}</li>
            ))}
          </ol>
        </SuccessPanel>
      )}

      {/* No submit button inside: Enter in a field must not send (or half-validate) the form. */}
      <form
        ref={formRef} hidden={status === 'success'}
        onSubmit={(e) => e.preventDefault()} onChange={handleChange} noValidate
        className="space-y-5"
      >
        <input type="hidden" name="leadType" value="Property Information Form" />
        <input type="hidden" name="propertyCount" value={cards.ids.length} />

        <ClientInformation errors={clientErrors} billingEmail />

        <PropertyCards cards={cards} />

        <ConfirmationCard
          statement="By submitting this form, I confirm that the information provided is accurate and complete. I understand that Blue Bunny Turnover Services is not responsible for service issues resulting from inaccurate or outdated property information."
          error={clientErrors.clientName}
          submitLabel={cards.ids.length > 1 ? `Submit ${cards.ids.length} Properties` : 'Submit Property Information'}
          status={status}
          errorCount={errorCount}
          errorMsg={errorMsg}
          onSubmit={handleSubmit}
        />
      </form>
    </>
  );
}
