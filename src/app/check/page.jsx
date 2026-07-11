import CheckSearchPanel from "../components/CheckSearchPanel";
import CheckResultCard from "../components/CheckResultCard";
import RelatedReports from "../components/RelatedReports";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function CheckPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-black text-[#06285c]">
          Check Before You Pay
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Search a phone number, payment number, Facebook page, website or
          business name before you send money.
        </p>
      </section>

      <CheckSearchPanel />

      <CheckResultCard />

      <RelatedReports />

      <Footer />
    </main>
  );
}
