'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { track, type SampleEvent } from './analytics';

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event?: SampleEvent;
  eventProps?: Record<string, string | number>;
};

// Plain anchor that fires an analytics event on click. Used for every tracked CTA
// (call/text, pilot, PDF download) so links keep working with JS disabled.
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
