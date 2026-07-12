import ScamLibraryHero from "../components/scam-library/ScamLibraryHero";
import ScamLibraryTabs from "../components/scam-library/ScamLibraryTabs";
import FeaturedGuide from "../components/scam-library/FeaturedGuide";
import GuideGrid from "../components/scam-library/GuideGrid";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function ScamLibraryPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ScamLibraryHero />
      <ScamLibraryTabs />
      <FeaturedGuide />
      <GuideGrid />
      <Footer />
    </main>
  );
}
