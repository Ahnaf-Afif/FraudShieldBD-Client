import ReportsExplorer from "../components/reports/ReportsExplorer";
import ReportsHeader from "../components/reports/ReportsHeader";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ReportsHeader />
      <ReportsExplorer />
      <Footer />
    </main>
  );
}
