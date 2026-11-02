import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["admin", "owner"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const achievements = await prisma.achievement.findMany();
  return NextResponse.json(achievements);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || !["admin", "owner"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { name, description, icon } = await req.json();
  const achievement = await prisma.achievement.create({
    data: { name, description, icon },
  });
  return NextResponse.json(achievement);
}