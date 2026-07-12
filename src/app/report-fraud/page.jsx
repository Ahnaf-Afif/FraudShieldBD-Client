import ReportCategoryForm from "../components/report-fraud/ReportCategoryForm";
import ReportFraudHero from "../components/report-fraud/ReportFraudHero";
import ReportStepBar from "../components/report-fraud/ReportStepBar";
import ReportStoryForm from "../components/report-fraud/ReportStoryForm";
import ReportFinancialForm from "../components/report-fraud/ReportFinancialForm";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function ReportFraudPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ReportFraudHero />
      <ReportStepBar />
      <ReportCategoryForm />
      <ReportStoryForm />
      <ReportFinancialForm />
      <Footer />
    </main>
  );
}
