import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ModeratorScoresPage() {
  await requireRole("moderator");
  
  const scores = await prisma.score.findMany({
    orderBy: { score: "desc" },
    include: { user: { select: { username: true, email: true } } },
  });

  return (
    <main className="p-10 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Moderator — All Scores</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-700">
            <tr>
              <th className="pb-3">Player</th>
              <th className="pb-3">Score</th>
              <th className="pb-3">Wave</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="py-3">{s.user.username}</td>
                <td className="py-3 text-yellow-400 font-bold">{s.score}</td>
                <td className="py-3">{s.wavesReached}</td>
                <td className="py-3 text-gray-400">
                  {new Date(s.playedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}