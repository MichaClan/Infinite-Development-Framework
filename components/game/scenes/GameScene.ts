import * as Phaser from "phaser";
import {
  TILE, COLS, ROWS, PATH, PATH_SET,
  TOWER_TYPES, ENEMY_PER_WAVE, INITIAL_STATE
} from "../constants";
import { TowerType, TargetPriority } from "../types";


export class GameScene extends Phaser.Scene {
  // State
  gold = INITIAL_STATE.gold;
  lives = INITIAL_STATE.lives;
  wave = INITIAL_STATE.wave;
  score = INITIAL_STATE.score;
  MAX_WAVES = 999;
  bossSpawned = false;

  // Selected tower type
  selectedTower: TowerType = TOWER_TYPES[0];

  // Tracking
  placedTowers: Map<string, Phaser.GameObjects.Arc> = new Map();
  enemies: Phaser.GameObjects.Arc[] = [];
  enemyHp: Map<Phaser.GameObjects.Arc, number> = new Map();
  enemyPathIndex: Map<Phaser.GameObjects.Arc, number> = new Map();
  towerRanges: Map<string, number> = new Map();
  towerDamage: Map<string, number> = new Map();
  towerFireRate: Map<string, number> = new Map();
  towerLastFired: Map<string, number> = new Map();
  towerPriority: Map<string, TargetPriority> = new Map();
  towerSplash: Map<string, number> = new Map();
  towerCost: Map<string, number> = new Map();
  rangeCircle?: Phaser.GameObjects.Arc;
  rangeCircleSelected?: Phaser.GameObjects.Arc;
  selectedTileKey?: string;
  activeTowerKey?: string;
  enemiesKilled = 0;
  towersPlaced = 0;
  goldEarned = 0;
  wavesSurvived = 0;
  perfectWave = true; // no lives lost this wave

  // Callbacks to React
  onStateChange?: (gold: number, lives: number, wave: number) => void;
  onGameOver?: (score: number) => void;
  onTowerClick?: (key: string, stats: any) => void;

