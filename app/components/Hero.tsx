import Image from 'next/image';

export default function Hero() {
  return (
    <section id="home" className="relative w-full min-h-screen">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <Image
          src="/banner4.png"
          alt="Blue Bunny Rental Cleaners"
          fill
          priority
          quality={100}
          className="object-cover object-[75%_50%]"
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-35 pb-24 md:py-24">
        <div className="text-center md:-mt-[0px]">
          <h1 className="text-5xl md:text-7xl font-semibold !text-[#F5F0DF] mb-4">
            Orlando's <span className="!text-[#5DAFD5]">#1</span><br />STR Turnover Service
          </h1>
          <p className="text-sm md:text-lg !text-[#F5F0DF] font-mono mb-3 border-1 border-[#F5F0DF] rounded-lg px-4 py-2 inline-block bg-white/10 backdrop-blur-md">
            LICENSED + INSURED + VETTED
          </p>
          <p className="text-lg md:text-2xl !text-[#F5F0DF] font-mono mb-10 max-w-3xl mx-auto">
            Your hassle-free solution for perfectly timed Airbnb turnovers.
          </p>
          
          {/* Lead Form */}
          <div className="bg-[#F5F0DF] p-4 rounded-lg max-w-6xl mx-auto w-full">
            <form className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                <input
                  type="text"
                  placeholder="Zip Code"
                  className="md:col-span-1 px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m md:text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                />
                <select className="md:col-span-1 px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m md:text-m w-full appearance-none bg-[#F5F0DF] bg-[length:16px_16px] bg-[right_0.6rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230C1014' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")"}}>
                  <option>1 bedroom</option>
                  <option>2 bedrooms</option>
                  <option>3 bedrooms</option>
                  <option>4+ bedrooms</option>
                </select>
                <select className="md:col-span-1 px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m md:text-m w-full appearance-none bg-[#F5F0DF] bg-[length:16px_16px] bg-[right_0.6rem_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%230C1014' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")"}}>
                  <option>1 bathroom</option>
                  <option>2 bathrooms</option>
                  <option>3 bathrooms</option>
                  <option>4+ bathrooms</option>
                </select>
                <input
                  type="text"
                  placeholder="Name"
                  className="md:col-span-1 px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="md:col-span-1 px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="md:col-span-1 px-4 py-3 border border-[#90A4AE] rounded text-[#0C1014] font-mono text-m w-full focus:outline-none focus:ring-2 focus:ring-[#5DAFD5] focus:border-[#5DAFD5]"
                />
                <button
                  type="submit"
                  className="md:col-span-1 px-8 py-3 bg-[#2978A5] text-[#F5F0DF] font-mono text-m font-medium rounded hover:bg-[#0C1014] transition-colors whitespace-nowrap w-full flex items-center justify-center"
                >
                  Get a Quote
                </button>
              </div>
            </form>
            <div className="mt-3 flex items-start gap-2">
              <input
                type="checkbox"
                id="consent"
                className="mt-1"
              />
              <label htmlFor="consent" className="text-sm text-[#0C1014] font-mono text-left">
                I consent to Blue Bunny Rental Cleaners collecting my phone number and potentially contacting me, in compliance with US regulations.
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
