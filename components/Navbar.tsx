"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <Link href="/">
        <h1 className="font-bold text-lg cursor-pointer">A TDG</h1>
      </Link>
      <div className="flex gap-4 items-center">
        <Link href="/">Home</Link>
        <Link href="/game">Game</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        {/* show profile and logout if logged in, otherwise show login amd signup */}
        {session ? (
          <>
            <Link href="/profile">Profile</Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

