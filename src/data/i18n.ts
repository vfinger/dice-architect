import type { Language, TileType } from '../types/game';

export interface TileLocaleInfo {
  name: string;
  reqBadge: string;
  shortDesc: string;
  detailDesc: string;
  synergyTip: string;
}

export interface LocaleStrings {
  gameTitle: string;
  gameSubtitle: string;
  floor: string;
  gold: string;
  mana: string;
  score: string;
  bestScore: string;
  buildPhase: string;
  marchingPhase: string;
  rerollDice: string;
  rerollsLeft: string;
  startMarch: string;
  speed: string;
  lockHint: string;
  selectDieHint: string;
  tapGridHint: string;
  nudgeUp: string;
  nudgeDown: string;
  flipDie: string;
  starEmpower: string;
  synergyActive: string;
  pathPreview: string;
  bossRoom: string;
  entrance: string;
  monsterLair: string;
  manaCrystal: string;
  pillar: string;
  removeTile: string;
  upgradeTile: string;
  howToPlay: string;
  synergyGuide: string;
  newRun: string;
  continueEndless: string;
  floorCleared: string;
  chooseRelic: string;
  architectShop: string;
  nextFloor: string;
  victoryTitle: string;
  victoryDesc: string;
  defeatTitle: string;
  defeatDesc: string;
  partyStatus: string;
  relicsOwned: string;
  noRelics: string;
  tiles: Record<TileType, TileLocaleInfo>;
}

