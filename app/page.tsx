"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-4">
        A Tower Defence Game by IDF (Infinite Development Framework)
      </h1>
      <p className="mb-6 text-center max-w-md">
        A Tower Defense game where you defend against waves of enemies.
        Create an account, play, and climb the leaderboard.
      </p>
      <Link href="/game">
        <button className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Play Game
        </button>
      </Link>

      <div className="mt-4 flex flex-col items-center gap-4">
        {session ? (
          <>
            <p className="text-gray-400 text-center max-w-md">
              Welcome back,{" "}
              <span className="text-white font-bold">
                {session.user?.name}
              </span>
              !
              <br />

              {session.user.role === "owner" && (
                <span className="text-purple-400">
                  You have full system control. You can manage admins, moderators, and all users.
                </span>
              )}

              {session.user.role === "admin" && (
                <span className="text-red-400">
                  You have admin permissions. You can manage users, scores, and achievements.
                </span>
              )}

              {session.user.role === "moderator" && (
                <span className="text-yellow-400">
                  You can moderate the platform by reviewing and removing inappropriate scores.
                </span>
              )}

              {session.user.role === "player" && (
                <span className="text-blue-400">
                  You can play the game, track your progress, and climb the leaderboard.
                </span>
              )}

              {session.user.role === "guest" && (
                <span className="text-green-400">
                  You're browsing as a guest. Create an account to save progress and compete.
                </span>
              )}
            </p>

            {/* Role based buttons */}
            <div className="flex gap-4 flex-wrap justify-center">
              {session.user.role === "admin" && (
                <Link href="/admin/users">
                  <button className="bg-red-600 px-4 py-2 rounded">
                    Admin Panel
                  </button>
                </Link>
              )}

              {session.user.role === "moderator" && (
                <Link href="/moderator">
                  <button className="bg-yellow-600 px-4 py-2 rounded">
                    Moderator Panel
                  </button>
                </Link>
              )}

              {session.user.role === "player" && (
                <Link href="/player">
                  <button className="bg-blue-600 px-4 py-2 rounded">
                    Player Dashboard
                  </button>
                </Link>
              )}

              {session.user.role === "guest" && (
                <Link href="/guest">
                  <button className="bg-green-600 px-4 py-2 rounded">
                    Guest Page
                  </button>
                </Link>
              )}

              {session.user.role === "owner" && (
                <Link href="/owner">
                  <button className="bg-purple-600 px-4 py-2 rounded">
                    Owner Dashboard
                  </button>
                </Link>
              )}

              <Link href="/profile">
                <button className="bg-gray-700 px-4 py-2 rounded">
                  Profile
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link href="/login">
              <button className="bg-gray-700 px-4 py-2 rounded">Login</button>
            </Link>
            <Link href="/signup">
              <button className="bg-gray-700 px-4 py-2 rounded">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}