import type { Metadata } from "next";
import Link from "next/link";

const cardClass =
  "rounded-3xl border border-[#5DAFD5] bg-white p-8 md:p-10 space-y-4";
const sectionHeadingClass = "text-2xl font-semibold text-[#0C1014]";
const subheadingClass = "text-lg font-semibold text-[#2978A5]";
const bodyTextClass = "text-[#0C1014]/80 leading-relaxed";
const listClass = "list-disc space-y-2 pl-6 text-[#0C1014]/80";

const infoProvideActions = [
  "Request a quote or service through our website",
  "Create an account or sign a service agreement",
  "Communicate with us via phone, email, or text message",
  "Provide property access codes, alarm information, or special instructions",
];

const infoProvideDetails = [
  "Name and contact information (email address, phone number, mailing address)",
  "Property addresses and access details",
  "Billing and payment information",
  "Calendar and booking platform credentials (if you authorize integration)",
  "Special requests or preferences for your property",
];

const infoAutomaticDetails = [
  "Browser type and version",
  "Operating system",
  "IP address and general location data",
  "Pages viewed and time spent on our site",
  "Referring website or search terms",
];

const thirdPartySources = [
  "Property management platforms (Airbnb, VRBO, direct booking systems) when you authorize integration",
  "Payment processors for billing purposes",
  "Background check services for employee screening",
  "Public records for property verification",
];

const useCases = [
  "Provide, maintain, and improve our cleaning services",
  "Schedule and coordinate turnovers based on your booking calendar",
  "Process payments and manage billing",
  "Send service confirmations, turnover reports, and updates",
  "Respond to your inquiries and provide customer support",
  "Communicate important notices about your account or our services",
  "Maintain property access information securely for authorized cleaners",
  "Detect, prevent, and address technical issues or fraudulent activity",
  "Comply with legal obligations and protect our rights",
];

const serviceProviders = [
  "Payment processors",
  "Calendar and scheduling platforms",
  "Background check providers",
  "Communication tools (email, SMS)",
  "Cloud storage and data management services",
];

const legalDisclosures = [
  "Valid legal process (subpoenas, court orders)",
  "Requests from law enforcement or government agencies",
  "Protection of our rights, property, or safety, or that of our users or the public",
  "Enforcement of our terms of service",
];

const securityMeasures = [
  "Encrypted transmission of sensitive data (SSL/TLS)",
  "Secure storage of access codes and passwords",
  "Regular security audits and employee training",
  "Restricted access to personal information on a need-to-know basis",
  "Background checks for all cleaning specialists",
];

const rightsBullets = [
  "Marketing communications by clicking “unsubscribe” in our emails",
  "SMS messages by replying “STOP”",
  "Cookie tracking by adjusting your browser settings",
];

const ccpaRights = [
  "Right to know what personal information we collect, use, and disclose",
  "Right to request deletion of personal information",
  "Right to opt out of the sale of personal information (we do not sell personal information)",
  "Right to non-discrimination for exercising these rights",
];

