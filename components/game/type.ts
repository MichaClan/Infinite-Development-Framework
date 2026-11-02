// tower stats interface
export interface TowerType {
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  color: number;
}

// enemy stats interface
export interface EnemyData {
  hp: number;
  speed: number;
  reward: number;
}

export interface GameState {
  gold: number;
  lives: number;
  wave: number;
  score: number;
}

export type TargetPriority = "first" | "last" | "strongest" | "weakest";

// tower with optional splash damage
export interface TowerType {
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  color: number;
  splash?: number; // splash damage for bomber tower 
}

