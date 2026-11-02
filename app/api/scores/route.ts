import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// save player score when game ends
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { score, wavesReached, enemiesKilled, towersPlaced, goldEarned } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Save score
  await prisma.score.create({
    data: { userId: user.id, score, wavesReached },
  });

  // Check achievements
  const achievements = await prisma.achievement.findMany();
  
  for (const achievement of achievements) {
    // Check if already unlocked
    const exists = await prisma.userAchievement.findFirst({
      where: { userId: user.id, achievementId: achievement.id },
    });
    if (exists) continue;

    // Check criteria
    let unlocked = false;
    if (achievement.name === "First Blood" && enemiesKilled >= 1) unlocked = true;
    if (achievement.name === "Wave Warrior" && wavesReached >= 10) unlocked = true;
    if (achievement.name === "Tower Master" && towersPlaced >= 20) unlocked = true;
    if (achievement.name === "Gold Hoarder" && goldEarned >= 1000) unlocked = true;
    if (achievement.name === "Untouchable") {
      // This one needs wave data - skip for now or add perfectWave flag
      unlocked = false;
    }

    if (unlocked) {
      await prisma.userAchievement.create({
        data: { userId: user.id, achievementId: achievement.id },
      });
    }
  }

  return NextResponse.json({ message: "Score saved" });
}

// get top 10 scores for leaderboard
export async function GET() {
  const scores = await prisma.score.findMany({
    orderBy: { score: "desc" },
    take: 10,
    include: { user: { select: { username: true } } },
  });

  return NextResponse.json(scores);
}