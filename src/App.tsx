import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sparkles, RotateCcw, Trophy, ShieldAlert, Dices } from 'lucide-react';
import type {
  FloatingText,
  GamePhase,
  GridCell,
  HeroUnit,
  Language,
  PersistentStats,
  ProjectileEffect,
  Relic,
  RolledDie,
  TileType,
} from './types/game';
import {
  ENTRANCE_POS,
  getFloorConfig,
  INITIAL_HEROES,
  RELICS,
  TILE_ORDER,
} from './data/gameData';
import { LOCALES } from './data/i18n';
import {
  calculateTileOutput,
  canDieUnlockTile,
  createFloorGrid,
  evaluateBoardSynergies,
  findPartyPath,
  manhattanDistance,
  rollSingleDie,
} from './engine/dungeonEngine';
import { soundEngine } from './audio/soundEngine';
import {
  hapticHeavy,
  hapticLight,
  hapticMedium,
  hapticSuccess,
} from './utils/haptics';
import { PartyStatusBar } from './components/PartyStatusBar';
import { DungeonGrid } from './components/DungeonGrid';
import { BlueprintDeck } from './components/BlueprintDeck';
import { DiceTray3D } from './components/DiceTray3D';
import { RelicDraftModal } from './components/RelicDraftModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import './App.css';

const STATS_STORAGE_KEY = 'dice_architect_persistent_stats_v1';

function loadStats(): PersistentStats {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    highScore: 0,
    bestFloor: 1,
    totalRuns: 0,
    totalBossesDefeated: 0,
    totalTilesPlaced: 0,
  };
}

