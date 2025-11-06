import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhyChooseUs from './components/WhyChooseUs';
import Contact from './components/Contact';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#5DAFD5]">
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <Contact />
    </div>
  );
}
