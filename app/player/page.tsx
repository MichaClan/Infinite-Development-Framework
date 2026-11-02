// app/player/page.tsx
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function PlayerPage() {
  await requireRole("player");

  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: {
      achievements: {
        include: { achievement: true }
      }
    }
  });

  // Get all achievements
  const allAchievements = await prisma.achievement.findMany();
  
  // Find unlocked vs locked
  const unlockedIds = new Set(user?.achievements.map(a => a.achievement.id) || []);
  const unlockedAchievements = allAchievements.filter(a => unlockedIds.has(a.id));
  const lockedAchievements = allAchievements.filter(a => !unlockedIds.has(a.id));

  return (
    <main className="p-10 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>

      <p className="mb-6 text-gray-400">Play the game, view your stats, climb leaderboard.</p>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Achievements Unlocked </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {unlockedAchievements.map((ach) => (
              <div key={ach.id} className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-4 rounded text-center border-2 border-yellow-400">
                <p className="text-3xl mb-2">{ach.icon}</p>
                <p className="font-bold text-sm">{ach.name}</p>
                <p className="text-xs text-yellow-100">{ach.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Achievements to Unlock </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lockedAchievements.map((ach) => (
              <div key={ach.id} className="bg-gray-700 p-4 rounded text-center opacity-50 border-2 border-gray-600">
                <p className="text-3xl mb-2 grayscale">{ach.icon}</p>
                <p className="font-bold text-sm text-gray-300">{ach.name}</p>
                <p className="text-xs text-gray-400">{ach.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Link href="/game">
          <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Play
          </button>
        </Link>
        <Link href="/leaderboard">
          <button className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
            Leaderboard
          </button>
        </Link>
      </div>
    </main>
  );
}