function saveStats(stats: PersistentStats) {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function App() {
  const [lang, setLang] = useState<Language>('ko');
  const [muted, setMuted] = useState<boolean>(() => soundEngine.isMuted());
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const [stats, setStats] = useState<PersistentStats>(() => loadStats());
  const [floor, setFloor] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('build');
  const [gold, setGold] = useState<number>(60);
  const [mana, setMana] = useState<number>(4);
  const [score, setScore] = useState<number>(0);

  const [maxDiceCount, setMaxDiceCount] = useState<number>(4);
  const [dice, setDice] = useState<RolledDie[]>(() => Array.from({ length: 4 }, (_, idx) => rollSingleDie(`die-init-${idx}`, [])));
  const [selectedDieId, setSelectedDieId] = useState<string | null>("die-init-0");
  const [selectedBlueprint, setSelectedBlueprint] =
    useState<TileType | null>('corridor');
  const [rerollsLeft, setRerollsLeft] = useState<number>(2);
  const [freeManipulationsLeft, setFreeManipulationsLeft] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const [heroes, setHeroes] = useState<HeroUnit[]>(() =>
    INITIAL_HEROES.map((h) => ({ ...h }))
  );
  const [relics, setRelics] = useState<Relic[]>([]);
  const [blueprintLevels, setBlueprintLevels] = useState<
    Record<TileType, number>
  >(() =>
    TILE_ORDER.reduce(
      (acc, k) => ({ ...acc, [k]: 1 }),
      {} as Record<TileType, number>
    )
  );

  const floorConfig = useMemo(() => getFloorConfig(floor), [floor]);
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    createFloorGrid(getFloorConfig(1))
  );
  const [partyPos, setPartyPos] = useState<[number, number]>(ENTRANCE_POS);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileEffect[]>([]);
  const [statusBanner, setStatusBanner] = useState<string>('');

  const ownedRelicIds = useMemo(() => relics.map((r) => r.id), [relics]);

  // Evaluate synergies and path reactively
  const { grid: evaluatedGrid, links: synergyLinks } = useMemo(
    () => evaluateBoardSynergies(grid, ownedRelicIds),
    [grid, ownedRelicIds]
  );

  const partyPath = useMemo(
    () => findPartyPath(evaluatedGrid),
    [evaluatedGrid]
  );

  const speedRef = useRef<1 | 2>(speedMultiplier);
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  const addFloatingText = useCallback(
    (row: number, col: number, text: string, color: string, isCrit = false) => {
      const id = `ft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setFloatingTexts((prev) => [...prev, { id, row, col, text, color, isCrit }]);
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
      }, 1150);
    },
    []
  );

  const spawnProjectile = useCallback(
    (
      fromRow: number,
      fromCol: number,
      toRow: number,
      toCol: number,
      color: string,
      type: ProjectileEffect['type']
    ) => {
      const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setProjectiles((prev) => [
        ...prev,
        { id, fromRow, fromCol, toRow, toCol, color, type },
      ]);
      setTimeout(() => {
        setProjectiles((prev) => prev.filter((p) => p.id !== id));
      }, 420);
    },
    []
  );

  // Roll initial dice for a floor/turn
  const rollFreshDiceSet = useCallback(
    (count: number, currentRelicIds: string[]) => {
      setIsRolling(true);
      soundEngine.playDiceRoll();
      hapticMedium();
      const rolled = Array.from({ length: count }, (_, idx) =>
        rollSingleDie(`die-${idx}-${Date.now()}`, currentRelicIds)
      );
      setDice(rolled);
      setSelectedDieId(rolled[0]?.id ?? null);
      setTimeout(() => setIsRolling(false), 520);
    },
    []
  );

  const selectedDie = useMemo(
    () => dice.find((d) => d.id === selectedDieId && !d.used) || null,
    [dice, selectedDieId]
  );

  const effectiveBlueprint = useMemo<TileType | null>(() => {
    if (!selectedDie) return selectedBlueprint;
    if (
      selectedBlueprint &&
      canDieUnlockTile(selectedDie, selectedBlueprint, ownedRelicIds)
    ) {
      return selectedBlueprint;
    }
    return (
      TILE_ORDER.find((tType) =>
        canDieUnlockTile(selectedDie, tType, ownedRelicIds)
      ) ?? null
    );
  }, [selectedDie, selectedBlueprint, ownedRelicIds]);

  const handleSelectDie = (id: string) => {
    hapticLight();
    setSelectedDieId(id);
  };

  const handleToggleLock = (id: string) => {
    soundEngine.playDiceLock();
    hapticLight();
    setDice((prev) =>
      prev.map((d) => (d.id === id ? { ...d, locked: !d.locked } : d))
    );
  };

  const handleReroll = () => {
    if (rerollsLeft <= 0 || phase !== 'build') return;
    setIsRolling(true);
    soundEngine.playDiceRoll();
    hapticMedium();
    setRerollsLeft((r) => r - 1);

    setDice((prev) => {
      const next = prev.map((d) => {
        if (d.used || d.locked) return d;
        return rollSingleDie(d.id, ownedRelicIds);
      });
      return next;
    });

    setTimeout(() => setIsRolling(false), 520);
  };

  const handleManipulateDie = (mode: 'up' | 'down' | 'flip' | 'star') => {
    if (!selectedDie || phase !== 'build') return;
    const cost =
      freeManipulationsLeft > 0 ? 0 : mode === 'star' ? 2 : 1;
    if (mana < cost) return;

    soundEngine.playDiceManipulate();
    hapticMedium();

    if (freeManipulationsLeft > 0) {
      setFreeManipulationsLeft((f) => f - 1);
    } else {
      setMana((m) => m - cost);
    }

    setDice((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDie.id) return d;
        if (mode === 'up') {
          const nv = Math.min(6, d.value + 1);
          return {
            ...d,
            value: nv,
            special: d.special === 'star' ? 'star' : nv === 6 ? 'gold' : 'normal',
          };
        }
        if (mode === 'down') {
          const nv = Math.max(1, d.value - 1);
          return {
            ...d,
            value: nv,
            special: d.special === 'star' ? 'star' : 'normal',
          };
        }
        if (mode === 'flip') {
          const nv = 7 - d.value;
          return {
            ...d,
            value: nv,
            special: d.special === 'star' ? 'star' : nv === 6 ? 'gold' : 'normal',
          };
        }
        return {
          ...d,
          special: 'star',
        };
      })
    );
  };

  const handleExtraDiceSupply = () => {
    if (phase !== 'build' || gold < 25) return;
    setGold((g) => g - 25);
    setRerollsLeft((r) => r + 1);
    rollFreshDiceSet(maxDiceCount, ownedRelicIds);
  };

  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'build') return;
    const cell = evaluatedGrid[row]?.[col];
    if (!cell) return;
    if (
      cell.feature === 'pillar' ||
      cell.feature === 'boss' ||
      cell.feature === 'entrance'
    ) {
      return;
    }

    if (!selectedDie || !effectiveBlueprint) return;
    if (!canDieUnlockTile(selectedDie, effectiveBlueprint, ownedRelicIds)) {
      return;
    }

    const newLevel =
      cell.placedTile && cell.placedTile.type === effectiveBlueprint
        ? cell.placedTile.level + 1
        : blueprintLevels[effectiveBlueprint] || 1;

    const nextGrid = grid.map((rCells, rIdx) =>
      rCells.map((cCell, cIdx) => {
        if (rIdx !== row || cIdx !== col) return cCell;
        return {
          ...cCell,
          placedTile: {
            type: effectiveBlueprint,
            dieValue: selectedDie.value,
            special: selectedDie.special,
            level: newLevel,
            triggeredCount: 0,
          },
        };
      })
    );

    const { grid: nextEvaluated, links: nextLinks } = evaluateBoardSynergies(
      nextGrid,
      ownedRelicIds
    );
    const hasNewSynergy = nextLinks.length > synergyLinks.length;

    soundEngine.playTilePlace(hasNewSynergy);
    if (hasNewSynergy) {
      hapticSuccess();
      addFloatingText(
        row,
        col,
        lang === 'ko' ? '✨시너지 발동!' : '✨SYNERGY!',
        '#facc15',
        true
      );
    } else {
      hapticLight();
    }

    setGrid(nextGrid);

    const placedMult = nextEvaluated[row][col].synergyMultiplier;
    const outputVal = calculateTileOutput(
      effectiveBlueprint,
      selectedDie.value,
      selectedDie.special,
      newLevel,
      placedMult,
      ownedRelicIds
    );

    if (effectiveBlueprint === 'forge_sanctum') {
      setHeroes((prev) =>
        prev.map((h) => ({
          ...h,
          atk: h.atk + outputVal,
          def: h.def + 3,
        }))
      );
      addFloatingText(
        row,
        col,
        lang === 'ko' ? `⚔️공격력 +${outputVal}` : `⚔️ATK +${outputVal}`,
        '#c084fc',
        true
      );
    } else if (effectiveBlueprint === 'alchemy_lab') {
      setMana((m) => m + 2);
      setRerollsLeft((r) => r + 1);
      setHeroes((prev) =>
        prev.map((h) => ({
          ...h,
          critChance: Math.min(85, h.critChance + outputVal),
        }))
      );
      addFloatingText(
        row,
        col,
        lang === 'ko' ? `+2마나 · 치명+${outputVal}%` : `+2M · CRIT+${outputVal}%`,
        '#818cf8',
        true
      );
    }

    setDice((prev) => {
      const updated = prev.map((d) =>
        d.id === selectedDie.id ? { ...d, used: true } : d
      );
      const nextAvailable = updated.find((d) => !d.used);
      setSelectedDieId(nextAvailable ? nextAvailable.id : null);
      return updated;
    });

    setScore((s) => s + 35 * (hasNewSynergy ? 2 : 1));
    setStats((st) => {
      const updated = { ...st, totalTilesPlaced: st.totalTilesPlaced + 1 };
      saveStats(updated);
      return updated;
    });
  };

  const handleRemoveTile = (
    row: number,
    col: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (phase !== 'build') return;
    hapticLight();
    setGrid((prev) =>
      prev.map((rCells, rIdx) =>
        rCells.map((cCell, cIdx) =>
          rIdx === row && cIdx === col ? { ...cCell, placedTile: null } : cCell
        )
      )
    );
  };

  const waitMs = (ms: number) =>
    new Promise<void>((resolve) =>
      setTimeout(resolve, Math.round(ms / speedRef.current))
    );

  const handleStartMarch = async () => {
    if (phase !== 'build') return;
    setPhase('marching');
    hapticHeavy();

    let workingGrid: GridCell[][] = evaluatedGrid.map((r) =>
      r.map((c) => ({
        ...c,
        placedTile: c.placedTile ? { ...c.placedTile } : null,
        monster: c.monster ? { ...c.monster } : null,
      }))
    );
    let workingHeroes: HeroUnit[] = heroes.map((h) => ({ ...h }));
    let workingGold = gold;
    let workingMana = mana;
    let workingScore = score;

    setStatusBanner(
      lang === 'ko'
        ? '🔥 건축 함정 & 포탑 일제 포격 개시!'
        : '🔥 Dungeon Traps & Turrets Firing!'
    );

    for (let r = 0; r < workingGrid.length; r++) {
      for (let c = 0; c < workingGrid[r].length; c++) {
        const cell = workingGrid[r][c];
        const tile = cell.placedTile;
        if (!tile) continue;

        if (
          tile.type === 'frost_tile' ||
          tile.type === 'spike_trap' ||
          tile.type === 'flame_turret'
        ) {
          const maxRange = tile.type === 'spike_trap' ? 1 : 2;
          const dmg = calculateTileOutput(
            tile.type,
            tile.dieValue,
            tile.special,
            tile.level,
            cell.synergyMultiplier,
            ownedRelicIds
          );

          let firedAny = false;
          for (let mr = 0; mr < workingGrid.length; mr++) {
            for (let mc = 0; mc < workingGrid[mr].length; mc++) {
              const targetMob = workingGrid[mr][mc].monster;
              if (!targetMob || targetMob.hp <= 0) continue;
              const dist = manhattanDistance(r, c, mr, mc);
              if (dist <= maxRange) {
                firedAny = true;
                if (tile.type === 'frost_tile') {
                  targetMob.chilled = true;
                  targetMob.atk = Math.max(
                    8,
                    Math.round(targetMob.atk * 0.75)
                  );
                  spawnProjectile(r, c, mr, mc, '#38bdf8', 'frost');
                  addFloatingText(
                    mr,
                    mc,
                    lang === 'ko' ? '❄️빙결 -25%ATK' : '❄️CHILL',
                    '#38bdf8'
                  );
                } else {
                  const isSynergyCrit = cell.synergyMultiplier >= 1.8;
                  targetMob.hp = Math.max(0, targetMob.hp - dmg);
                  if (tile.type === 'spike_trap') {
                    targetMob.bleeding = true;
                    targetMob.def = Math.max(0, targetMob.def - 2);
                  }
                  spawnProjectile(
                    r,
                    c,
                    mr,
                    mc,
                    tile.type === 'flame_turret' ? '#fb923c' : '#f87171',
                    tile.type === 'flame_turret' ? 'fire' : 'spike'
                  );
                  addFloatingText(
                    mr,
                    mc,
                    isSynergyCrit ? `💥-${dmg}!` : `-${dmg}`,
                    tile.type === 'flame_turret' ? '#fb923c' : '#f87171',
                    isSynergyCrit
                  );

                  if (targetMob.hp <= 0) {
                    workingGold += targetMob.goldReward;
                    workingScore += targetMob.scoreReward;
                    setGold(workingGold);
                    setScore(workingScore);
                  }
                }
              }
            }
          }

          if (firedAny) {
            soundEngine.playTrapFire(
              tile.type === 'frost_tile'
                ? 'frost'
                : tile.type === 'flame_turret'
                ? 'fire'
                : 'spike'
            );
            setGrid(workingGrid.map((row) => [...row]));
            await waitMs(380);
          }
        }
      }
    }

    const route = findPartyPath(workingGrid);
    setStatusBanner(
      lang === 'ko'
        ? '🛡️ 영웅 원정대가 설계된 경로를 따라 진군합니다!'
        : '🛡️ Hero Party advancing along your dungeon route!'
    );

    for (let stepIdx = 0; stepIdx < route.length; stepIdx++) {
      const [r, c] = route[stepIdx];
      setPartyPos([r, c]);
      await waitMs(320);

      const cell = workingGrid[r][c];

      if (cell.feature === 'mana_crystal' && !cell.crystalCollected) {
        cell.crystalCollected = true;
        workingMana += 2;
        workingGold += 25;
        workingScore += 100;
        setMana(workingMana);
        setGold(workingGold);
        setScore(workingScore);
        soundEngine.playGold();
        addFloatingText(r, c, '💎+2M +25G', '#38bdf8', true);
        setGrid(workingGrid.map((row) => [...row]));
        await waitMs(260);
      }

      if (cell.placedTile) {
        const pTile = cell.placedTile;
        const val = calculateTileOutput(
          pTile.type,
          pTile.dieValue,
          pTile.special,
          pTile.level,
          cell.synergyMultiplier,
          ownedRelicIds
        );

        if (pTile.type === 'corridor') {
          workingHeroes = workingHeroes.map((h) =>
            h.hp > 0 ? { ...h, shield: h.shield + val, def: h.def + 1 } : h
          );
          setHeroes([...workingHeroes]);
          addFloatingText(
            r,
            c,
            lang === 'ko' ? `🛡️보호막 +${val}` : `🛡️SHD +${val}`,
            '#94a3b8'
          );
          await waitMs(240);
        } else if (pTile.type === 'healing_shrine') {
          const hasArcaneShield = cell.synergyTags.some((tag) =>
            tag.includes('보호막')
          );
          workingHeroes = workingHeroes.map((h) =>
            h.hp > 0
              ? {
                  ...h,
                  hp: Math.min(h.maxHp, h.hp + val),
                  shield: h.shield + (hasArcaneShield ? 35 : 0),
                }
              : h
          );
          setHeroes([...workingHeroes]);
          soundEngine.playHeal();
          addFloatingText(
            r,
            c,
            hasArcaneShield ? `💚+${val}HP 🛡️+35` : `💚+${val} HP`,
            '#34d399',
            hasArcaneShield
          );
          await waitMs(300);
        } else if (pTile.type === 'gold_vault') {
          workingGold += val;
          workingScore += val * 2;
          setGold(workingGold);
          setScore(workingScore);
          soundEngine.playGold();
          addFloatingText(r, c, `🪙+${val}G!`, '#facc15', true);
          await waitMs(280);
        }
      }

      const engageTargets: Array<[number, number]> = [];
      if (cell.monster && cell.monster.hp > 0) {
        engageTargets.push([r, c]);
      }
      const adjDirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const [dr, dc] of adjDirs) {
        const nr = r + dr;
        const nc = c + dc;
        const adjCell = workingGrid[nr]?.[nc];
        if (
          adjCell &&
          adjCell.feature === 'monster_lair' &&
          adjCell.monster &&
          adjCell.monster.hp > 0
        ) {
          engageTargets.push([nr, nc]);
        }
      }

      for (const [mr, mc] of engageTargets) {
        const mob = workingGrid[mr][mc].monster;
        if (!mob || mob.hp <= 0) continue;

        setStatusBanner(
          lang === 'ko'
            ? `⚔️ ${mob.nameKo}와(과) 교전 중!`
            : `⚔️ Engaging ${mob.nameEn}!`
        );

        let round = 0;
        while (mob.hp > 0 && workingHeroes.some((h) => h.hp > 0) && round < 20) {
          round++;

          if (round === 1) {
            for (let tr = 0; tr < workingGrid.length; tr++) {
              for (let tc = 0; tc < workingGrid[tr].length; tc++) {
                const tCell = workingGrid[tr][tc];
                const tPlaced = tCell.placedTile;
                if (
                  tPlaced &&
                  (tPlaced.type === 'spike_trap' ||
                    tPlaced.type === 'flame_turret')
                ) {
                  const rng = tPlaced.type === 'spike_trap' ? 1 : 2;
                  if (manhattanDistance(tr, tc, mr, mc) <= rng && mob.hp > 0) {
                    const supportDmg = Math.round(
                      calculateTileOutput(
                        tPlaced.type,
                        tPlaced.dieValue,
                        tPlaced.special,
                        tPlaced.level,
                        tCell.synergyMultiplier,
                        ownedRelicIds
                      ) * 0.65
                    );
                    mob.hp = Math.max(0, mob.hp - supportDmg);
                    spawnProjectile(
                      tr,
                      tc,
                      mr,
                      mc,
                      tPlaced.type === 'flame_turret' ? '#fb923c' : '#f87171',
                      tPlaced.type === 'flame_turret' ? 'fire' : 'spike'
                    );
                    addFloatingText(mr, mc, `🔥-${supportDmg}`, '#fb923c');
                  }
                }
              }
            }
          }

          for (const hero of workingHeroes) {
            if (hero.hp <= 0 || mob.hp <= 0) continue;
            const isCrit = Math.random() * 100 < hero.critChance;
            const rawDmg = Math.max(5, hero.atk - mob.def);
            const finalDmg = isCrit ? Math.round(rawDmg * 1.65) : rawDmg;
            mob.hp = Math.max(0, mob.hp - finalDmg);

            soundEngine.playSwordHit(isCrit);
            if (isCrit) hapticMedium();
            addFloatingText(
              mr,
              mc,
              isCrit ? `💥CRIT -${finalDmg}!` : `-${finalDmg}`,
              isCrit ? '#facc15' : '#f87171',
              isCrit
            );
            setGrid(workingGrid.map((row) => [...row]));
            await waitMs(220);
          }

          if (mob.hp > 0) {
            const targetHero = workingHeroes.find((h) => h.hp > 0);
            if (targetHero) {
              const incoming = Math.max(4, mob.atk - targetHero.def);
              const absorbed = Math.min(targetHero.shield, incoming);
              targetHero.shield -= absorbed;
              const hpLoss = incoming - absorbed;
              targetHero.hp = Math.max(0, targetHero.hp - hpLoss);

              setHeroes([...workingHeroes]);
              addFloatingText(
                r,
                c,
                hpLoss > 0 ? `-${hpLoss} HP` : `🛡️막음!`,
                hpLoss > 0 ? '#fb7185' : '#60a5fa'
              );
              await waitMs(230);
            }
          }
        }

        if (!workingHeroes.some((h) => h.hp > 0)) {
          soundEngine.playDefeat();
          setPhase('game_over');
          setStats((st) => {
            const nextSt = {
              ...st,
              highScore: Math.max(st.highScore, workingScore),
              bestFloor: Math.max(st.bestFloor, floor),
              totalRuns: st.totalRuns + 1,
            };
            saveStats(nextSt);
            return nextSt;
          });
          return;
        }

        if (mob.hp <= 0) {
          workingGold += mob.goldReward;
          workingScore += mob.scoreReward;
          setGold(workingGold);
          setScore(workingScore);
          soundEngine.playGold();
          addFloatingText(
            mr,
            mc,
            `+${mob.goldReward}G`,
            '#facc15',
            true
          );

          if (ownedRelicIds.includes('vampiric_mortar')) {
            workingHeroes = workingHeroes.map((h) =>
              h.hp > 0
                ? {
                    ...h,
                    hp: Math.min(h.maxHp, h.hp + 22),
                    shield: h.shield + 12,
                  }
                : h
            );
            setHeroes([...workingHeroes]);
          }
          setGrid(workingGrid.map((row) => [...row]));
          await waitMs(300);
        }
      }
    }

    const bossMob = workingGrid[0][2].monster;
    if (bossMob && bossMob.hp <= 0) {
      soundEngine.playVictory();
      hapticSuccess();
      const updatedStats: PersistentStats = {
        highScore: Math.max(stats.highScore, workingScore),
        bestFloor: Math.max(stats.bestFloor, floor),
        totalRuns: stats.totalRuns,
        totalBossesDefeated: stats.totalBossesDefeated + 1,
        totalTilesPlaced: stats.totalTilesPlaced,
      };
      setStats(updatedStats);
      saveStats(updatedStats);

      if (floor === 5) {
        setPhase('victory');
      } else {
        setPhase('floor_clear');
      }
    } else {
      setPhase('build');
      setRerollsLeft(2 + (ownedRelicIds.includes('arcane_hourglass') ? 1 : 0));
      rollFreshDiceSet(maxDiceCount, ownedRelicIds);
    }
  };

  const relicChoices = useMemo(() => {
    const unowned = RELICS.filter((r) => !ownedRelicIds.includes(r.id));
    const pool = unowned.length >= 3 ? unowned : RELICS;
    return pool.slice(0, 3);
  }, [ownedRelicIds]);

  const handleDraftRelic = (relic: Relic) => {
    soundEngine.playHeal();
    hapticSuccess();
    if (!ownedRelicIds.includes(relic.id)) {
      setRelics((prev) => [...prev, relic]);
    }
    if (relic.id === 'warlord_anvil') {
      setHeroes((prev) => prev.map((h) => ({ ...h, atk: h.atk + 6 })));
    }
  };

  const handleBuyExtraDie = () => {
    if (gold < 95 || maxDiceCount >= 6) return;
    soundEngine.playGold();
    hapticMedium();
    setGold((g) => g - 95);
    setMaxDiceCount((c) => Math.min(6, c + 1));
  };

  const handleBuyPartyHeal = () => {
    if (gold < 55) return;
    soundEngine.playHeal();
    hapticMedium();
    setGold((g) => g - 55);
    setHeroes((prev) =>
      prev.map((h) => ({
        ...h,
        maxHp: h.maxHp + 20,
        hp: h.maxHp + 20,
        shield: 15,
      }))
    );
  };

  const handleBuyBlueprintUpgrade = () => {
    if (gold < 75) return;
    soundEngine.playTilePlace(true);
    hapticMedium();
    setGold((g) => g - 75);
    setBlueprintLevels((prev) => {
      const next = { ...prev };
      for (const k of TILE_ORDER) {
        next[k] = (next[k] || 1) + 1;
      }
      return next;
    });
  };

  const handleProceedNextFloor = () => {
    const nextFloorNum = floor + 1;
    const nextCfg = getFloorConfig(nextFloorNum);
    const currentRelics = relics.map((r) => r.id);

    setFloor(nextFloorNum);
    setGrid(createFloorGrid(nextCfg));
    setPartyPos(ENTRANCE_POS);
    setPhase('build');

    setHeroes((prev) =>
      prev.map((h) => ({
        ...h,
        hp:
          h.hp > 0
            ? Math.min(h.maxHp, h.hp + Math.round(h.maxHp * 0.35))
            : Math.round(h.maxHp * 0.5),
        shield: 15,
      }))
    );

    const bonusGold = currentRelics.includes('golden_compass') ? 45 : 20;
    const bonusMana = currentRelics.includes('arcane_hourglass') ? 3 : 2;
    setGold((g) => g + bonusGold);
    setMana((m) => m + bonusMana);
    setRerollsLeft(2 + (currentRelics.includes('arcane_hourglass') ? 1 : 0));
    setFreeManipulationsLeft(currentRelics.includes('fate_crown') ? 2 : 0);
    setStatusBanner('');

    rollFreshDiceSet(maxDiceCount, currentRelics);
  };

  const handleStartNewRun = () => {
    const cfg1 = getFloorConfig(1);
    setFloor(1);
    setPhase('build');
    setGold(60);
    setMana(4);
    setScore(0);
    setMaxDiceCount(4);
    setRelics([]);
    setHeroes(INITIAL_HEROES.map((h) => ({ ...h })));
    setBlueprintLevels(
      TILE_ORDER.reduce(
        (acc, k) => ({ ...acc, [k]: 1 }),
        {} as Record<TileType, number>
      )
    );
    setGrid(createFloorGrid(cfg1));
    setPartyPos(ENTRANCE_POS);
    setRerollsLeft(2);
    setFreeManipulationsLeft(0);
    setStatusBanner('');
    rollFreshDiceSet(4, []);
  };

  const t = LOCALES[lang];
  const unusedDiceCount = dice.filter((d) => !d.used).length;

  return (
    <div className="ios-app-shell">
      <div className="mobile-stage-frame">
        <PartyStatusBar
          floor={floor}
          floorName={lang === 'ko' ? floorConfig.nameKo : floorConfig.nameEn}
          gold={gold}
          mana={mana}
          score={score}
          bestScore={stats.highScore}
          heroes={heroes}
          relics={relics}
          speedMultiplier={speedMultiplier}
          muted={muted}
          lang={lang}
          onToggleSpeed={() =>
            setSpeedMultiplier((s) => (s === 1 ? 2 : 1))
          }
          onToggleMute={() => setMuted(soundEngine.toggleMute())}
          onToggleLang={() => setLang((l) => (l === 'ko' ? 'en' : 'ko'))}
          onOpenGuide={() => setShowGuide(true)}
        />

        <div className="architect-context-banner">
          {phase === 'marching' ? (
            <span className="banner-marching">{statusBanner}</span>
          ) : (
            <div className="banner-build-row">
              <span>
                {synergyLinks.length > 0 ? (
                  <strong className="synergy-count-pill">
                    <Sparkles size={12} /> {t.synergyActive}{' '}
                    {synergyLinks.length}
                  </strong>
                ) : lang === 'ko' ? (
                  floorConfig.subtitleKo
                ) : (
                  floorConfig.subtitleEn
                )}
              </span>

              {unusedDiceCount === 0 && gold >= 25 && (
                <button
                  type="button"
                  className="extra-dice-supply-btn"
                  onClick={handleExtraDiceSupply}
                >
                  <Dices size={12} />
                  <span>
                    {lang === 'ko' ? '추가 주사위 (25G)' : '+Roll Dice (25G)'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        <main className="main-dungeon-area">
          <DungeonGrid
            grid={evaluatedGrid}
            path={partyPath}
            synergyLinks={synergyLinks}
            partyPos={partyPos}
            isMarching={phase !== 'build'}
            canPlaceNow={phase === 'build' && selectedDie !== null}
            selectedBlueprint={effectiveBlueprint}
            ownedRelicIds={ownedRelicIds}
            floatingTexts={floatingTexts}
            projectiles={projectiles}
            lang={lang}
            onCellClick={handleCellClick}
            onRemoveTile={handleRemoveTile}
          />
        </main>

        <BlueprintDeck
          selectedDie={selectedDie}
          selectedBlueprint={effectiveBlueprint}
          blueprintLevels={blueprintLevels}
          ownedRelicIds={ownedRelicIds}
          disabled={phase !== 'build'}
          lang={lang}
          onSelectBlueprint={(bpType) => {
            hapticLight();
            setSelectedBlueprint(bpType);
          }}
        />

        <DiceTray3D
          dice={dice}
          selectedDieId={selectedDieId}
          rerollsLeft={rerollsLeft}
          mana={mana}
          freeManipulationsLeft={freeManipulationsLeft}
          isRolling={isRolling}
          disabled={phase !== 'build'}
          lang={lang}
          onSelectDie={handleSelectDie}
          onToggleLock={handleToggleLock}
          onReroll={handleReroll}
          onManipulateDie={handleManipulateDie}
          onStartMarch={handleStartMarch}
        />

        {phase === 'floor_clear' && (
          <RelicDraftModal
            floorCleared={floor}
            relicChoices={relicChoices}
            gold={gold}
            maxDiceCount={maxDiceCount}
            lang={lang}
            onDraftRelic={handleDraftRelic}
            onBuyExtraDie={handleBuyExtraDie}
            onBuyPartyHeal={handleBuyPartyHeal}
            onBuyBlueprintUpgrade={handleBuyBlueprintUpgrade}
            onProceedNextFloor={handleProceedNextFloor}
          />
        )}

        {phase === 'victory' && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card outcome-modal-card victory-card">
              <Trophy size={44} className="outcome-trophy-icon" />
              <h2>{t.victoryTitle}</h2>
              <p>{t.victoryDesc}</p>
              <div className="outcome-stats-box">
                <div>
                  <span>{t.score}</span>
                  <strong>{score.toLocaleString()}</strong>
                </div>
                <div>
                  <span>{t.bestScore}</span>
                  <strong>
                    {Math.max(score, stats.highScore).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span>{lang === 'ko' ? '정복한 층' : 'Floor Cleared'}</span>
                  <strong>{floor}F</strong>
                </div>
              </div>

              <div className="outcome-buttons-stack">
                <button
                  type="button"
                  className="modal-primary-cta"
                  onClick={() => setPhase('floor_clear')}
                >
                  <Sparkles size={16} />
                  <span>{t.continueEndless}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-cta"
                  onClick={handleStartNewRun}
                >
                  <RotateCcw size={15} />
                  <span>{t.newRun}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'game_over' && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card outcome-modal-card defeat-card">
              <ShieldAlert size={44} className="outcome-defeat-icon" />
              <h2>{t.defeatTitle}</h2>
              <p>{t.defeatDesc}</p>
              <div className="outcome-stats-box">
                <div>
                  <span>{t.score}</span>
                  <strong>{score.toLocaleString()}</strong>
                </div>
                <div>
                  <span>{t.bestScore}</span>
                  <strong>
                    {Math.max(score, stats.highScore).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span>{lang === 'ko' ? '도달한 층' : 'Reached Floor'}</span>
                  <strong>{floor}F</strong>
                </div>
              </div>

              <button
                type="button"
                className="modal-primary-cta"
                onClick={handleStartNewRun}
              >
                <RotateCcw size={16} />
                <span>{t.newRun}</span>
              </button>
            </div>
          </div>
        )}

        {showGuide && (
          <HowToPlayModal lang={lang} onClose={() => setShowGuide(false)} />
        )}
      </div>
    </div>
  );
}

export default App;
