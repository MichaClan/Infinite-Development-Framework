"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import GameCanvas from "@/components/game/GameCanvas";
import { TOWER_TYPES } from "@/components/game/constants";
import { TowerType } from "@/components/game/types";
import { useSession } from "next-auth/react";


export default function GamePage() {
  const router = useRouter();
  const [gold, setGold] = useState(100);
  const [lives, setLives] = useState(10);
  const [wave, setWave] = useState(0);
  const [selectedTower, setSelectedTower] = useState<TowerType>(TOWER_TYPES[0]);
  const [gameSceneRef, setGameSceneRef] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [authPromptDone, setAuthPromptDone] = useState(false);
  const { data: session } = useSession();
  const sceneRef = useRef<any>(null);

  const [activeTower, setActiveTower] = useState<{
    key: string;
    damage: number;
    range: number;
    fireRate: number;
    cost: number;
    color: number;
    priority: string;
    splash?: number;
  } | null>(null);

  function handleStateChange(g: number, l: number, w: number) {
    setGold(g);
    setLives(l);
    setWave(w);
  }

  function handleGameOver(score: number) {
    const stats = {
      score,
      wave: sceneRef.current?.wave ?? 0,
      enemiesKilled: sceneRef.current?.enemiesKilled ?? 0,
      towersPlaced: sceneRef.current?.towersPlaced ?? 0,
      goldEarned: sceneRef.current?.goldEarned ?? 0,
    };
    
    router.push(`/result?${new URLSearchParams(stats).toString()}`);
  }

  // Step 1: auth prompt
  if (!authPromptDone) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-8">
        <h1 className="text-5xl font-bold">A TDG</h1>
        {session ? (
          // Already logged in, skip this screen
          <>{setAuthPromptDone(true)}</>
        ) : (
          <>
            <p className="text-gray-400 text-lg">Do you want to log in first?</p>
            <p className="text-gray-500 text-sm">Your score won't be saved if you play as guest</p>
            <div className="flex flex-col gap-3 w-64">
              <button
                onClick={() => router.push("/login")}
                className="bg-blue-600 px-6 py-4 rounded-lg text-xl font-bold hover:bg-blue-700 transition"
              >
                Log In
              </button>
              <button
                onClick={() => setAuthPromptDone(true)}
                className="bg-gray-700 px-6 py-4 rounded-lg text-xl font-bold hover:bg-gray-600 transition"
              >
                Play as Guest
              </button>
            </div>
          </>
        )}
      </main>
    );
  }

  // Step 2: game mode selection
