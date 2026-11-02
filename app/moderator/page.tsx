import { requireRole } from "@/lib/auth";
import Link from "next/link";

export default async function ModeratorPage() {
  await requireRole("moderator");

  return (
    <main className="p-10 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Moderator Panel</h1>

      <p className="text-gray-400 mb-6">
        Manage scores and keep the leaderboard fair.
      </p>

      {/* Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <Link href="/moderator/scores">
          <button className="w-full bg-gray-700 px-4 py-3 rounded text-sm text-gray-200 active:scale-[0.98]">
            View All Scores
          </button>
        </Link>

      </div>
    </main>
  );
}