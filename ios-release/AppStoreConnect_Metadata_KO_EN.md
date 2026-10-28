# App Store Connect 출시 메타데이터 템플릿 (한국어 & 영어)

개발자 계정: **Byeong Gyun Oh**  
번들 ID (Bundle Identifier): `com.byeonggyunoh.dicearchitect`  
버전: `1.0.0` (Build `1`)  
카테고리: 게임 (Games) > 전략 (Strategy) / 퍼즐 (Puzzle)

---

## 1. 한국어 (Korean - 기본 언어)

- **앱 이름 (30자 이내)**: `주사위 던전 건축가 - 타일 전략 로그라이크`
- **부제 (30자 이내)**: `3D 주사위를 굴려 시너지 던전을 설계하세요!`
- **프로모션 텍스트 (170자 이내)**:
  `영웅을 직접 조종하는 대신, 당신이 던전을 설계합니다! 매 턴 3D 주사위를 굴려 가시 함정, 화염 포탑, 빙결 룬, 치유의 성소를 배치하고 2배 시너지 콤보로 층간 보스를 격파하세요.`
- **키워드 (100자 이내, 쉼표 구분)**:
  `주사위,던전,로그라이크,전략,타일,디펜스,오토배틀러,퍼즐,건축,보스레이드,인디게임,싱글게임`
- **설명 (Description)**:
  ```text
  영웅이 걸어갈 운명의 길을 당신의 주사위로 직접 건축하세요!
  《주사위 던전 건축가 (Dice Architect)》는 매 턴 3D 주사위를 굴려 나온 눈금으로 던전 타일과 함정, 성소를 배치하고, 자동으로 전진하는 영웅 원정대(전사·궁수·마법사)가 몬스터 군단과 보스를 물리치도록 설계하는 신개념 전략 로그라이크 게임입니다.

  [핵심 특징]
  • 손맛 가득한 3D 주사위 & 눈금 조작 스킬
    - 원하는 주사위를 고정(Hold)하고 리롤하세요.
    - 건축 마나를 사용해 눈금 +1/-1, 주사위 뒤집기(7-X), ★황금 각성(와일드) 주사위를 발동할 수 있습니다.

  • 8종의 전략 건축 도면 & 강력한 인접 시너지
    - 전술 돌복도, 강철 가시 함정, 화염 포탑, 치유의 성소, 전쟁 대장간 성소, 황금 보물 금고, 절대영도 빙결 룬, 비전 연금술 실험실!
    - [빙결 룬 + 함정/포탑 = 2.0배 파쇄 피해], [전쟁 성소 + 돌복도 = 전술 보급 +50%], [연금술 + 치유 성소 = 비전 보호막] 등 인접 시너지를 조합하세요.

  • 자동 행군 원정대 & 실시간 함정 포격 전투
    - 플레이어가 건설한 타일 도로를 따라 레온(전사), 실비(궁수), 미르(마법사)가 행군합니다.
    - 배치한 화염 포탑과 가시 함정이 사거리 내 몬스터와 보스를 일제 포격합니다!

  • 로그라이크 유물 수집 & 무한 심연 모드
    - 1층 고블린 지하묘지부터 5층 태고의 주사위 성전까지 개성 넘치는 층간 보스!
    - 층 클리어마다 고대 유물 3종 중 1종을 선택하고 정비소에서 주사위 개수와 도면을 업그레이드하세요.
    - 5층 정복 후 열리는 '무한 심연 (Endless Abyss)' 모드에서 최고 점수에 도전하세요!
  ```

---

## 2. 영어 (English - U.S. / Global)

- **App Name**: `Dice Architect: Dungeon Tiles`
- **Subtitle**: `Roll 3D Dice & Build Synergy Paths`
- **Promotional Text**:
  `Instead of controlling the heroes, YOU architect the dungeon! Roll 3D dice, place traps, shrines, and frost runes, trigger 2x tile synergies, and guide your party to crush the boss!`
- **Keywords**:
  `dice,dungeon,roguelike,tactical,tile,strategy,autobattler,puzzle,trap,builder,rpg,indie,offline`
- **Description**:
  ```text
  Shape the dungeon with every roll of the dice!
  In Dice Architect, you don't control the heroes directly—instead, you roll 3D dice each turn and use their pips to construct tactical corridors, spike traps, flame turrets, frost runes, and healing shrines on a 5x6 dungeon grid. Watch your auto-advancing hero party (Warrior, Archer, Mage) march along your custom-built road, trigger devastating trap barrages, and defeat towering floor bosses!

  [KEY FEATURES]
  • Tactile 3D Dice & Fate Manipulation
    - Lock key dice before rerolling, or spend Architect Mana to nudge pips (+1/-1), flip opposite faces (7-X), or awaken ★Star Wild dice.
  • 8 Architectural Blueprints & Adjacency Synergies
    - Combine Frost Runes next to Spike Traps or Flame Turrets for 2.0x Shatter Damage!
    - Link Forge Sanctums with Corridors and Gold Vaults to supercharge your party's Attack and Shield.
  • Roguelike Relics & Endless Abyss Mode
    - Conquer 5 unique floors and bosses, draft powerful relics between floors, expand your dice pool up to 6 dice, and push your high score in Endless Abyss (Floor 6+)!
  ```

---

## 3. App Store 심사 체크리스트 (App Review & Privacy)

- **개인정보 보호 (App Privacy)**:
  - 수집하는 데이터 없음 (**"Data Not Collected"** 체크) — 모든 게임 진행도와 최고 점수는 기기 내부 `localStorage`에만 저장됩니다.
- **수출 규정 (Export Compliance)**:
  - `Info.plist`에 `<key>ITSAppUsesNonExemptEncryption</key><false/>` 포함 완료.
- **연령 등급 (Age Rating)**:
  - 만화/판타지 폭력(Cartoon or Fantasy Violence): 경미함(Infrequent/Mild) → **9+** 또는 **4+** 등급.
