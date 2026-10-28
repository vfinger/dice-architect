export type Language = 'ko' | 'en';

export type DieFaceSpecial = 'normal' | 'star' | 'gold' | 'frost';

export interface RolledDie {
  id: string;
  value: number; // 1 to 6
  locked: boolean;
  used: boolean;
  special: DieFaceSpecial;
  rollSeed: number; // Triggers 3D tumble animation
}

export type TileType =
  | 'corridor'
  | 'spike_trap'
  | 'flame_turret'
  | 'healing_shrine'
  | 'forge_sanctum'
  | 'gold_vault'
  | 'frost_tile'
  | 'alchemy_lab';

export type DiceRequirementType =
  | 'any'          // 1..6
  | 'odd'          // 1, 3, 5
  | 'even'         // 2, 4, 6
  | 'high_4plus'   // 4, 5, 6
  | 'low_3minus'   // 1, 2, 3
  | 'mid_345'      // 3, 4, 5
  | 'high_5plus'   // 5, 6
  | 'six_or_star'; // 6 or star face (or >=5 with relic)

export interface TileBlueprint {
  type: TileType;
  reqType: DiceRequirementType;
  baseValue: number;
  pipMultiplier: number;
  range: number; // 0 = on-step, 1 = orthogonal/adjacent, 2 = range 2
  color: string;
  accentColor: string;
  iconName: string;
  category: 'path' | 'trap' | 'support' | 'economy';
}

export type CellFeatureType =
  | 'empty'
  | 'entrance'
  | 'boss'
  | 'monster_lair'
  | 'pillar'
  | 'mana_crystal';

export interface MonsterUnit {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  goldReward: number;
  scoreReward: number;
  isBoss?: boolean;
  chilled?: boolean;
  bleeding?: boolean;
}

export interface PlacedTile {
  type: TileType;
  dieValue: number;
  special: DieFaceSpecial;
  level: number;
  triggeredCount: number;
}

export interface GridCell {
  row: number;
  col: number;
  feature: CellFeatureType;
  placedTile: PlacedTile | null;
  monster: MonsterUnit | null;
  crystalCollected?: boolean;
  synergyMultiplier: number;
  synergyTags: string[];
}

export interface SynergyLink {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  type: 'frost_trap' | 'sanctum_corridor' | 'alchemy_shrine' | 'vault_sanctum' | 'twin_resonance';
  labelKo: string;
  labelEn: string;
  color: string;
}

export interface HeroUnit {
  id: 'warrior' | 'archer' | 'mage';
  nameKo: string;
  nameEn: string;
  titleKo: string;
  titleEn: string;
  maxHp: number;
  hp: number;
  shield: number;
  atk: number;
  def: number;
  critChance: number; // 0..100
  color: string;
}

export interface Relic {
  id: string;
  nameKo: string;
  nameEn: string;
  descKo: string;
  descEn: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface FloatingText {
  id: string;
  row: number;
  col: number;
  text: string;
  color: string;
  isCrit?: boolean;
}

export interface ProjectileEffect {
  id: string;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  color: string;
  type: 'fire' | 'spike' | 'frost' | 'heal' | 'buff';
}

export type GamePhase =
  | 'build'       // Rolling dice & placing dungeon tiles
  | 'marching'    // Party auto-advances, triggers tiles & fights monsters/boss
  | 'floor_clear' // Relic draft & upgrade shop between floors
  | 'victory'     // Cleared Floor 5 (can continue to Endless)
  | 'game_over';  // Party wiped out

export interface FloorConfig {
  floor: number;
  nameKo: string;
  nameEn: string;
  subtitleKo: string;
  subtitleEn: string;
  themeColor: string;
  boss: Omit<MonsterUnit, 'id' | 'hp'>;
  monsters: Array<{
    row: number;
    col: number;
    unit: Omit<MonsterUnit, 'id' | 'hp'>;
  }>;
  pillars: Array<[number, number]>;
  crystals: Array<[number, number]>;
}

export interface PersistentStats {
  highScore: number;
  bestFloor: number;
  totalRuns: number;
  totalBossesDefeated: number;
  totalTilesPlaced: number;
}
