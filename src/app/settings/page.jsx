import SettingsDashboard from "../components/settings/SettingsDashboard";
import Navbar from "../components/shared/Navbar";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <SettingsDashboard />
    </main>
  );
}
