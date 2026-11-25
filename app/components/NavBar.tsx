'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { track } from '@/app/lib/analytics';
import { Icon } from '@/app/components/BrandIcons';
import { FORM_ANCHOR, PHONE_DISPLAY, PHONE_TEL, SUPPORT_HOURS, TOP_ANCHOR } from '@/app/lib/brand';
import BunnyPeek from '@/app/components/BunnyPeek';
import s from './NavBar.module.css';

// Header and phone menu from the design file. The labels are the design's; each link points at the
// section the page has today, so nothing dead-ends while the rest of the page is being replaced.
const NAV_LINKS = [
  { label: 'Reporting', href: '#deliverable-report' },
  { label: 'Process', href: '#our-process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Team', href: '#cleaner-vetting' },
  { label: 'FAQ', href: '#faq' },
];

const MENU_LINKS = [
  { label: 'What you get', href: '#what-pms-get' },
  { label: 'Reporting', href: '#deliverable-report' },
  { label: 'Our process', href: '#our-process' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Our team', href: '#cleaner-vetting' },
  { label: 'Reviews', href: '#proof' },
  { label: 'How it starts', href: '#onboarding-steps' },
  { label: 'FAQ', href: '#faq' },
];

// Must match the breakpoint in NavBar.module.css.
const DESKTOP_QUERY = '(min-width: 1152px)';

function Logo({ large }: { large?: boolean }) {
  return (
    <Image
      src="/blue-bunny-logo.svg"
      alt="Blue Bunny Turnover Services"
      width={large ? 246 : 178}
      height={large ? 58 : 42}
      unoptimized
      loading="eager"
      className={`${s.logo} ${large ? s.logoLarge : s.logoSmall}`}
    />
  );
}

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenu = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) menuButtonRef.current?.focus();
  };

  // While the menu is open: the page behind it doesn't scroll, Escape closes it, Tab stays inside it,
  // and it closes itself if the window grows to the desktop header.
  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (!panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onWiden = () => {
      if (desktop.matches) setIsOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onWiden);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onWiden);
    };
  }, [isOpen]);

  return (
    <header className={s.header}>
      {/* Phone and small windows */}
      <div className={s.mobileBar}>
        <a href={TOP_ANCHOR} className={s.logoLink}>
          <Logo />
        </a>
        <button
          ref={menuButtonRef}
          type="button"
          className={s.roundButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="site-menu"
        >
          <Icon name="menu" size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Desktop */}
      <div className={s.desktopBar}>
        <div className={s.desktopInner}>
          <a href={TOP_ANCHOR} className={s.logoLink}>
            <Logo large />
          </a>
          <nav className={s.nav} aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className={s.navLink}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className={s.actions}>
            <div className={s.actionsRow}>
              <a
                href={PHONE_TEL}
                onClick={() => track('cta_call_tap', { location: 'nav' })}
                className={`${s.btn} ${s.btnWhite} ${s.btnHeaderCall}`}
              >
                Call or text {PHONE_DISPLAY}
              </a>
              <a
                href={FORM_ANCHOR}
                onClick={() => track('cta_onboarding_tap', { location: 'nav' })}
                className={`${s.btn} ${s.btnInk} ${s.btnHeaderPilot}`}
              >
                Start a pilot
              </a>
            </div>
            <p className={`${s.support} ${s.mono}`}>{SUPPORT_HOURS}</p>
          </div>
        </div>
      </div>

      {/* Phone menu: covers the screen, the design's "Menu open" frame */}
      {isOpen && (
        <div id="site-menu" ref={panelRef} className={s.menu} role="dialog" aria-modal="true" aria-label="Menu">
          <div className={s.menuTop}>
            <a href={TOP_ANCHOR} className={s.logoLink} onClick={() => closeMenu(false)}>
              <Logo />
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              className={s.roundButton}
              onClick={() => closeMenu(true)}
              aria-label="Close menu"
            >
              <Icon name="x" size={20} strokeWidth={2} />
            </button>
          </div>

          <nav className={s.menuNav} aria-label="Menu">
            {MENU_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={s.menuLink} onClick={() => closeMenu(false)}>
                <span>{link.label}</span>
                <Icon name="arrow" size={18} />
              </a>
            ))}
          </nav>

          <div className={s.menuActions}>
            <a
              href={FORM_ANCHOR}
              onClick={() => {
                track('cta_onboarding_tap', { location: 'nav' });
                closeMenu(false);
              }}
              className={`${s.btn} ${s.btnInk} ${s.btnFull}`}
            >
              Start a pilot
            </a>
            <a
              href={PHONE_TEL}
              onClick={() => track('cta_call_tap', { location: 'nav' })}
              className={`${s.btn} ${s.btnWhite} ${s.btnFull}`}
            >
              Call or text {PHONE_DISPLAY}
            </a>
            <p className={`${s.menuSupport} ${s.mono}`}>{SUPPORT_HOURS}</p>
          </div>

          <div className={s.menuFill} aria-hidden="true" />
          <BunnyPeek align="end" className={s.menuPeek} />
        </div>
      )}
    </header>
  );
}
