import MvpRoadmap from "../components/roadmap/MvpRoadmap";
import Navbar from "../components/shared/Navbar";

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <MvpRoadmap />
    </main>
  );
}
