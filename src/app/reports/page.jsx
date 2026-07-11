import PublishedReportsList from "../components/reports/PublishedReportsList";
import ReportsHeader from "../components/reports/ReportsHeader";
import ReportsSidebarFilters from "../components/reports/ReportsSidebarFilters";
import ReportsStats from "../components/reports/ReportsStats";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ReportsHeader />
      <ReportsStats />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[280px_1fr]">
        <ReportsSidebarFilters />
        <PublishedReportsList />
      </section>
      <Footer />
    </main>
  );
}