export const LOCALES: Record<Language, LocaleStrings> = {
  ko: {
    gameTitle: '주사위 던전 건축가',
    gameSubtitle: 'DICE ARCHITECT : ROGUELIKE DUNGEON',
    floor: '층',
    gold: '골드',
    mana: '마나',
    score: '점수',
    bestScore: '최고 기록',
    buildPhase: '건축 페이즈',
    marchingPhase: '영웅 행군 & 전투',
    rerollDice: '주사위 리롤',
    rerollsLeft: '남은 리롤',
    startMarch: '던전 행군 개시!',
    speed: '배속',
    lockHint: '주사위 아래 자물쇠로 고정 후 리롤 가능',
    selectDieHint: '1. 아래 주사위를 선택하세요',
    tapGridHint: '2. 타일 도면을 고르고 던전 격자에 배치하세요',
    nudgeUp: '눈금 +1 (1마나)',
    nudgeDown: '눈금 -1 (1마나)',
    flipDie: '뒤집기 7-X (1마나)',
    starEmpower: '★황금각성 (2마나)',
    synergyActive: '인접 시너지 발동',
    pathPreview: '예상 행군 경로',
    bossRoom: '층간 보스 방',
    entrance: '던전 입구',
    monsterLair: '몬스터 소굴',
    manaCrystal: '마나 수정 (+2마나/+25G)',
    pillar: '고대 석주 (이동 불가)',
    removeTile: '철거',
    upgradeTile: '강화',
    howToPlay: '가이드 & 시너지',
    synergyGuide: '타일 시너지 도감',
    newRun: '새 원정 시작',
    continueEndless: '무한 심연 (6층+) 도전',
    floorCleared: '층 정복 완료!',
    chooseRelic: '고대 유물 1종 선택',
    architectShop: '건축가의 정비소',
    nextFloor: '다음 층으로 진군',
    victoryTitle: '태고의 주사위 성전 정복!',
    victoryDesc: '당신의 정교한 던전 설계로 영웅 파티가 운명의 주사위 군주를 물리쳤습니다!',
    defeatTitle: '원정대 전멸',
    defeatDesc: '영웅 파티가 던전의 시련을 넘지 못했습니다. 타일 시너지를 재설계해 다시 도전하세요!',
    partyStatus: '영웅 원정대 (자동 전진)',
    relicsOwned: '보유 유물',
    noRelics: '보유한 유물이 없습니다',
    tiles: {
      corridor: {
        name: '전술 돌복도',
        reqBadge: '아무 눈금 (1~6)',
        shortDesc: '안전 통로 · 방어막 부여',
        detailDesc: '영웅 이동 경로를 연결하며 통과 시 원정대 전체에 보호막 +(10 + 눈금×3) 및 방어력 +2를 부여합니다.',
        synergyTip: '전쟁 성소 인접 시 성소 공격력 버프 +50% 증폭',
      },
      spike_trap: {
        name: '강철 가시 함정',
        reqBadge: '홀수 (1, 3, 5)',
        shortDesc: '주변 몬스터 관통 출혈 피해',
        detailDesc: '해당 칸 및 상하좌우 인접 몬스터에게 (18 + 눈금×5) 물리 피해를 입히고 출혈(방어력 감소)을 부여합니다.',
        synergyTip: '빙결 룬 인접 시 파쇄 효과로 함정 피해량 2.0배!',
      },
      flame_turret: {
        name: '화염 포탑',
        reqBadge: '4 이상 (4, 5, 6)',
        shortDesc: '사거리 2 화염 포격',
        detailDesc: '사거리 2칸 이내의 모든 몬스터와 보스에게 행군 개시 및 경유 시 (22 + 눈금×6) 화염 폭발 피해를 가합니다.',
        synergyTip: '빙결 룬 인접 시 융해 폭발로 포탑 피해량 2.0배!',
      },
      healing_shrine: {
        name: '치유의 성소',
        reqBadge: '짝수 (2, 4, 6)',
        shortDesc: '파티 전체 생명력 회복',
        detailDesc: '원정대가 경유하거나 인접 통과할 때 모든 영웅의 체력을 (24 + 눈금×6) 회복하고 약화를 정화합니다.',
        synergyTip: '연금술 실험실 인접 시 초과 치유 보호막 +35 추가!',
      },
      forge_sanctum: {
        name: '전쟁 대장간 성소',
        reqBadge: '5 이상 (5, 6)',
        shortDesc: '영웅 공격력·방어력 영구 강화',
        detailDesc: '이번 층 동안 모든 영웅의 공격력을 +(5 + 눈금×2), 방어력을 +3 상승시킵니다.',
        synergyTip: '전술 돌복도 또는 황금 금고 인접 시 버프 1.5배 증폭!',
      },
      gold_vault: {
        name: '황금 보물 금고',
        reqBadge: '눈금 6 또는 ★',
        shortDesc: '대량 골드 채굴 · 잭팟',
        detailDesc: '원정대가 경유 시 즉시 (30 + 눈금×9) 골드를 획득합니다. ★황금 주사위 사용 시 1.5배 보너스!',
        synergyTip: '전쟁 성소 인접 시 보유 골드에 비례해 파티 추가 공격력 부여!',
      },
      frost_tile: {
        name: '절대영도 빙결 룬',
        reqBadge: '3 이하 (1, 2, 3)',
        shortDesc: '적 공격력 약화 + 함정 2배 증폭',
        detailDesc: '주변 2칸 내 몬스터를 빙결시켜 공격력을 25% 감소시키고, 인접한 가시 함정·화염 포탑 피해를 2배로 증폭합니다.',
        synergyTip: '가시 함정 / 화염 포탑과 나란히 배치하면 2.0x 극딜 콤보 완성!',
      },
      alchemy_lab: {
        name: '비전 연금술 실험실',
        reqBadge: '중간 눈금 (3, 4, 5)',
        shortDesc: '치명타 비약 + 건축 마나 충전',
        detailDesc: '원정대 치명타 확률을 +(12 + 눈금×3)% 높이고, 즉시 건축 마나 +2와 추가 주사위 리롤 +1을 제공합니다.',
        synergyTip: '치유의 성소 인접 시 파티 전체에 비전 보호막 +35 부여!',
      },
    },
  },
  en: {
    gameTitle: 'Dice Architect',
    gameSubtitle: 'TACTICAL ROGUELIKE DUNGEON BUILDER',
    floor: 'Floor',
    gold: 'Gold',
    mana: 'Mana',
    score: 'Score',
    bestScore: 'Best',
    buildPhase: 'ARCHITECT PHASE',
    marchingPhase: 'HERO MARCH & COMBAT',
    rerollDice: 'Reroll Dice',
    rerollsLeft: 'Rerolls',
    startMarch: 'START HERO MARCH!',
    speed: 'Speed',
    lockHint: 'Tap lock below a die to hold it before rerolling',
    selectDieHint: '1. Select a rolled 3D die below',
    tapGridHint: '2. Pick an unlocked blueprint & tap a grid cell to build',
    nudgeUp: 'Pip +1 (1 Mana)',
    nudgeDown: 'Pip -1 (1 Mana)',
    flipDie: 'Flip 7-X (1 Mana)',
    starEmpower: '★Star Awaken (2M)',
    synergyActive: 'Synergy Active',
    pathPreview: 'Hero March Route',
    bossRoom: 'Floor Boss Room',
    entrance: 'Dungeon Entrance',
    monsterLair: 'Monster Lair',
    manaCrystal: 'Mana Crystal (+2M/+25G)',
    pillar: 'Ancient Pillar (Blocked)',
    removeTile: 'Demolish',
    upgradeTile: 'Upgrade',
    howToPlay: 'Guide & Synergies',
    synergyGuide: 'Tile Synergy Codex',
    newRun: 'Start New Expedition',
    continueEndless: 'Enter Endless Abyss (Fl. 6+)',
    floorCleared: 'Floor Conquered!',
    chooseRelic: 'Draft 1 Ancient Relic',
    architectShop: 'Architect Workshop',
    nextFloor: 'Descend to Next Floor',
    victoryTitle: 'Sanctum of Fate Conquered!',
    victoryDesc: 'Your masterwork dungeon architecture guided the hero party to defeat the Lord of Fate!',
    defeatTitle: 'Party Fallen',
    defeatDesc: 'The hero party fell in battle. Refine your tile synergies and rebuild the dungeon!',
    partyStatus: 'Hero Party (Auto-Advancing)',
    relicsOwned: 'Relics',
    noRelics: 'No relics collected yet',
    tiles: {
      corridor: {
        name: 'Tactical Corridor',
        reqBadge: 'Any Die (1-6)',
        shortDesc: 'Safe Route · Grants Shield',
        detailDesc: 'Connects the party route and grants +(10 + Pip×3) Shield and +2 DEF to all heroes on step.',
        synergyTip: '+50% ATK Buff power when adjacent to Forge Sanctum',
      },
      spike_trap: {
        name: 'Spike Trap',
        reqBadge: 'Odd (1, 3, 5)',
        shortDesc: 'Adjacent Piercing + Bleed',
        detailDesc: 'Strikes monsters on or orthgonal to this tile for (18 + Pip×5) physical damage and inflicts Bleed.',
        synergyTip: 'Deals 2.0x Shatter Damage when adjacent to a Frost Rune!',
      },
      flame_turret: {
        name: 'Flame Turret',
        reqBadge: 'High (4, 5, 6)',
        shortDesc: 'Range-2 Fireball Barrage',
        detailDesc: 'Bombards all monsters & bosses within 2 tiles for (22 + Pip×6) fire damage during the march.',
        synergyTip: 'Deals 2.0x Melt Damage when adjacent to a Frost Rune!',
      },
      healing_shrine: {
        name: 'Healing Shrine',
        reqBadge: 'Even (2, 4, 6)',
        shortDesc: 'Restores Party HP',
        detailDesc: 'Heals all party heroes for (24 + Pip×6) HP when visited and cleanses debuffs.',
        synergyTip: 'Grants +35 Overheal Shield when adjacent to an Alchemy Lab!',
      },
      forge_sanctum: {
        name: 'Forge Sanctum',
        reqBadge: '5+ (5, 6)',
        shortDesc: 'Permanent Floor ATK/DEF Buff',
        detailDesc: 'Boosts all heroes ATK by +(5 + Pip×2) and DEF by +3 for the entire floor.',
        synergyTip: '1.5x Buff power when adjacent to a Corridor or Gold Vault!',
      },
      gold_vault: {
        name: 'Gold Vault',
        reqBadge: 'Exact 6 or ★',
        shortDesc: 'High Gold Yield · Jackpot',
        detailDesc: 'Grants (30 + Pip×9) Gold when visited. 1.5x jackpot bonus if built with a ★Star Die!',
        synergyTip: 'Grants bonus party ATK when placed adjacent to a Forge Sanctum!',
      },
      frost_tile: {
        name: 'Frost Slow Rune',
        reqBadge: 'Low (1, 2, 3)',
        shortDesc: 'Chills Foes + 2x Trap Power',
        detailDesc: 'Chills monsters within 2 tiles (-25% ATK) and doubles adjacent Spike Trap & Flame Turret damage.',
        synergyTip: 'Place next to Spike Traps or Flame Turrets for 2.0x damage!',
      },
      alchemy_lab: {
        name: 'Alchemy Lab',
        reqBadge: 'Mid (3, 4, 5)',
        shortDesc: 'Crit Elixir + Mana & Reroll',
        detailDesc: 'Grants +(12 + Pip×3)% Crit Chance to party, plus instant +2 Mana and +1 Reroll.',
        synergyTip: 'Grants +35 Arcane Shield when adjacent to a Healing Shrine!',
      },
    },
  },
};
