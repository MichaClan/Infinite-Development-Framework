// tile size, grid and tower definition
import { TowerType, EnemyData } from "./types";

export const TILE = 56;
export const COLS = 10;
export const ROWS = 10;

export const PATH: [number, number][] = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0],
  [9, 1], [9, 2], [9, 3],
  [8, 3], [7, 3], [6, 3], [5, 3], [4, 3], [3, 3], [2, 3], [1, 3], [0, 3],
  [0, 4], [0, 5], [0, 6],
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6],
  [9, 7], [9, 8], [9, 9],
];

export const PATH_SET = new Set(PATH.map(([c, r]) => `${c},${r}`));

export const TOWER_TYPES: TowerType[] = [
  { name: "Basic",  cost: 50,  damage: 20,  range: 2,   fireRate: 700,  color: 0x3498db },
  { name: "Sniper", cost: 100, damage: 80,  range: 5,   fireRate: 1500, color: 0x9b59b6 },
  { name: "Rapid",  cost: 75,  damage: 10,  range: 2,   fireRate: 200,  color: 0xe67e22 },
  { name: "Bomb",   cost: 125, damage: 45,  range: 3,   fireRate: 1000, color: 0xe74c3c, splash: 90 },
];

export const ENEMY_PER_WAVE = (wave: number): EnemyData => ({
  hp: 60 + wave * 30,
  speed: 70 + wave * 7,
  reward: 5 + wave,
});

export const INITIAL_STATE = {
  gold: 100,
  lives: 10,
  wave: 0,
  score: 0,
};

