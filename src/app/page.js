import HeroSection from "./components/home/HeroSection";
import Navbar from "./components/shared/Navbar";
import HomeNewsFeed from "./components/home/HomeNewsFeed";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HomeNewsFeed />
    </main>
  );
}
