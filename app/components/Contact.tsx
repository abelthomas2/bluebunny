export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-gradient-to-br from-white via-[#F5FBFF] to-[#FDF4EC] pt-15 md:pt-20 pb-15 md:pb-20 px-4 text-[#0C1014] scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <p className="text-base md:text-lg font-mono uppercase tracking-[0.35em] text-[#2978A5]">
            CONTACT
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#0C1014]">
            Talk with the Blue Bunny team
          </h2>
          <p className="text-base md:text-xl font-mono text-[#0C1014]">
            Feel free to reach out through phone or email and share your turnover schedule. Questions and concerns are welcome as well.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="rounded-3xl border border-[#5DAFD5] bg-gradient-to-br from-white via-[#E7F5FF] to-white p-8 text-[#0C1014] space-y-4 shadow-[0_20px_60px_rgba(12,16,20,0.08)]">
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-[#2978A5]">
              Call or text
            </p>
            <a
              href="tel:6465049590"
              className="text-xl font-semibold text-[#0C1014] hover:text-[#5DAFD5] transition-colors"
            >
              646-504-9590
            </a>
            <p className="text-base md:text-base font-mono text-[#0C1014]">
              Daily support from 8am to 8pm ET.
            </p>
          </div>
          <div className="rounded-3xl border border-[#5DAFD5] bg-gradient-to-br from-white via-[#E7F5FF] to-white p-8 text-[#0C1014] space-y-4 shadow-[0_20px_60px_rgba(41,120,165,0.12)]">
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-[#2978A5]">
              Email
            </p>
            <a
              href="mailto:hello@gobluebunny.com"
              className="text-xl md:text-2xl font-semibold text-[#0C1014] hover:text-[#2978A5] transition-colors break-words"
            >
              hello@gobluebunny.com
            </a>
            <p className="text-base md:text-base font-mono text-[#0C1014]">
              Same-day response from our STR specialists.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
