import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// update user profile fields (username, email, or password)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { field, value } = await req.json();

  if (!value || value.trim() === "") {
    return NextResponse.json({ error: "Value cannot be empty" }, { status: 400 });
  }

  const updateData: any = {};

  if (field === "username") updateData.username = value;
  else if (field === "email") updateData.email = value;
  else if (field === "password") updateData.passwordHash = await bcrypt.hash(value, 10);
  else return NextResponse.json({ error: "Invalid field" }, { status: 400 });

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });
    return NextResponse.json({ message: "Updated" });
  } catch {
    return NextResponse.json({ error: "Already taken" }, { status: 400 });
  }
}