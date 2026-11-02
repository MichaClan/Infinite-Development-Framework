"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const score = Number(params.get("score") ?? 0);
  const wave = Number(params.get("wave") ?? 0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session && !saved) {
      fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, wavesReached: wave }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.error);
          else setSaved(true);
        });
    }
  }, [session]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-6">
      <h1 className="text-4xl font-bold">Game Over</h1>
      <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4 w-80">
        <p className="text-gray-400">Final Score</p>
        <p className="text-5xl font-bold text-yellow-400">{score}</p>
        <p className="text-gray-400">Waves Survived: <span className="text-white font-bold">{wave}</span></p>
        {!session && (
          <p className="text-sm text-red-400">Log in to save your score!</p>
        )}
        {saved && <p className="text-sm text-green-400">✅ Score saved!</p>}
        {error && <p className="text-sm text-red-400">❌ {error}</p>}
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/game")}
          className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
        >
          Play Again
        </button>
        <button
          onClick={() => router.push("/leaderboard")}
          className="bg-gray-700 px-6 py-2 rounded hover:bg-gray-600"
        >
          Leaderboard
        </button>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}