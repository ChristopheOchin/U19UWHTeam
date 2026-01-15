import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import StravaSection from '@/components/StravaSection';
import EventInfo from '@/components/EventInfo';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <AboutSection />
      <StravaSection />
      <EventInfo />
      <Footer />
    </main>
  );
}