export const metadata: Metadata = {
  title: "Privacy Policy | Blue Bunny Turnover Services",
  description:
    "Learn how Blue Bunny Turnover Services collects, uses, and protects your information when you request short-term rental cleaning services.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-[#0C1014] px-6 py-16 md:px-12 md:py-24">
      <div className="max-w-4xl mx-auto space-y-4">
        <header className="space-y-5">
          <p className="text-xs font-mono uppercase tracking-[0.35em] text-[#2978A5]">
            Privacy
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-[#0C1014]">
            Privacy Policy
          </h1>
          <div className="space-y-2 text-base md:text-lg text-[#0C1014]/70">
            <p>Effective Date: November 14, 2025</p>
            <p>Last Updated: November 14, 2025</p>
          </div>
          <p className="text-base md:text-lg text-[#0C1014]/80 leading-relaxed">
            Blue Bunny Turnover Services (“we,” “us,” or “our”) is committed to protecting your
            privacy. This policy explains how we collect, use, disclose, and safeguard your
            information when you use our website, services, or interact with our team.
          </p>
        </header>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Information We Collect</h2>
          <div className="space-y-5 text-[#0C1014]/80 leading-relaxed">
            <div className="space-y-3">
              <h3 className={subheadingClass}>Information You Provide to Us</h3>
              <p className={bodyTextClass}>We collect information that you voluntarily provide when you:</p>
              <ul className={listClass}>
                {infoProvideActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={bodyTextClass}>This information may include:</p>
              <ul className={listClass}>
                {infoProvideDetails.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className={subheadingClass}>Information We Collect Automatically</h3>
              <p className={bodyTextClass}>
                When you visit our website, we may automatically collect the following information:
              </p>
              <ul className={listClass}>
                {infoAutomaticDetails.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={bodyTextClass}>
                We use cookies and similar tracking technologies to enhance your experience. You can
                control cookie preferences through your browser settings.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className={subheadingClass}>Information from Third-Party Sources</h3>
              <p className={bodyTextClass}>We may receive information from:</p>
              <ul className={listClass}>
                {thirdPartySources.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>How We Use Your Information</h2>
          <p className={bodyTextClass}>We use the collected information to:</p>
          <ul className={listClass}>
            {useCases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Information Sharing and Disclosure</h2>
          <p className={bodyTextClass}>
            We do not sell, rent, or trade your personal information. We may share it only under the
            circumstances below.
          </p>
          <div className="space-y-4 text-[#0C1014]/80 leading-relaxed">
            <div className="space-y-2">
              <h3 className={subheadingClass}>With Service Providers</h3>
              <p className={bodyTextClass}>
                We share necessary information with trusted third parties who assist in operating
                our business, including:
              </p>
              <ul className={listClass}>
                {serviceProviders.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={bodyTextClass}>
                These providers are contractually obligated to protect your information and use it
                only for the purposes we specify.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className={subheadingClass}>With Our Cleaning Team</h3>
              <p className={bodyTextClass}>
                We share property-specific information (address, access codes, special instructions,
                photos) with assigned cleaning specialists solely to perform turnover services. All
                team members sign confidentiality agreements and undergo background checks.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className={subheadingClass}>For Legal Reasons</h3>
              <p className={bodyTextClass}>We may disclose information when required by law or in response to:</p>
              <ul className={listClass}>
                {legalDisclosures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className={subheadingClass}>Business Transfers</h3>
              <p className={bodyTextClass}>
                If Blue Bunny Turnover Services is involved in a merger, acquisition, or sale of
                assets, your information may be transferred as part of that transaction. We will
                notify you of any such change and any choices you may have.
              </p>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Data Security</h2>
          <p className={bodyTextClass}>
            We implement appropriate technical and organizational measures to protect your
            information, including:
          </p>
          <ul className={listClass}>
            {securityMeasures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-[#0C1014]/70">
            However, no method of transmission over the internet or electronic storage is 100%
            secure. While we strive to protect your information, we cannot guarantee absolute
            security.
          </p>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Data Retention</h2>
          <p className={bodyTextClass}>
            We retain your personal information for as long as necessary to:
          </p>
          <ul className={listClass}>
            <li>Provide our services and maintain your account</li>
            <li>Comply with legal, accounting, or reporting requirements</li>
            <li>Resolve disputes and enforce our agreements</li>
          </ul>
          <p className="text-[#0C1014]/70">
            Property access information is deleted within 30 days of service termination unless
            legally required to retain it longer. Turnover reports and photos are retained for up to
            2 years for quality assurance and dispute resolution.
          </p>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Your Rights and Choices</h2>
          <div className="space-y-4 text-[#0C1014]/80 leading-relaxed">
            <div>
              <h3 className={subheadingClass}>Access and Correction</h3>
              <p className={bodyTextClass}>
                You may request access to your personal information and ask us to correct any
                inaccuracies. Contact us at{" "}
                <a
                  href="mailto:hello@gobluebunny.com"
                  className="text-[#2978A5] underline decoration-dotted underline-offset-4 hover:text-[#0C1014] transition-colors"
                >
                  hello@gobluebunny.com
                </a>{" "}
                to review or update your information.
              </p>
            </div>
            <div>
              <h3 className={subheadingClass}>Deletion</h3>
              <p className={bodyTextClass}>
                You may request deletion of your personal information, subject to certain
                exceptions (e.g., legal obligations, dispute resolution, fraud prevention).
              </p>
            </div>
            <div>
              <h3 className={subheadingClass}>Opt-Out</h3>
              <p className={bodyTextClass}>You may opt out of:</p>
              <ul className={listClass}>
                {rightsBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-[#0C1014]/70">
                Note that opting out of service-related communications (turnover confirmations,
                damage reports) may affect our ability to provide services.
              </p>
            </div>
            <div>
              <h3 className={subheadingClass}>Do Not Track</h3>
              <p className={bodyTextClass}>
                Our website does not currently respond to “Do Not Track” signals from browsers.
              </p>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>California Privacy Rights</h2>
          <p className={bodyTextClass}>
            California residents have additional rights under the California Consumer Privacy Act
            (CCPA):
          </p>
          <ul className={listClass}>
            {ccpaRights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-[#0C1014]/70">
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:hello@gobluebunny.com"
              className="text-[#2978A5] underline decoration-dotted underline-offset-4 hover:text-[#0C1014] transition-colors"
            >
              hello@gobluebunny.com
            </a>{" "}
            or call{" "}
            <a
              href="tel:6465049590"
              className="text-[#2978A5] underline decoration-dotted underline-offset-4 hover:text-[#0C1014] transition-colors"
            >
              646-504-9590
            </a>
            .
          </p>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Children&apos;s Privacy</h2>
          <p className={bodyTextClass}>
            Our services are not directed to individuals under 18 years of age. We do not knowingly
            collect personal information from children. If we become aware that we have collected
            information from a child without parental consent, we will delete it promptly.
          </p>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Third-Party Links</h2>
          <p className={bodyTextClass}>
            Our website may contain links to third-party websites or services. We are not
            responsible for the privacy practices of these external sites. We encourage you to review
            their privacy policies before providing any information.
          </p>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Changes to This Privacy Policy</h2>
          <p className={bodyTextClass}>
            We may update this Privacy Policy periodically to reflect changes in our practices or
            legal requirements. We will notify you of material changes by:
          </p>
          <ul className={listClass}>
            <li>Posting the updated policy on our website with a new “Last Updated” date</li>
            <li>Sending an email to the address associated with your account</li>
            <li>Providing notice through our services</li>
          </ul>
          <p className="text-[#0C1014]/70">
            Your continued use of our services after changes take effect constitutes acceptance of
            the updated policy.
          </p>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Contact Us</h2>
          <p className={bodyTextClass}>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us:
          </p>
          <div className="space-y-2 text-[#0C1014]">
            <p className="font-semibold">Blue Bunny Turnover Services</p>
            <p>
              Email:{" "}
              <a
                href="mailto:hello@gobluebunny.com"
                className="text-[#2978A5] underline decoration-dotted underline-offset-4 hover:text-[#0C1014] transition-colors"
              >
                hello@gobluebunny.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:6465049590"
                className="text-[#2978A5] underline decoration-dotted underline-offset-4 hover:text-[#0C1014] transition-colors"
              >
                646-504-9590
              </a>
            </p>
            <p>Hours: Daily support from 8am to 8pm ET</p>
            <p className="text-[#0C1014]/70">
              For privacy-specific inquiries, please include “Privacy Request” in your email subject
              line. We will respond within 30 days of receiving your request.
            </p>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className={sectionHeadingClass}>Consent</h2>
          <p className={bodyTextClass}>
            By using our website or services, you acknowledge that you have read and understood this
            Privacy Policy and consent to the collection, use, and disclosure of your information as
            described herein.
          </p>
        </section>

        <section className="rounded-3xl border border-[#2978A5] bg-white/80 p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-[#0C1014]">Need to talk to a human?</h2>
          <p className="text-[#0C1014]/80 leading-relaxed">
            Reach out any time if you want us to update, export, or delete the information we have on
            file.
          </p>
          <div className="space-y-2">
            <a
              href="mailto:hello@gobluebunny.com"
              className="block text-lg font-semibold text-[#2978A5] hover:text-[#0C1014] transition-colors"
            >
              hello@gobluebunny.com
            </a>
            <a
              href="tel:6465049590"
              className="block text-lg font-semibold text-[#2978A5] hover:text-[#0C1014] transition-colors"
            >
              646-504-9590
            </a>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-[#2978A5] hover:text-[#0C1014] transition-colors"
          >
            Return Home
            <span aria-hidden>↺</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
