"use client";
import { useState } from "react";

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

export default function OwnerClient({
  initialUsers,
  initialRoles,
}: {
  initialUsers: User[];
  initialRoles: Role[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function updateUserRole(userId: string, roleId: string) {
    if (!roleId) return;
    
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error}`);
        setUpdatingUserId(null);
        return;
      }

      const updated = await res.json();
      setUsers(users.map((u) => (u.id === userId ? updated : u)));
      alert("Role updated!");
    } catch (err) {
      console.error("Error:", err);
      alert("Error updating role");
    }
    setUpdatingUserId(null);
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error}`);
        return;
      }

      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted!");
    } catch (err) {
      console.error("Error:", err);
      alert("Error deleting user");
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {users.length === 0 ? (
        <p className="text-gray-400">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="pb-3">Username</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Current Role</th>
                <th className="pb-3">Change Role</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3">{user.username}</td>
                  <td className="py-3 text-gray-400">{user.email}</td>
                  <td className="py-3">
                    <span className="bg-gray-700 px-3 py-1 rounded text-sm">
                      {user.role?.name || "none"}
                    </span>
                  </td>
                  <td className="py-3">
                    <select
                      value={user.role?.id || ""}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={updatingUserId === user.id}
                      className="bg-gray-700 text-white px-3 py-1 rounded text-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select role...</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}