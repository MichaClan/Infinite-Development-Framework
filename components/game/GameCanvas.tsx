"use client";
import { useEffect, useRef } from "react";
import { TowerType } from "./types";

interface Props {
  onStateChange: (gold: number, lives: number, wave: number) => void;
  onGameOver: (score: number) => void;
  onTowerClick: (key: string, stats: any) => void;
  selectedTower: TowerType;
  sceneRef: React.MutableRefObject<any>;
}

export default function GameCanvas({ onStateChange, onGameOver, onTowerClick, selectedTower, sceneRef }: Props) {
  const gameRef = useRef<HTMLDivElement>(null);

  // initialize phaser game on mount
  useEffect(() => {
    let game: import("phaser").Game;

    const init = async () => {
      const Phaser = (await import("phaser")).default;
      const { GameScene } = await import("./scenes/GameScene");
      const scene = new GameScene();
      // connect game events to parent component callbacks
      scene.onStateChange = onStateChange;
      scene.onGameOver = onGameOver;
      scene.onTowerClick = onTowerClick;
      sceneRef.current = scene;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 560,
        height: 560,
        backgroundColor: "#1a1a2e",
        parent: gameRef.current!,
        scene: scene,
      });
    };

    init();
    return () => game?.destroy(true);
  }, []);

  // update selected tower when changed
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.selectedTower = selectedTower;
    }
  }, [selectedTower]);

  return <div ref={gameRef} />;
}