import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("GET roles error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}