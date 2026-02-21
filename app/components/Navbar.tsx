'use client';

import { type MouseEvent, useEffect, useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        touchStartY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;

      const isPullingDown = event.touches[0].clientY > touchStartY;
      if (window.scrollY <= 0 && isPullingDown) {
        event.preventDefault();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (window.scrollY <= 0 && event.deltaY < 0) {
        event.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Why Choose Us', href: '#why-choose-us' },
    { name: 'Our Process', href: '#our-process' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsMenuOpen(false);

    if (href === '#home') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#5DAFD5] border-b border-[#2978A5]"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <a href="#home" className="flex items-center gap-3">
              <Image
                src="/banner-logo.png"
                alt="Blue Bunny Turnover Services Logo"
                width={900}
                height={300}
                sizes="(min-width: 768px) 228px, 192px"
                loading="eager"
                className="h-[3.7rem] md:h-19 w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="text-[#0C1014] hover:text-white transition-colors font-sans text-base font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[#2978A5]/20 transition-colors"
            aria-label="Toggle menu"
            data-modal-ignore-close
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-[#0C1014] transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-[#0C1014] transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-[#0C1014] transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-96 pb-6' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(event) => handleNavClick(event, link.href)}
                className="text-[#0C1014] hover:text-white transition-colors font-sans text-sm py-1.5 font-medium"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
