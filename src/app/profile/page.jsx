import ProfileDashboard from "../components/profile/ProfileDashboard";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ProfileDashboard />
      <Footer />
    </main>
  );
}
