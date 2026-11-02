import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import OwnerClient from "./OwnerClient";

export default async function OwnerPage() {
  await requireRole("owner");

  const session = await getServerSession(authOptions);
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="p-10 text-white bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Owner Dashboard</h1>

      {/* Quick Access to Other Dashboards */}
<div className="bg-gray-800 rounded-lg p-6 mb-8">
  <h2 className="text-lg font-semibold mb-4 text-gray-200">Quick Access</h2>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    <Link href="/admin">
      <button className="w-full bg-gray-700 px-4 py-2 rounded text-sm text-gray-200 active:scale-[0.98] transition">
        Admin Dashboard
      </button>
    </Link>

    <Link href="/moderator">
      <button className="w-full bg-gray-700 px-4 py-2 rounded text-sm text-gray-200 active:scale-[0.98] transition">
        Moderator Panel
      </button>
    </Link>

    <Link href="/player">
      <button className="w-full bg-gray-700 px-4 py-2 rounded text-sm text-gray-200 active:scale-[0.98] transition">
        Player Dashboard
      </button>
    </Link>

    <Link href="/leaderboard">
      <button className="w-full bg-gray-700 px-4 py-2 rounded text-sm text-gray-200 active:scale-[0.98] transition">
        Leaderboard
      </button>
    </Link>

    <Link href="/game">
      <button className="w-full bg-gray-700 px-4 py-2 rounded text-sm text-gray-200 active:scale-[0.98] transition">
        Play Game
      </button>
    </Link>

    <Link href="/profile">
      <button className="w-full bg-gray-700 px-4 py-2 rounded text-sm text-gray-200 active:scale-[0.98] transition">
        Profile
      </button>
    </Link>
  </div>
</div>

      {/* User Management - Client Component */}
      <OwnerClient initialUsers={users} initialRoles={roles} />
    </main>
  );
}