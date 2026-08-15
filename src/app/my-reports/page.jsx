import MyReportsDashboard from "../components/reports/MyReportsDashboard";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function MyReportsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <MyReportsDashboard />
      <Footer />
    </main>
  );
}
