import NotificationsDashboard from "../components/notifications/NotificationsDashboard";
import Footer from "../components/shared/Footer";
import Navbar from "../components/shared/Navbar";

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <NotificationsDashboard />
      <Footer />
    </main>
  );
}
