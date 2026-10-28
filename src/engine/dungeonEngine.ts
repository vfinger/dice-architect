import {
  BOSS_POS,
  ENTRANCE_POS,
  GRID_COLS,
  GRID_ROWS,
  TILE_BLUEPRINTS,
} from '../data/gameData';
import type {
  FloorConfig,
  GridCell,
  RolledDie,
  SynergyLink,
  TileType,
} from '../types/game';

export function createFloorGrid(config: FloorConfig): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({
        row: r,
        col: c,
        feature: 'empty',
        placedTile: null,
        monster: null,
        synergyMultiplier: 1,
        synergyTags: [],
      });
    }
    grid.push(row);
  }

  // Entrance & Boss
  const [er, ec] = ENTRANCE_POS;
  grid[er][ec].feature = 'entrance';

  const [br, bc] = BOSS_POS;
  grid[br][bc].feature = 'boss';
  grid[br][bc].monster = {
    ...config.boss,
    id: `boss-fl-${config.floor}`,
    hp: config.boss.maxHp,
  };

  // Pillars
  for (const [pr, pc] of config.pillars) {
    if (grid[pr]?.[pc] && grid[pr][pc].feature === 'empty') {
      grid[pr][pc].feature = 'pillar';
    }
  }

  // Mana Crystals
  for (const [cr, cc] of config.crystals) {
    if (grid[cr]?.[cc] && grid[cr][cc].feature === 'empty') {
      grid[cr][cc].feature = 'mana_crystal';
    }
  }

  // Monsters
  config.monsters.forEach((m, idx) => {
    if (grid[m.row]?.[m.col] && grid[m.row][m.col].feature === 'empty') {
      grid[m.row][m.col].feature = 'monster_lair';
      grid[m.row][m.col].monster = {
        ...m.unit,
        id: `mob-fl-${config.floor}-${idx}`,
        hp: m.unit.maxHp,
      };
    }
  });

  return grid;
}

export function rollSingleDie(
  id: string,
  ownedRelicIds: string[],
  rng: () => number = Math.random
): RolledDie {
  const value = Math.floor(rng() * 6) + 1;
  const starChance = ownedRelicIds.includes('obsidian_die') ? 0.35 : 0.12;
  const isStar = rng() < starChance;

  return {
    id,
    value,
    locked: false,
    used: false,
    special: isStar ? 'star' : value === 6 ? 'gold' : 'normal',
    rollSeed: Math.floor(rng() * 100000),
  };
}

export function canDieUnlockTile(
  die: Pick<RolledDie, 'value' | 'special' | 'used'>,
  tileType: TileType,
  ownedRelicIds: string[] = []
): boolean {
  if (die.used) return false;
  // Star / Wild die unlocks every blueprint
  if (die.special === 'star') return true;

  const bp = TILE_BLUEPRINTS[tileType];
  const v = die.value;

  switch (bp.reqType) {
    case 'any':
      return v >= 1 && v <= 6;
    case 'odd':
      return v % 2 === 1;
    case 'even':
      return v % 2 === 0;
    case 'high_4plus':
      return v >= 4;
    case 'low_3minus':
      return v <= 3;
    case 'mid_345':
      return v >= 3 && v <= 5;
    case 'high_5plus':
      return ownedRelicIds.includes('warlord_anvil') ? v >= 4 : v >= 5;
    case 'six_or_star':
      return ownedRelicIds.includes('golden_compass') ? v >= 5 : v === 6;
    default:
      return false;
  }
}

export function calculateTileOutput(
  tileType: TileType,
  dieValue: number,
  special: RolledDie['special'],
  level: number,
  synergyMultiplier: number = 1,
  ownedRelicIds: string[] = []
): number {
  const bp = TILE_BLUEPRINTS[tileType];
  const raw = bp.baseValue + dieValue * bp.pipMultiplier;
  const starMultiplier = special === 'star' ? 1.25 : 1.0;
  const levelMultiplier = 1 + (level - 1) * 0.25;
  const relicMultiplier = ownedRelicIds.includes('obsidian_die') ? 1.2 : 1.0;

  return Math.round(
    raw * starMultiplier * levelMultiplier * relicMultiplier * synergyMultiplier
  );
}

