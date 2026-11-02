"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    gamesPlayed: 0,
    highScore: 0,
    bestWave: 0,
    recentGames: [] as { score: number; wavesReached: number; playedAt: string }[],
    achievements: [] as any[]
  });

  // Change fields state
  const [editField, setEditField] = useState<"username" | "email" | "password" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editConfirm, setEditConfirm] = useState("");
  const [editMsg, setEditMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session) {
      fetch("/api/scores/me")
        .then(res => res.json())
        .then(data => setStats(data));
    }
  }, [status, session, router]);

  async function handleSaveEdit() {
    if (!editField) return;
    if (editField === "password" && editValue !== editConfirm) {
      setEditMsg("Passwords don't match");
      return;
    }

    const confirmMsg =
      editField === "username" ? `Change your username to "${editValue}"?` :
        editField === "email" ? `Change your email to "${editValue}"?` :
          "Change your password?";

    if (!window.confirm(confirmMsg)) return;

    const res = await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: editField, value: editValue }),
    });
    const data = await res.json();
    if (data.error) {
      setEditMsg(data.error);
    } else {
      setEditMsg("Saved! Logging you out to apply changes...");
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 1500);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex gap-6 p-10 bg-gray-900 min-h-screen text-white">

      {/* Left sidebar */}
      <div className="flex flex-col items-center bg-gray-800 rounded-lg p-6 w-56 gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold">
          {session?.user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="text-center">
          <p className="font-bold text-lg">{session?.user?.name}</p>
          <p className="text-gray-400 text-sm">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-auto bg-red-600 px-4 py-2 rounded w-full hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Right panel */}
      <div className="flex flex-col gap-4 flex-1">

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Stats</h2>
          <div className="flex gap-6">
            <div className="bg-gray-700 rounded p-4 flex-1 text-center">
              <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
              <p className="text-gray-400 text-sm">Games Played</p>
            </div>
            <div className="bg-gray-700 rounded p-4 flex-1 text-center">
              <p className="text-2xl font-bold">{stats.highScore}</p>
              <p className="text-gray-400 text-sm">Highest Score</p>
            </div>
            <div className="bg-gray-700 rounded p-4 flex-1 text-center">
              <p className="text-2xl font-bold">{stats.bestWave}</p>
              <p className="text-gray-400 text-sm">Best Wave</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <div className="flex flex-col gap-3">

            {(["username", "email", "password"] as const).map(field => (
              <div key={field}>
                <div className="flex justify-between items-center bg-gray-700 rounded p-3">
                  <p className="capitalize">{field}</p>
                  <button
                    onClick={() => {
                      setEditField(editField === field ? null : field);
                      setEditValue("");
                      setEditConfirm("");
                      setEditMsg("");
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {editField === field ? "Cancel" : "Change"}
                  </button>
                </div>

                {editField === field && (
                  <div className="bg-gray-700 rounded p-3 mt-1 flex flex-col gap-2">
                    <input
                      type={field === "password" ? "password" : "text"}
                      placeholder={`New ${field}`}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="bg-gray-600 rounded p-2 text-sm w-full"
                    />
                    {field === "password" && (
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={editConfirm}
                        onChange={e => setEditConfirm(e.target.value)}
                        className="bg-gray-600 rounded p-2 text-sm w-full"
                      />
                    )}
                    {editMsg && (
                      <p className={`text-sm ${editMsg.startsWith("Saved") ? "text-green-400" : "text-red-400"}`}>
                        {editMsg}
                      </p>
                    )}
                    <p className="text-xs text-yellow-400">
                      ⚠ You will be logged out after saving to apply changes
                    </p>
                    <button
                      onClick={handleSaveEdit}
                      className="bg-blue-600 rounded p-2 text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          {stats.achievements?.length === 0 ? (
            <p className="text-gray-400">No achievements yet. Keep playing!</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {stats.achievements?.map((ach: any) => (
                <div key={ach.id} className="bg-gray-700 rounded p-2 text-center text-sm">
                  <p className="text-2xl mb-1">{ach.achievement.icon}</p>
                  <p className="font-bold text-xs">{ach.achievement.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Match History */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Match History</h2>
          {stats.recentGames?.length === 0 ? (
            <p className="text-gray-400">No games played yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.recentGames.map((game, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-700 rounded p-3">
                  <span className="text-yellow-400 font-bold">{game.score} pts</span>
                  <span className="text-gray-300">Wave {game.wavesReached}</span>
                  <span className="text-gray-400 text-sm">
                    {new Date(game.playedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}