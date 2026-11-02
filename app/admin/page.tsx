"use client";
import { requireRole } from "@/lib/auth";
import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  email: string;
  role: { id: string; name: string } | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Role {
  id: string;
  name: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "achievements" | "scores">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newAchievement, setNewAchievement] = useState({ name: "", description: "", icon: "" });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [usersRes, achRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/achievements"),
        fetch("/api/roles"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (achRes.ok) setAchievements(await achRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  }

  // USERS TAB
  async function updateUserRole(userId: string, roleId: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    });
    if (res.ok) fetchAll();
    else alert("Error updating role");
  }

  async function updateUsername(userId: string, username: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    if (res.ok) {
      setEditingUser(null);
      fetchAll();
    } else alert("Error updating username");
  }

  async function deleteUser(userId: string) {
    if (!window.confirm("Delete this user?")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) fetchAll();
    else alert("Error deleting user");
  }

  // ACHIEVEMENTS TAB
  async function createAchievement() {
    if (!newAchievement.name || !newAchievement.description || !newAchievement.icon) {
      alert("Fill all fields");
      return;
    }
    const res = await fetch("/api/admin/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAchievement),
    });
    if (res.ok) {
      setNewAchievement({ name: "", description: "", icon: "" });
      fetchAll();
    } else alert("Error creating achievement");
  }

  async function deleteAchievement(id: string) {
    if (!window.confirm("Delete this achievement?")) return;
    const res = await fetch(`/api/admin/achievements/${id}`, { method: "DELETE" });
    if (res.ok) fetchAll();
    else alert("Error deleting achievement");
  }

  return (
    <main className="p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 font-bold ${tab === "users" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
        >
          Users
        </button>
        <button
          onClick={() => setTab("achievements")}
          className={`px-4 py-2 font-bold ${tab === "achievements" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
        >
          Achievements
        </button>
        <button
          onClick={() => setTab("scores")}
          className={`px-4 py-2 font-bold ${tab === "scores" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
        >
          Moderate Scores
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <>
          {/* USERS TAB */}
          {tab === "users" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="pb-3">Username</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="py-3">
                          {editingUser === user.id ? (
                            <input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              className="bg-gray-700 p-1 rounded"
                            />
                          ) : (
                            user.username
                          )}
                        </td>
                        <td className="py-3 text-gray-400">{user.email}</td>
                        <td className="py-3">
                          <select
                            value={user.role?.id || ""}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                          >
                            <option value="">Select role...</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 flex gap-2">
                          {editingUser === user.id ? (
                            <>
                              <button
                                onClick={() => updateUsername(user.id, editUsername)}
                                className="bg-green-600 px-2 py-1 rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="bg-gray-600 px-2 py-1 rounded text-sm hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingUser(user.id);
                                  setEditUsername(user.username);
                                }}
                                className="bg-blue-600 px-2 py-1 rounded text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="bg-red-600 px-2 py-1 rounded text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {tab === "achievements" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Manage Achievements</h2>

              {/* Create Form */}
              <div className="bg-gray-800 p-6 rounded mb-6">
                <h3 className="text-lg font-bold mb-4">Create New Achievement</h3>
                <div className="flex flex-col gap-3 max-w-md">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newAchievement.name}
                    onChange={(e) => setNewAchievement({ ...newAchievement, name: e.target.value })}
                    className="bg-gray-700 p-2 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                    className="bg-gray-700 p-2 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Icon (emoji)"
                    value={newAchievement.icon}
                    onChange={(e) => setNewAchievement({ ...newAchievement, icon: e.target.value })}
                    className="bg-gray-700 p-2 rounded text-white"
                  />
                  <button
                    onClick={createAchievement}
                    className="bg-blue-600 p-2 rounded font-bold hover:bg-blue-700"
                  >
                    Create Achievement
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((ach) => (
                  <div key={ach.id} className="bg-gray-800 p-4 rounded text-center">
                    <p className="text-3xl mb-2">{ach.icon}</p>
                    <p className="font-bold text-sm">{ach.name}</p>
                    <p className="text-xs text-gray-400 mb-3">{ach.description}</p>
                    <button
                      onClick={() => deleteAchievement(ach.id)}
                      className="bg-red-600 px-3 py-1 rounded text-xs hover:bg-red-700 w-full"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCORES TAB (Moderator) */}
          {tab === "scores" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Review Scores</h2>
              <Link href="/moderator/scores">
                <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
                  Go to Moderator Panel →
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}