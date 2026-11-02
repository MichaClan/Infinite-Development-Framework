import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, username, password } = await req.json();

  if (!email || !username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  //  get player role
  const role = await prisma.role.findUnique({
    where: { name: "player" },
  });

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      roleId: role?.id, //  assign role
    },
  });

  return NextResponse.json({ message: "User created", userId: user.id });
}