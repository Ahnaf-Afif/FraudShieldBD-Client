import ReportCategoryForm from "../components/report-fraud/ReportCategoryForm";
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
      <ReportCategoryForm />
      <Footer />
    </main>
  );
}
