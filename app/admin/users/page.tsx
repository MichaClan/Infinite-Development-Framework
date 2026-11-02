"use client";
import { requireRole } from "@/lib/auth";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  email: string;
  username: string;
  role: { id: string; name: string } | null;
}

interface Role {
  id: string;
  name: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data);
    setLoading(false);
  }

  async function fetchRoles() {
    const res = await fetch("/api/roles");
    const data = await res.json();
    if (res.ok) {
      // admins can only assign weaker roles
      if (session?.user?.role === "admin") {
        setRoles(data.filter((r: Role) => r.name !== "owner" && r.name !== "admin"));
      } else {
        setRoles(data);
      }
    }
  }

  async function updateUserRole(userId: string, roleId: string) {
    setUpdatingUserId(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    });

    if (res.ok) {
      fetchUsers();
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
    setUpdatingUserId(null);
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("Delete this user?")) return;

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchUsers();
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  }

  return (
    <main className="p-10 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin - Manage Users</h1>

      {loading ? (
        <p className="text-gray-400">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400">No users to manage.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-800 p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{user.username}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={user.role?.id || ""}
                  onChange={(e) => updateUserRole(user.id, e.target.value)}
                  disabled={updatingUserId === user.id}
                  className="bg-gray-700 text-white px-2 py-1 rounded text-sm cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                {/* Only owner can delete */}
                {session?.user?.role === "owner" && (
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}