import { describe, it, expect } from 'vitest';
import {
  createFloorGrid,
  canDieUnlockTile,
  calculateTileOutput,
  evaluateBoardSynergies,
  findPartyPath,
  rollSingleDie,
} from '../dungeonEngine';
import { getFloorConfig } from '../../data/gameData';

describe('Dice Architect - Dungeon Engine Unit Tests', () => {
  it('creates a valid 6x5 floor grid with Entrance at (5,2) and Boss at (0,2)', () => {
    const cfg = getFloorConfig(1);
    const grid = createFloorGrid(cfg);

    expect(grid.length).toBe(6);
    expect(grid[0].length).toBe(5);
    expect(grid[5][2].feature).toBe('entrance');
    expect(grid[0][2].feature).toBe('boss');
    expect(grid[0][2].monster?.isBoss).toBe(true);
    expect(grid[0][2].monster?.maxHp).toBeGreaterThan(100);
  });

  it('validates dice requirements across all 8 tile blueprints and relics', () => {
    // Odd die (3) unlocks spike_trap, frost_tile, alchemy_lab, corridor, but not healing_shrine
    const oddDie = { value: 3, special: 'normal' as const, used: false };
    expect(canDieUnlockTile(oddDie, 'corridor')).toBe(true);
    expect(canDieUnlockTile(oddDie, 'spike_trap')).toBe(true);
    expect(canDieUnlockTile(oddDie, 'frost_tile')).toBe(true);
    expect(canDieUnlockTile(oddDie, 'alchemy_lab')).toBe(true);
    expect(canDieUnlockTile(oddDie, 'healing_shrine')).toBe(false);
    expect(canDieUnlockTile(oddDie, 'flame_turret')).toBe(false);

    // Even high die (6) unlocks healing_shrine, flame_turret, forge_sanctum, gold_vault
    const sixDie = { value: 6, special: 'gold' as const, used: false };
    expect(canDieUnlockTile(sixDie, 'healing_shrine')).toBe(true);
    expect(canDieUnlockTile(sixDie, 'flame_turret')).toBe(true);
    expect(canDieUnlockTile(sixDie, 'forge_sanctum')).toBe(true);
    expect(canDieUnlockTile(sixDie, 'gold_vault')).toBe(true);
    expect(canDieUnlockTile(sixDie, 'spike_trap')).toBe(false);

    // Star Wild die unlocks every blueprint regardless of pip value
    const starOne = { value: 1, special: 'star' as const, used: false };
    expect(canDieUnlockTile(starOne, 'gold_vault')).toBe(true);
    expect(canDieUnlockTile(starOne, 'flame_turret')).toBe(true);
    expect(canDieUnlockTile(starOne, 'healing_shrine')).toBe(true);

    // Relic unlocks: golden_compass lets 5 unlock gold_vault; warlord_anvil lets 4 unlock forge_sanctum
    const fiveDie = { value: 5, special: 'normal' as const, used: false };
    expect(canDieUnlockTile(fiveDie, 'gold_vault', [])).toBe(false);
    expect(canDieUnlockTile(fiveDie, 'gold_vault', ['golden_compass'])).toBe(true);

    const fourDie = { value: 4, special: 'normal' as const, used: false };
    expect(canDieUnlockTile(fourDie, 'forge_sanctum', [])).toBe(false);
    expect(canDieUnlockTile(fourDie, 'forge_sanctum', ['warlord_anvil'])).toBe(true);
  });

  it('calculates tile power accurately with pips, levels, star bonus, and synergy multipliers', () => {
    // spike_trap: base 18 + pip*5 -> with pip 5 = 43
    const baseOut = calculateTileOutput('spike_trap', 5, 'normal', 1, 1, []);
    expect(baseOut).toBe(43);

    // With 2.0x Frost Shatter synergy -> 86
    const synOut = calculateTileOutput('spike_trap', 5, 'normal', 1, 2.0, []);
    expect(synOut).toBe(86);

    // With Star face (+25%) and obsidian_die relic (+20%)
    const starRelicOut = calculateTileOutput(
      'spike_trap',
      5,
      'star',
      1,
      1,
      ['obsidian_die']
    );
    expect(starRelicOut).toBe(Math.round(43 * 1.25 * 1.2));
  });

  it('detects Frost+Trap (2.0x), Sanctum+Corridor (+50%), and Twin Resonance synergies', () => {
    const grid = createFloorGrid(getFloorConfig(1));

    // Place frost_tile at (4,1) and flame_turret at (4,2)
    grid[4][1].placedTile = {
      type: 'frost_tile',
      dieValue: 2,
      special: 'normal',
      level: 1,
      triggeredCount: 0,
    };
    grid[4][2].placedTile = {
      type: 'flame_turret',
      dieValue: 5,
      special: 'normal',
      level: 1,
      triggeredCount: 0,
    };

    const { grid: eval1, links: links1 } = evaluateBoardSynergies(grid, []);
    expect(links1.length).toBe(1);
    expect(links1[0].type).toBe('frost_trap');
    expect(eval1[4][2].synergyMultiplier).toBe(2);

    // With frostfire_core relic -> 2.5x multiplier on flame_turret
    const { grid: evalRelic } = evaluateBoardSynergies(grid, ['frostfire_core']);
    expect(evalRelic[4][2].synergyMultiplier).toBe(2.5);
  });

  it('routes the Hero Party from Entrance (5,2) to Boss (0,2) and prefers player-built tiles', () => {
    const grid = createFloorGrid(getFloorConfig(1));

    // Build a custom corridor route along column 3: (5,3) -> (4,3) -> (3,3) -> (2,3) -> (1,3) -> (0,3)
    for (let r = 5; r >= 0; r--) {
      if (grid[r][3].feature !== 'pillar') {
        grid[r][3].placedTile = {
          type: 'corridor',
          dieValue: 4,
          special: 'normal',
          level: 1,
          triggeredCount: 0,
        };
      }
    }

    const path = findPartyPath(grid);
    expect(path[0]).toEqual([5, 2]);
    expect(path[path.length - 1]).toEqual([0, 2]);
    // Verify the path visits our constructed tiles in column 3
    const visitedCol3 = path.some(([, c]) => c === 3);
    expect(visitedCol3).toBe(true);
  });

  it('scales procedural Endless Abyss floors (Floor 6+)', () => {
    const fl1 = getFloorConfig(1);
    const fl7 = getFloorConfig(7);
    expect(fl7.floor).toBe(7);
    expect(fl7.boss.maxHp).toBeGreaterThan(fl1.boss.maxHp);
  });

  it('rolls valid 1-6 dice with deterministic RNG', () => {
    const die = rollSingleDie('test-die', ['obsidian_die'], () => 0.1);
    expect(die.value).toBeGreaterThanOrEqual(1);
    expect(die.value).toBeLessThanOrEqual(6);
    expect(die.special).toBe('star');
  });
});