if (!gameStarted) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-6">
      <h1 className="text-4xl font-bold">A Tower Defense Game</h1>
      <p className="text-gray-400 text-base">Tower Defense by IDF</p>

      <div className="flex flex-col gap-2 w-56">
        <button
          onClick={() => setGameStarted(true)}
          className="bg-blue-600 px-5 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Infinite Mode
        </button>

        <button
          disabled
          className="bg-gray-700 px-5 py-3 rounded-lg text-lg font-semibold opacity-50 cursor-not-allowed"
        >
          Story Mode (soon)
        </button>
      </div>

      <p className="text-gray-500 text-xs">
        Place towers → Start Wave → Survive
      </p>
    </main>
  );
}

  // Step 3: main game 
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <div className="flex gap-2">
          <span className="bg-yellow-500 text-black px-3 py-1 rounded font-bold text-sm">
            💰 {gold}g
          </span>
          <span className="bg-red-500 px-3 py-1 rounded font-bold text-sm">
            🖤 {lives}
          </span>
        </div>
        <span className="bg-purple-600 px-4 py-1 rounded font-bold text-sm">
          Wave {wave}
        </span>
        <button
          onClick={() => sceneRef.current?.startWave()}
          className="bg-green-600 px-4 py-1 rounded font-bold text-sm hover:bg-green-700"
        >
          Start Wave ▶
        </button>
      </div>

      {/* Main game area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <div className="w-32 bg-gray-800 flex flex-col gap-2 p-2 overflow-y-auto">
          <p className="text-xs text-gray-400 text-center">Tower List</p>
          {TOWER_TYPES.map((tower) => (
            <button
              key={tower.name}
              onClick={() => setSelectedTower(tower)}
              className={`rounded p-2 flex flex-col items-center transition ${selectedTower.name === tower.name
                ? "bg-blue-700 ring-2 ring-blue-400"
                : "bg-gray-700 hover:bg-gray-600"
                }`}
            >
              <div
                className="w-8 h-8 rounded-full mb-1"
                style={{ backgroundColor: `#${tower.color.toString(16).padStart(6, "0")}` }}
              />
              <p className="text-xs">{tower.name}</p>
              <p className="text-xs text-yellow-400">{tower.cost}g</p>
            </button>
          ))}
        </div>

        {/* Game canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-950">
          <GameCanvas
            onStateChange={handleStateChange}
            onGameOver={handleGameOver}
            onTowerClick={(key, stats) => setActiveTower({ key, ...stats })}
            selectedTower={selectedTower}
            sceneRef={sceneRef}
          />
        </div>

        {/* Right sidebar */}
        <div className="w-48 bg-gray-800 flex flex-col items-center p-3 gap-2 overflow-y-auto">
          {activeTower ? (
            <>
              <p className="text-xs text-gray-400 font-bold"> Tower Selected</p>
              <div
                className="w-12 h-12 rounded-full border-2 border-yellow-400"
                style={{ backgroundColor: `#${activeTower.color.toString(16).padStart(6, "0")}` }}
              />
              <div className="text-xs text-gray-300 w-full flex flex-col gap-1">
                <p> DMG: {Math.round(activeTower.damage)}</p>
                <p> Range: {activeTower.range.toFixed(1)}</p>
                <p> Rate: {activeTower.fireRate}ms</p>
                {activeTower.splash && <p> Splash: {activeTower.splash}px</p>}
              </div>

              <div className="w-full bg-gray-700 rounded p-2 text-xs">
                <p className="text-yellow-400 font-bold mb-1">⬆ Upgrade Preview</p>
                <p className="text-green-400">DMG: {Math.round(activeTower.damage)} → {Math.round(activeTower.damage * 1.5)}</p>
                <p className="text-green-400">Range: {activeTower.range.toFixed(1)} → {(activeTower.range * 1.2).toFixed(1)}</p>
                <p className="text-red-400">Cost: {Math.floor(activeTower.damage * 5)}g</p>
              </div>

              <div className="w-full">
                <p className="text-xs text-gray-400 mb-1"> Priority</p>
                <div className="grid grid-cols-2 gap-1">
                  {(["first", "last", "strongest", "weakest"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        sceneRef.current?.setPriority(p);
                        setActiveTower(prev => prev ? { ...prev, priority: p } : null);
                      }}
                      className={`text-xs py-1 rounded capitalize ${activeTower.priority === p
                        ? "bg-blue-600"
                        : "bg-gray-600 hover:bg-gray-500"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => sceneRef.current?.upgradeTower()}
                className="bg-blue-600 w-full py-1 rounded text-sm hover:bg-blue-700"
              >
                ⬆ Upgrade
              </button>
              <button
                onClick={() => {
                  sceneRef.current?.sellTower();
                  setActiveTower(null);
                }}
                className="bg-red-600 w-full py-1 rounded text-sm hover:bg-red-700"
              >
                Sell
              </button>
              <button
                onClick={() => {
                  sceneRef.current?.deselectTower();
                  setActiveTower(null);
                }}
                className="bg-gray-600 w-full py-1 rounded text-sm hover:bg-gray-500"
              >
                ✖ Deselect
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400">Select a tower to place</p>
              <div
                className="w-12 h-12 rounded-full"
                style={{ backgroundColor: `#${selectedTower.color.toString(16).padStart(6, "0")}` }}
              />
              <p className="font-bold text-sm">{selectedTower.name}</p>
              <div className="text-xs text-gray-300 w-full flex flex-col gap-1">
                <p> Damage: {selectedTower.damage}</p>
                <p> Range: {selectedTower.range}</p>
                <p> Rate: {selectedTower.fireRate}ms</p>
                <p> Cost: {selectedTower.cost}g</p>
                {selectedTower.splash && <p> Splash: {selectedTower.splash}px</p>}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Click a placed tower to manage it</p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}