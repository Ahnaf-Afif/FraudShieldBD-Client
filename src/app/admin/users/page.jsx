import Navbar from "../../components/shared/Navbar";
import UserRoleManagement from "../../components/admin/UserRoleManagement";

export default function AdminUsersPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <UserRoleManagement />
    </main>
  );
}
