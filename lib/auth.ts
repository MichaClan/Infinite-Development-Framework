import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function requireRole(role: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // owner overrides everything
  if (session.user.role === "owner") return session;

  // admin can access admin pages
  if (session.user.role === "admin" && role === "admin") return session;

  //  role match required for other roles
  if (session.user.role !== role) {
    redirect("/");
  }

  return session;
}