import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import WhyChooseUs from './components/WhyChooseUs';
import OurProcess from './components/OurProcess';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import SectionDivider from './components/SectionDivider';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0C1014]">
      <div className="bg-[#5DAFD5]">
        <Navbar />
        <Hero />
        <Testimonials />
        <SectionDivider />
        <WhyChooseUs />
        <SectionDivider />
        <OurProcess />
        <SectionDivider />
        <FAQ />
        <SectionDivider />
        <Contact />
      </div>
      <Footer />
    </div>
  );
}