export function evaluateBoardSynergies(
  inputGrid: GridCell[][],
  ownedRelicIds: string[] = []
): { grid: GridCell[][]; links: SynergyLink[] } {
  const grid: GridCell[][] = inputGrid.map((row) =>
    row.map((cell) => ({
      ...cell,
      synergyMultiplier: 1,
      synergyTags: [],
    }))
  );

  const links: SynergyLink[] = [];
  const frostBonus = ownedRelicIds.includes('frostfire_core') ? 1.5 : 1.0; // +1.0 => 2.0x, +1.5 => 2.5x
  const twinBonus = ownedRelicIds.includes('twin_blueprint') ? 0.65 : 0.35;

  const dirs = [
    [0, 1],
    [1, 0],
  ];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const a = grid[r][c];
      if (!a.placedTile) continue;

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= GRID_ROWS || nc >= GRID_COLS) continue;
        const b = grid[nr][nc];
        if (!b.placedTile) continue;

        const tA = a.placedTile.type;
        const tB = b.placedTile.type;

        // 1. Frost + Trap / Turret
        const isFrostTrap =
          (tA === 'frost_tile' &&
            (tB === 'spike_trap' || tB === 'flame_turret')) ||
          (tB === 'frost_tile' &&
            (tA === 'spike_trap' || tA === 'flame_turret'));

        if (isFrostTrap) {
          if (tA === 'frost_tile') {
            a.synergyMultiplier = Math.max(a.synergyMultiplier, 1.3);
            b.synergyMultiplier += frostBonus;
            b.synergyTags.push('빙결 파쇄 2x');
          } else {
            b.synergyMultiplier = Math.max(b.synergyMultiplier, 1.3);
            a.synergyMultiplier += frostBonus;
            a.synergyTags.push('빙결 파쇄 2x');
          }
          links.push({
            fromRow: r,
            fromCol: c,
            toRow: nr,
            toCol: nc,
            type: 'frost_trap',
            labelKo: '빙결 파쇄 2.0x',
            labelEn: 'Frost Shatter 2.0x',
            color: '#38bdf8',
          });
          continue;
        }

        // 2. Forge Sanctum + Corridor
        const isSanctumCorridor =
          (tA === 'forge_sanctum' && tB === 'corridor') ||
          (tB === 'forge_sanctum' && tA === 'corridor');

        if (isSanctumCorridor) {
          a.synergyMultiplier += 0.5;
          b.synergyMultiplier += 0.5;
          a.synergyTags.push('전술 보급 +50%');
          b.synergyTags.push('전술 보급 +50%');
          links.push({
            fromRow: r,
            fromCol: c,
            toRow: nr,
            toCol: nc,
            type: 'sanctum_corridor',
            labelKo: '전술 보급 +50%',
            labelEn: 'Tactical Supply +50%',
            color: '#c084fc',
          });
          continue;
        }

        // 3. Alchemy Lab + Healing Shrine
        const isAlchemyShrine =
          (tA === 'alchemy_lab' && tB === 'healing_shrine') ||
          (tB === 'alchemy_lab' && tA === 'healing_shrine');

        if (isAlchemyShrine) {
          a.synergyMultiplier += 0.4;
          b.synergyMultiplier += 0.4;
          a.synergyTags.push('비전 보호막 +35');
          b.synergyTags.push('비전 보호막 +35');
          links.push({
            fromRow: r,
            fromCol: c,
            toRow: nr,
            toCol: nc,
            type: 'alchemy_shrine',
            labelKo: '비전 성소 보호막',
            labelEn: 'Arcane Shield',
            color: '#34d399',
          });
          continue;
        }

        // 4. Gold Vault + Forge Sanctum
        const isVaultSanctum =
          (tA === 'gold_vault' && tB === 'forge_sanctum') ||
          (tB === 'gold_vault' && tA === 'forge_sanctum');

        if (isVaultSanctum) {
          a.synergyMultiplier += 0.5;
          b.synergyMultiplier += 0.5;
          a.synergyTags.push('황금 무장 +50%');
          b.synergyTags.push('황금 무장 +50%');
          links.push({
            fromRow: r,
            fromCol: c,
            toRow: nr,
            toCol: nc,
            type: 'vault_sanctum',
            labelKo: '황금 무장 +50%',
            labelEn: 'Golden Arms +50%',
            color: '#facc15',
          });
          continue;
        }

        // 5. Twin Resonance (identical tile types)
        if (tA === tB) {
          a.synergyMultiplier += twinBonus;
          b.synergyMultiplier += twinBonus;
          a.synergyTags.push('동종 공명');
          b.synergyTags.push('동종 공명');
          links.push({
            fromRow: r,
            fromCol: c,
            toRow: nr,
            toCol: nc,
            type: 'twin_resonance',
            labelKo: `공명 +${Math.round(twinBonus * 100)}%`,
            labelEn: `Resonance +${Math.round(twinBonus * 100)}%`,
            color: '#f472b6',
          });
        }
      }
    }
  }

  // Round multipliers cleanly
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      grid[r][c].synergyMultiplier =
        Math.round(grid[r][c].synergyMultiplier * 100) / 100;
    }
  }

  return { grid, links };
}

