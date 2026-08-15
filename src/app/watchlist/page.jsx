import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";
import WatchlistDashboard from "../components/watchlist/WatchlistDashboard";

export default function WatchlistPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <WatchlistDashboard />
      <Footer />
    </main>
  );
}
