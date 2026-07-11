import HeroSection from "./components/home/HeroSection";
import Navbar from "./components/shared/Navbar";
import StatsSection from "./components/home/StatsSection";
import ActionCards from "./components/home/ActionCards";
import HowItWorks from "./components/home/HowItWorks";
import ScamCategories from "./components/home/ScamCategories";
import RecentReports from "./components/home/RecentReports";
import ScamGuides from "./components/home/ScamGuides";
import Footer from "./components/shared/Footer";
import SafetyTipBanner from "./components/home/SafetyTipBanner";

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
