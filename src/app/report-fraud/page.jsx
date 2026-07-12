import ReportFormShell from "../components/report-fraud/ReportFormShell";
import ReportFraudHero from "../components/report-fraud/ReportFraudHero";
import ReportStepBar from "../components/report-fraud/ReportStepBar";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function ReportFraudPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ReportFraudHero />
      <ReportStepBar />
      <ReportFormShell />
      <Footer />
    </main>
  );
}
