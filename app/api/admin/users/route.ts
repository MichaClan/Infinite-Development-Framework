import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// GET all users with roles (Owner + Admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Get current user to check role
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { role: true },
  });

  if (!currentUser || (currentUser.role?.name !== "owner" && currentUser.role?.name !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Owner sees all users Admin sees non-admin users
  let users;
  if (currentUser.role.name === "owner") {
    users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Admin can only see non-owner and non-admin users
    users = await prisma.user.findMany({
      include: { role: true },
      where: {
        role: {
          name: {
            notIn: ["owner", "admin"],
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(users);
}