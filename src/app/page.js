import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import StatsSection from "./components/StatsSection";
import ActionCards from "./components/ActionCards";
import HowItWorks from "./components/HowItWorks";
import ScamCategories from "./components/ScamCategories";
import RecentReports from "./components/RecentReports";
import ScamGuides from "./components/ScamGuides";
import Footer from "./components/Footer";
import SafetyTipBanner from "./components/SafetyTipBanner";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ActionCards />
      <HowItWorks />
      <ScamCategories />
      <RecentReports />
      <ScamGuides />
      <SafetyTipBanner />
      <Footer />
    </main>
  );
}