  waveActive = false;
  spawnTimer = 0;
  enemiesToSpawn = 0;
  spawnInterval = 1000;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    this.drawGrid();
    this.drawLabels();
  }

  drawGrid() {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const key = `${col},${row}`;
        const isPath = PATH_SET.has(key);
        const cx = col * TILE + TILE / 2;
        const cy = row * TILE + TILE / 2;

        const tile = this.add
          .rectangle(cx, cy, TILE - 2, TILE - 2, isPath ? 0x8B6914 : 0x2d4a2d)
          .setInteractive();

        if (!isPath) {
          tile.on("pointerover", () => {
            if (!this.placedTowers.has(key)) {
              tile.setFillStyle(0x4a7a4a);
              this.showRange(cx, cy, this.selectedTower.range * TILE);
            }
          });
          tile.on("pointerout", () => {
            if (!this.placedTowers.has(key)) {
              tile.setFillStyle(0x2d4a2d);
              this.hideRange();
            }
          });
          tile.on("pointerdown", () => this.tryPlaceTower(key, col, row, cx, cy));
        }
      }
    }
  }



  tryPlaceTower(key: string, col: number, row: number, cx: number, cy: number) {
    if (this.placedTowers.has(key)) return;
    if (this.gold < this.selectedTower.cost) {
      this.cameras.main.flash(200, 255, 0, 0, false);
      return;
    }

    this.gold -= this.selectedTower.cost;
    this.score += 10;
    this.updateUI();

    const tower = this.add.circle(cx, cy, TILE / 2 - 8, this.selectedTower.color)
      .setInteractive();

    // Click placed tower to select it
    tower.on("pointerdown", () => this.selectTower(key, cx, cy));

    this.placedTowers.set(key, tower);
    this.towerRanges.set(key, this.selectedTower.range * TILE);
    this.towerDamage.set(key, this.selectedTower.damage);
    this.towerFireRate.set(key, this.selectedTower.fireRate);
    this.towerLastFired.set(key, 0);
    this.towerPriority.set(key, "first");
    if (this.selectedTower.splash) {
      this.towerSplash.set(key, this.selectedTower.splash);
    }
    this.towersPlaced++;
  }

  drawLabels() {
    this.add.text(2, 2, "Start", {
      fontSize: "11px", color: "#fff", backgroundColor: "#e74c3c",
    }).setPadding(3, 2);
    this.add.text(COLS * TILE - 34, ROWS * TILE - 18, "End", {
      fontSize: "11px", color: "#fff", backgroundColor: "#e74c3c",
    }).setPadding(3, 2);
  }

  updateUI() {
    this.onStateChange?.(this.gold, this.lives, this.wave);
  }

  showRange(cx: number, cy: number, range: number) {
    this.rangeCircle?.destroy();
    this.rangeCircle = this.add.circle(cx, cy, range, 0xffffff, 0.08)
      .setStrokeStyle(1, 0xffffff, 0.4);
  }

  hideRange() {
    this.rangeCircle?.destroy();
    this.rangeCircle = undefined;
  }

  selectTower(key: string, cx: number, cy: number) {
    this.rangeCircleSelected?.destroy();
    this.activeTowerKey = key;

    const range = this.towerRanges.get(key)!;
    this.rangeCircleSelected = this.add.circle(cx, cy, range, 0xffffff, 0.08)
      .setStrokeStyle(1, 0xffff00, 0.8);

    this.onTowerClick?.(key, {
      damage: this.towerDamage.get(key)!,
      range: this.towerRanges.get(key)! / TILE,
      fireRate: this.towerFireRate.get(key)!,
      cost: this.towerCost.get(key)!,
      color: this.placedTowers.get(key)!.fillColor,
      priority: this.towerPriority.get(key) ?? "first",
      splash: this.towerSplash.get(key),
    });
  }

  deselectTower() {
    this.rangeCircleSelected?.destroy();
    this.rangeCircleSelected = undefined;
    this.activeTowerKey = undefined;
  }

  setPriority(priority: TargetPriority) {
    if (!this.activeTowerKey) return;
    this.towerPriority.set(this.activeTowerKey, priority);
  }

  upgradeTower() {
    if (!this.activeTowerKey) return;
    const key = this.activeTowerKey;
    const upgradeCost = Math.floor((this.towerDamage.get(key) ?? 10) * 8);

    if (this.gold < upgradeCost) {
      this.cameras.main.flash(200, 255, 0, 0, false);
      return;
    }

    this.gold -= upgradeCost;
    this.towerDamage.set(key, (this.towerDamage.get(key) ?? 10) * 1.3);  // was 1.5
    this.towerRanges.set(key, (this.towerRanges.get(key) ?? 100) * 1.1); // was 1.2
    this.towerFireRate.set(key, Math.max(100, (this.towerFireRate.get(key) ?? 1000) * 0.85)); // was 0.8

    const tower = this.placedTowers.get(key)!;
    this.selectTower(key, tower.x, tower.y);
    this.updateUI();
  }

  sellTower() {
    if (!this.activeTowerKey) return;
    const key = this.activeTowerKey;
    const tower = this.placedTowers.get(key);
    if (!tower) return;

    const refund = Math.floor((this.towerCost.get(key) ?? 50) * 0.5);
    this.gold += refund;
    tower.destroy();
    this.placedTowers.delete(key);
    this.towerRanges.delete(key);
    this.towerDamage.delete(key);
    this.towerFireRate.delete(key);
    this.towerLastFired.delete(key);
    this.towerPriority.delete(key);
    this.towerSplash.delete(key);
    this.towerCost.delete(key);
    this.deselectTower();
    this.updateUI();
  }

  startWave() {
    if (this.waveActive) return;
    if (this.wave >= this.MAX_WAVES) return;

    this.perfectWave = true;
    this.wave++;
    this.waveActive = true;
    this.spawnTimer = 0;
    this.enemiesToSpawn = 5 + this.wave * 3;
    this.spawnInterval = Math.max(200, 700 - this.wave * 35);
    this.updateUI();
  }

  spawnEnemy() {
    const [startCol, startRow] = PATH[0];
    const cx = startCol * TILE + TILE / 2;
    const cy = startRow * TILE + TILE / 2;
    const isBoss = this.wave === this.MAX_WAVES && this.enemiesToSpawn === 0;
    const enemyData = ENEMY_PER_WAVE(this.wave);

    const hp = isBoss ? enemyData.hp * 10 : enemyData.hp;
    const color = isBoss ? 0xff0000 : 0xe74c3c;
    const size = isBoss ? TILE / 2 - 4 : TILE / 2 - 12;

    const enemy = this.add.circle(cx, cy, size, color);

    if (isBoss) {
      // Boss label
      this.add.text(cx - 16, cy - 6, "BOSS", {
        fontSize: "10px", color: "#fff", fontStyle: "bold"
      });
    }

    this.enemies.push(enemy);
    this.enemyHp.set(enemy, hp);
    this.enemyPathIndex.set(enemy, 0);
  }

  update(time: number, delta: number) {
    if (this.waveActive && this.enemiesToSpawn > 0) {
      this.spawnTimer += delta;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnEnemy();
        this.enemiesToSpawn--;
        this.spawnTimer = 0;
      }
    }

    // spawn boss on wave 15 
    if (this.wave === this.MAX_WAVES && this.enemiesToSpawn === 0 && !this.bossSpawned) {
      this.bossSpawned = true;
      this.spawnEnemy();
    }

    if (this.waveActive && this.enemiesToSpawn === 0 && this.enemies.length === 0) {
      this.waveActive = false;
      this.bossSpawned = false;
      this.gold += 10 + this.wave * 4;
      if (this.wave >= this.MAX_WAVES) {
        return;
      }
      this.updateUI();
    }

    this.moveEnemies(delta);
    this.towerShoot(time);
  }

  moveEnemies(delta: number) {
    const speed = ENEMY_PER_WAVE(this.wave).speed;
    const toRemove: Phaser.GameObjects.Arc[] = [];

    for (const enemy of this.enemies) {
      const pathIndex = this.enemyPathIndex.get(enemy) ?? 0;
      if (pathIndex >= PATH.length) {
        // Reached the end
        this.perfectWave = false;
        this.lives--;
        this.score = Math.max(0, this.score - 50);
        this.updateUI();
        enemy.destroy();
        toRemove.push(enemy);

        if (this.lives <= 0) {
          this.onGameOver?.(this.score);
        }
        continue;
      }

      const [targetCol, targetRow] = PATH[pathIndex];
      const targetX = targetCol * TILE + TILE / 2;
      const targetY = targetRow * TILE + TILE / 2;
      const dx = targetX - enemy.x;
      const dy = targetY - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const moveAmount = (speed * delta) / 1000;

      if (dist < moveAmount) {
        enemy.setPosition(targetX, targetY);
        this.enemyPathIndex.set(enemy, pathIndex + 1);
      } else {
        enemy.x += (dx / dist) * moveAmount;
        enemy.y += (dy / dist) * moveAmount;
      }
    }

    this.enemies = this.enemies.filter(e => !toRemove.includes(e));
    this.enemyHp = new Map([...this.enemyHp].filter(([k]) => !toRemove.includes(k)));
    this.enemyPathIndex = new Map([...this.enemyPathIndex].filter(([k]) => !toRemove.includes(k)));
  }

  towerShoot(time: number) {
    for (const [key, tower] of this.placedTowers) {
      const range = this.towerRanges.get(key)!;
      const damage = this.towerDamage.get(key)!;
      const fireRate = this.towerFireRate.get(key)!;
      const lastFired = this.towerLastFired.get(key) ?? 0;
      const priority = this.towerPriority.get(key) ?? "first";
      const splash = this.towerSplash.get(key);

      if (time - lastFired < fireRate) continue;

      // Get enemies in range
      const inRange = this.enemies.filter(e => {
        const dx = e.x - tower.x;
        const dy = e.y - tower.y;
        return Math.sqrt(dx * dx + dy * dy) <= range;
      });

      if (inRange.length === 0) continue;

      // Apply priority
      let target: Phaser.GameObjects.Arc;
      if (priority === "first") {
        target = inRange.reduce((a, b) =>
          (this.enemyPathIndex.get(a) ?? 0) > (this.enemyPathIndex.get(b) ?? 0) ? a : b);
      } else if (priority === "last") {
        target = inRange.reduce((a, b) =>
          (this.enemyPathIndex.get(a) ?? 0) < (this.enemyPathIndex.get(b) ?? 0) ? a : b);
      } else if (priority === "strongest") {
        target = inRange.reduce((a, b) =>
          (this.enemyHp.get(a) ?? 0) > (this.enemyHp.get(b) ?? 0) ? a : b);
      } else {
        target = inRange.reduce((a, b) =>
          (this.enemyHp.get(a) ?? 0) < (this.enemyHp.get(b) ?? 0) ? a : b);
      }

      this.towerLastFired.set(key, time);

      // Bullet visual
      const bullet = this.add.circle(tower.x, tower.y, 4, 0xffff00);
      this.tweens.add({
        targets: bullet,
        x: target.x,
        y: target.y,
        duration: 100,
        onComplete: () => {
          bullet.destroy();

          // Splash damage
          if (splash) {
            for (const e of [...this.enemies]) {
              const dx = e.x - target.x;
              const dy = e.y - target.y;
              if (Math.sqrt(dx * dx + dy * dy) <= splash) {
                this.damageEnemy(e, damage);
              }
            }
          } else {
            this.damageEnemy(target, damage);
          }
        },
      });
    }
  }

  damageEnemy(enemy: Phaser.GameObjects.Arc, damage: number) {
    if (!this.enemies.includes(enemy)) return;
    const hp = (this.enemyHp.get(enemy) ?? 0) - damage;
    if (hp <= 0) {
      this.enemiesKilled++;
      this.gold += ENEMY_PER_WAVE(this.wave).reward;
      this.score += 100;
      this.updateUI();
      this.enemies = this.enemies.filter(e => e !== enemy);
      this.enemyHp.delete(enemy);
      this.enemyPathIndex.delete(enemy);
      enemy.destroy();
    } else {
      this.enemyHp.set(enemy, hp);
    }
  }
}