/**
 * Finds the hero party's path from Entrance (5,2) to Boss (0,2).
 * Uses weighted shortest-path (Dijkstra) that strongly favors player-built tiles
 * and Mana Crystals while avoiding Pillars.
 */
export function findPartyPath(grid: GridCell[][]): Array<[number, number]> {
  const [sr, sc] = ENTRANCE_POS;
  const [tr, tc] = BOSS_POS;

  const dist: number[][] = Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill(Infinity)
  );
  const prev: Array<Array<[number, number] | null>> = Array.from(
    { length: GRID_ROWS },
    () => Array(GRID_COLS).fill(null)
  );
  const visited: boolean[][] = Array.from({ length: GRID_ROWS }, () =>
    Array(GRID_COLS).fill(false)
  );

  dist[sr][sc] = 0;

  const dirs = [
    [-1, 0], // Prefer moving North toward Boss first on ties
    [0, -1],
    [0, 1],
    [1, 0],
  ];

  for (let step = 0; step < GRID_ROWS * GRID_COLS; step++) {
    let uRow = -1;
    let uCol = -1;
    let best = Infinity;

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (!visited[r][c] && dist[r][c] < best) {
          best = dist[r][c];
          uRow = r;
          uCol = c;
        }
      }
    }

    if (uRow === -1 || (uRow === tr && uCol === tc)) break;
    visited[uRow][uCol] = true;

    for (const [dr, dc] of dirs) {
      const nr = uRow + dr;
      const nc = uCol + dc;
      if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) continue;
      if (visited[nr][nc]) continue;

      const cell = grid[nr][nc];
      if (cell.feature === 'pillar') continue;

      // Weight calculation:
      // Player-placed tiles have very low traversal cost (1.0) so heroes actively follow the player's road!
      // Mana crystals have low cost (1.8).
      // Plain empty unbuilt tiles have higher cost (4.2) so heroes detour onto adjacent built tiles.
      let weight = 4.2;
      if (cell.placedTile) {
        weight = 1.0;
      } else if (cell.feature === 'mana_crystal' && !cell.crystalCollected) {
        weight = 1.8;
      } else if (cell.feature === 'boss') {
        weight = 1.0;
      } else if (cell.feature === 'monster_lair' && cell.monster && cell.monster.hp > 0) {
        weight = 3.2;
      }

      const cand = dist[uRow][uCol] + weight;
      if (cand < dist[nr][nc]) {
        dist[nr][nc] = cand;
        prev[nr][nc] = [uRow, uCol];
      }
    }
  }

  const path: Array<[number, number]> = [];
  let curr: [number, number] | null = [tr, tc];
  while (curr) {
    path.push(curr);
    const [cr, cc]: [number, number] = curr;
    if (cr === sr && cc === sc) break;
    curr = prev[cr][cc];
  }
  path.reverse();

  // Fallback straight line if somehow blocked
  if (path.length === 0 || path[0][0] !== sr || path[0][1] !== sc) {
    return [
      [5, 2],
      [4, 2],
      [3, 2],
      [2, 2],
      [1, 2],
      [0, 2],
    ];
  }

  return path;
}

export function manhattanDistance(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}
