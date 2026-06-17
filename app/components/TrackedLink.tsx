'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { track, type AnalyticsEvent } from '@/app/lib/analytics';

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event?: AnalyticsEvent;
  eventProps?: Record<string, string | number>;
};

// Plain anchor that fires an analytics event on click. Used for every tracked CTA
// (call/text/email, onboarding, pilot, sample-report, PDF download) so links keep
// working with JS disabled.
export default function TrackedLink({
  event,
  eventProps,
  onClick,
  children,
  ...rest
}: TrackedLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (event) track(event, eventProps);
    onClick?.(e);
  };

  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
