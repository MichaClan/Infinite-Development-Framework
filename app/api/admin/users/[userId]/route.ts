import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json();
    const { roleId, username } = body;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true },
    });

    if (!currentUser || (currentUser.role?.name !== "owner" && currentUser.role?.name !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: any = {};
    
    if (roleId) {
      const targetRole = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!targetRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      if (currentUser.role.name === "admin" && (targetRole.name === "owner" || targetRole.name === "admin")) {
        return NextResponse.json({ error: "Admin cannot assign this role" }, { status: 403 });
      }

      updateData.roleId = targetRole.id;
    }

    if (username) {
      updateData.username = username;
    }

    const updated = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
      include: { role: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true },
    });

    if (!currentUser || currentUser.role?.name !== "owner") {
      return NextResponse.json({ error: "Only owner can delete users" }, { status: 403 });
    }

    if (currentUser.id === params.userId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}