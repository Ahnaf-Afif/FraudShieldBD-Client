"use client";

import { ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../lib/apiClient";
import { getDemoSession } from "../../lib/demoSession";

const editableRoles = ["Community Member", "Moderator"];

export default function UserRoleManagement() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const result = await apiRequest("/auth/users");
      setUsers(result.users || []);
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Could not load users.");
    }
  }, []);

  useEffect(() => {
    const currentSession = getDemoSession();
    // This effect hydrates browser-only session state after SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(currentSession);

    if (currentSession?.role === "Admin") {
      // Loading remote admin data is the purpose of this effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadUsers();
    }
  }, [loadUsers]);

  async function updateRole(userId, role) {
    setStatus("saving");

    try {
      const result = await apiRequest(`/auth/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId ? { ...user, ...result.user } : user,
        ),
      );
      setStatus("Role updated successfully.");
    } catch (error) {
      setStatus(error.message || "Could not update the role.");
    }
  }

  if (session?.role !== "Admin") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-red-500" size={40} />
          <h1 className="mt-4 text-2xl font-black text-[#06285c]">
            Admin access required
          </h1>
          <p className="mt-2 text-slate-600">
            Only Admin accounts can manage member and moderator roles.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9f8f4] text-[#009879]">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#009879]">
                Admin workspace
              </p>
              <h1 className="text-2xl font-black text-[#06285c]">
                User roles
              </h1>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Showing the latest {users.length} accounts
          </p>
        </div>

        {status && (
          <p
            className={`mt-5 rounded-xl p-4 text-sm font-black ${
              status === "saving"
                ? "bg-slate-50 text-slate-500"
                : status.includes("successfully")
                  ? "bg-[#f0fbf7] text-[#007f66]"
                  : "bg-red-50 text-red-600"
            }`}
          >
            {status === "saving" ? "Saving role..." : status}
          </p>
        )}

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-black">User</th>
                <th className="px-4 py-3 font-black">Location</th>
                <th className="px-4 py-3 font-black">Current role</th>
                <th className="px-4 py-3 font-black">Change role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-4">
                    <p className="font-black text-[#06285c]">{user.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {user.email}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-600">
                    {user.location || "Not provided"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {user.role === "Admin" ? (
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                        Protected Admin
                      </span>
                    ) : (
                      <select
                        value={editableRoles.includes(user.role) ? user.role : "Community Member"}
                        onChange={(event) => updateRole(user._id, event.target.value)}
                        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-[#06285c] outline-none focus:border-[#009879]"
                      >
                        {editableRoles.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
