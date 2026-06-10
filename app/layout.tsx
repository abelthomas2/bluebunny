import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/app/lib/siteMetadata";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#5DAFD5",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
      "@id": "https://gobluebunny.com/#business",
      "name": "Blue Bunny Turnover Services",
      "description": "Vacation rental, Airbnb, and short-term rental cleaning for property managers in Orlando.",
      "url": "https://gobluebunny.com",
      "image": "https://gobluebunny.com/logo-schema.png",
      "telephone": "+19047385631",
      "email": "hello@gobluebunny.com",
      "areaServed": [
        "Orlando", "Kissimmee", "Davenport", "ChampionsGate",
        "Four Corners", "Lake Buena Vista", "International Drive"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Turnover Cleaning Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Vacation Rental Cleaning" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Short-Term Rental Cleaning" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Airbnb Cleaning" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "VRBO Cleaning" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Turnover Cleaning" } }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do you specialize in short-term rental properties?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — most of our clients are Airbnb and VRBO hosts managing multiple properties across the Orlando area. We built our process specifically around short-term rental turnovers: tight windows, back-to-back guests, and the documentation that protects your Superhost status."
          }
        },
        {
          "@type": "Question",
          "name": "What's your service area?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We cover a roughly 30-mile radius from Orlando, including the Disney corridor, Kissimmee, Davenport, ChampionsGate, Four Corners, Lake Buena Vista, and surrounding areas. If you manage properties in this zone, we can almost certainly reach them."
          }
        },
        {
          "@type": "Question",
          "name": "What if I'm not happy with a clean?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer a free reclean within 5 hours of completion. Photo documentation helps us act fast."
          }
        },
        {
          "@type": "Question",
          "name": "Do you integrate with PMS platforms?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We work with any platform that supports iCal export, including Guesty, Hostaway, Hospitable, Lodgify, OwnerRez, and direct Airbnb/VRBO calendars. During setup, we'll walk through the integration with your specific system."
          }
        },
        {
          "@type": "Question",
          "name": "Can you handle same-day turnovers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Same-day cleans are completed within 3.5 hours of checkout. For same-day turnovers on properties with more than 3 bedrooms, we dispatch a two-cleaner team to ensure the unit is guest-ready by check-in."
          }
        },
        {
          "@type": "Question",
          "name": "How do you document damage or missing items?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Every service includes a structured photo, damage, and inventory report with timestamped before/after photos. You receive a branded PDF the same day — a complete paper trail for every clean."
          }
        },
        {
          "@type": "Question",
          "name": "How do I know the turnover is done?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You'll receive a completion confirmation as soon as the cleaner locks up, followed by the full property report the same day. No more texting your cleaner to ask if they're finished."
          }
        },
        {
          "@type": "Question",
          "name": "How far in advance do I need to schedule?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You don't. We sync directly with your PMS or calendar, so cleans are automatically queued as soon as a guest books. There's nothing to schedule manually. For one-off deep cleans or onboarding setup, we prefer 48 hours notice when possible, but same-day service is available."
          }
        },
        {
          "@type": "Question",
          "name": "What happens if a guest checks out late or checks in early?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We notify you as soon as our cleaner arrives and encounters the situation. We'll adjust the cleaning window and keep you updated in real time. If the delay means the turn can't be completed before check-in, we'll flag it immediately so your team can coordinate with the incoming guest."
          }
        },
        {
          "@type": "Question",
          "name": "Do you bring supplies?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Our cleaners bring all their own tools and cleaning products. If you'd like us to supply and restock guest consumables (soaps, paper goods, coffee, etc.), we offer the Blue Bunny Consumables Program at $7 + $4 per bathroom per turn. Client-supplied consumables are restocked at no extra charge."
          }
        },
        {
          "@type": "Question",
          "name": "Do you handle linens?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. In-unit linen wash and reset is included with every standard clean using the property's washer and dryer. If appliances are broken or the service is same-day on a larger property, we handle offsite laundry for a $10 handling fee."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-[#06080C]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  )
}
