import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// get current loggedin user's scores and stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      scores: true,
      achievements: {
        include: { achievement: true }
      }
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const gamesPlayed = user.scores.length;
  const highScore = user.scores.length > 0
    ? Math.max(...user.scores.map(s => s.score))
    : 0;
  const bestWave = user.scores.length > 0
    ? Math.max(...user.scores.map(s => s.wavesReached))
    : 0;
  const recentGames = user.scores
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
    .slice(0, 5)
    .map(s => ({ score: s.score, wavesReached: s.wavesReached, playedAt: s.playedAt }));

  return NextResponse.json({ 
    gamesPlayed, 
    highScore, 
    bestWave, 
    recentGames,
    achievements: user.achievements
  });
}