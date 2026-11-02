"use client";
import { useEffect, useState } from "react";

interface ScoreEntry {
  id: string;
  score: number;
  wavesReached: number;
  playedAt: string;
  user: { username: string };
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scores")
      .then(res => res.json())
      .then(data => {
        setScores(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex flex-col items-center p-10 min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-2"> Leaderboard</h1>
      <p className="text-gray-400 mb-8">Top 10 players</p>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : scores.length === 0 ? (
        <p className="text-gray-400">No scores yet. Be the first!</p>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-2">
          {scores.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-6 py-4 rounded-lg ${
index === 0 ? "bg-gray-700" :
index === 1 ? "bg-gray-750" :
index === 2 ? "bg-gray-800" :
                "bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold w-8">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </span>
                <span className="font-bold text-lg">{entry.user.username}</span>
              </div>
              <div className="flex gap-6 text-sm">
                <span className="text-yellow-300 font-bold text-xl">{entry.score}</span>
                <span className="text-gray-300">Wave {entry.wavesReached}</span>
                <span className="text-gray-400">
                  {new Date(entry.playedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}