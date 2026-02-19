const currentYear = new Date().getFullYear();

const quickLinks = [
  { label: 'Our Process', href: '#our-process' },
  { label: 'Why Choose Us', href: '#why-choose-us' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#080B10] via-[#111720] to-[#06080C] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="space-y-3 md:max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#5DAFD5]">
              BLUE BUNNY TURNOVER SERVICES
            </p>
            <p className="text-xl font-semibold text-white">
              Orlando’s #1 STR Turnover Service.
            </p>
            <p className="text-sm font-mono text-white">
              Your hassle-free solution for perfectly timed Airbnb turnovers.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#5DAFD5]">
              QUICK LINKS
            </p>
            <div className="flex flex-col gap-2 text-sm font-mono text-white">
              {quickLinks.map((link) => (
                <a key={link.label} href={link.href} className="transition hover:text-[#5DAFD5]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm font-mono text-white">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#5DAFD5]">
              SAY HELLO
            </p>
            <a href="tel:6465049590" className="transition hover:text-[#5DAFD5]">
              646-504-9590
            </a>
            <a href="mailto:hello@gobluebunny.com" className="transition hover:text-[#5DAFD5]">
              hello@gobluebunny.com
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-mono text-white md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4 text-sm font-mono text-[#5DAFD5]">
            <a href="https://www.instagram.com/bluebunnyrentalcleaners" className="transition hover:text-white">Instagram</a>
            <a href="https://www.tiktok.com/@bluebunnyrentalcleaners" className="transition hover:text-white">TikTok</a>
            <a href="https://www.facebook.com/people/Blue-Bunny-Rental-Cleaners/61583323305953/" className="transition hover:text-white">Facebook</a>
          </div>
          <p className="text-white">
            © {currentYear} Blue Bunny Turnover Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
