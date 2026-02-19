import Image from 'next/image';
import HeroLeadForm from './HeroLeadForm';

export default function Hero() {
  return (
    <section id="home" className="relative w-full min-h-screen">
      <div className="absolute inset-0">
        <Image
          src="/banner4.jpg"
          alt="Blue Bunny Turnover Services"
          fill
          sizes="100vw"
          priority
          quality={70}
          className="object-cover object-[75%_50%]"
        />
      </div>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-5 pt-32 pb-20 md:mt-[var(--navbar-height)] md:min-h-[calc(100vh-var(--navbar-height))] md:flex-col md:pt-0 md:pb-0">
        <div className="w-full text-center">
          <h1 className="text-5xl md:text-7xl font-semibold !text-white mb-3">
            Orlando&rsquo;s <span className="!text-[#5DAFD5]">#1</span>
            <br />
            STR Turnover Service
          </h1>
          <p className="text-sm md:text-lg !text-white font-mono mb-2 border-1 border-white rounded-lg px-3 py-1.5 inline-block bg-white/10 backdrop-blur-md">
            LICENSED + INSURED + VETTED
          </p>
          <p className="text-base md:text-2xl !text-white font-mono mb-8 max-w-[24rem] sm:max-w-[24rem] md:max-w-3xl mx-auto">
            Your hassle-free solution for perfectly timed Airbnb turnovers.
          </p>
          <HeroLeadForm />
        </div>
      </div>
    </section>
  );
}
