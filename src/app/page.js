import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import StatsSection from "./components/StatsSection";
import ActionCards from "./components/ActionCards";
import HowItWorks from "./components/HowItWorks";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ActionCards />
      <HowItWorks />
    </main>
  );
}
