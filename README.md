# 🎲 주사위 던전 건축가 (Dice Architect)

> **영웅을 직접 조종하는 대신, 매 턴 3D 주사위를 굴려 영웅 원정대가 전진할 던전 타일·함정·성소를 설계하는 iOS 세로형 전략 로그라이크 게임**

- **개발자 (Developer)**: Byeong Gyun Oh (`com.byeonggyunoh.dicearchitect`)
- **타겟 플랫폼**: iOS (iPhone / iPad 세로 모드, Capacitor 8 기반) & Mobile Web
- **지원 언어**: 한국어 (기본값) / 영어 (실시간 전환 지원)

---

## ✨ 핵심 게임 시스템

1. **3D 입체 주사위 굴리기 & 운명 조작 (3D Dice Tray & Manipulation)**
   - CSS 3D Perspective 큐브 렌더링과 물리 회전 애니메이션으로 구현된 주사위 트레이.
   - 원하는 주사위를 **고정(Hold/Lock)** 한 뒤 남은 주사위만 리롤 가능 (기본 2회 리롤).
   - **건축 마나(M)** 를 소모해 주사위 눈금을 조작하는 4종의 건축가 스킬:
     - `눈금 +1` / `눈금 -1` (1 마나)
     - `뒤집기 (7 - X)` (1 마나: 1↔6, 2↔5, 3↔4 반전)
     - `★황금 각성 (와일드)` (2 마나: 모든 도면 조건 해제 + 타일 위력 1.25배 증폭)

2. **5×6 던전 격자 & 8종의 건축 도면 (Blueprints)**
   - **던전 입구 `(5, 2)`** 에서 **층간 보스 방 `(0, 2)`** 까지 이어지는 5×6 포트레이트 보드.
   - 플레이어가 타일을 배치하면 실시간 다익스트라(Dijkstra) 가중치 경로 탐색기가 **영웅 원정대의 예상 행군 경로(점선 화살표 및 순서 번호)** 를 즉시 갱신합니다.
   - **8종 타일 도면**:
     | 도면 이름 | 주사위 눈금 조건 | 핵심 효과 |
     | :--- | :--- | :--- |
     | **전술 돌복도** (`corridor`) | 아무 눈금 (1~6) | 안전 이동 경로 연결 + 파티 전체 보호막 & 방어력 증가 |
     | **강철 가시 함정** (`spike_trap`) | 홀수 (1, 3, 5) | 인접 1칸 몬스터 관통 물리 피해 + 출혈(방어력 감소) |
     | **화염 포탑** (`flame_turret`) | 4 이상 (4, 5, 6) | 사거리 2칸 내 모든 몬스터·보스에게 화염 포격 |
     | **치유의 성소** (`healing_shrine`) | 짝수 (2, 4, 6) | 경유 시 원정대 전체 생명력 회복 |
     | **전쟁 대장간 성소** (`forge_sanctum`) | 5 이상 (5, 6) | 해당 층 동안 원정대 전체 공격력·방어력 영구 강화 |
     | **황금 보물 금고** (`gold_vault`) | 눈금 6 또는 ★ | 경유 시 대량 골드 채굴 (★각성 주사위 시 보너스) |
     | **절대영도 빙결 룬** (`frost_tile`) | 3 이하 (1, 2, 3) | 사거리 2칸 적 공격력 25% 감소 + **인접 함정·포탑 피해 2배** |
     | **비전 연금술 실험실** (`alchemy_lab`) | 중간 눈금 (3, 4, 5) | 파티 치명타 확률 증가 + 즉시 건축 마나 +2 & 리롤 +1 |

3. **인접 타일 시너지 시스템 (Tile Adjacency Synergies)**
   - **❄️ 빙결 파쇄 / 융해 (`2.0x` 피해)**: `빙결 룬` 옆에 `가시 함정` 또는 `화염 포탑` 배치 시 함정·포탑 피해량 **2.0배** (서리불꽃 유물 보유 시 **2.5배**).
   - **🔨 전술 보급로 (`+50%` 위력)**: `전쟁 성소` + `전술 돌복도` 인접 시 양쪽 효과 +50%.
   - **🧪 비전 성소 보호막 (`+40%` & 보호막 `+35`)**: `연금술 실험실` + `치유의 성소` 인접 시 치유와 함께 보호막 +35 추가 부여.
   - **🪙 황금 무장 (`+50%` 골드 & 공격력)**: `황금 금고` + `전쟁 성소` 인접 시 골드 채굴량과 공격력 버프 +50%.
   - **✦ 동종 공명 (`+35%` 위력)**: 같은 종류의 타일 2개 인접 배치 시 양쪽 위력 +35% (쌍둥이 설계도 유물 시 +65%).

4. **자동 전진 원정대 & 로그라이크 성장 (Floor 1~5 + 무한 심연 모드)**
   - **전사 레온**, **궁수 실비**, **마도사 미르** 3인 파티가 건설된 타일을 밟으며 행군하고 몬스터 및 보스와 자동 교전합니다 (1x / 2x 배속 지원).
   - 층 클리어마다 **8종의 고대 유물** 중 1종을 선택하고, **건축가의 정비소**에서 최대 주사위 개수(최대 6개), 도면 레벨, 파티 체력을 강화할 수 있습니다.
   - Web Audio API 프로시저럴 사운드 신디사이저 및 Capacitor Haptics 진동 피드백 내장.

---

## 🚀 로컬 실행 및 테스트 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 유닛 테스트 실행 (Vitest)
npm test

# 프로덕션 빌드 검증
npm run build
```

---

## 📱 iOS Xcode 빌드 & App Store Connect 출시 가이드 (macOS)

본 프로젝트는 **Capacitor iOS (`com.byeonggyunoh.dicearchitect`)** 설정과 App Store 출시 템플릿이 모두 포함되어 있어 Mac의 Xcode에서 즉시 아카이브 및 업로드가 가능합니다.

### 1단계: 웹 번들 빌드 및 iOS 네이티브 프로젝트 생성
Mac 터미널에서 프로젝트 루트(`dice-architect`)로 이동한 뒤 아래 명령어를 실행합니다:

```bash
# 1. 아이콘/스플래시 에셋 생성 및 프로덕션 빌드
npm run ios:assets
npm run build

# 2. Capacitor iOS 플랫폼 추가 및 동기화 (최초 1회)
npx cap add ios
npx cap sync ios
```
> 이미 `ios/` 폴더가 생성된 이후 코드를 수정했다면 `npm run ios:sync` 만 실행하면 됩니다.

### 2단계: `Info.plist` 및 앱 아이콘 적용
1. `ios-release/Info.plist.template.xml`에 정리된 핵심 설정을 `ios/App/App/Info.plist`에 확인/반영합니다:
   - `CFBundleDisplayName`: `주사위 던전 건축가`
   - `UISupportedInterfaceOrientations`: `UIInterfaceOrientationPortrait` (세로 방향 고정)
   - `ITSAppUsesNonExemptEncryption`: `false` (수출 규정 팝업 생략)
2. `public/icon-1024.svg` (1024×1024 알파 채널 없는 앱 아이콘 원본)을 PNG로 변환하거나 Xcode의 `Assets.xcassets > AppIcon` 슬롯(iOS 1024pt 단일 슬롯)에 드래그 앤 드롭합니다.

### 3단계: Xcode에서 서명(Signing) 및 Archive 업로드
```bash
npm run ios:open
```
1. Xcode가 열리면 좌측 내비게이터에서 **App** 타겟 선택 → **Signing & Capabilities** 탭으로 이동합니다.
2. **Automatically manage signing** 체크 후, **Team**을 `Byeong Gyun Oh` Apple Developer 계정으로 선택합니다.
3. **Bundle Identifier**가 `com.byeonggyunoh.dicearchitect`인지 확인합니다.
4. 상단 디바이스 선택기를 **Any iOS Device (arm64)** 로 변경한 뒤, 메뉴에서 **Product > Archive** 를 클릭합니다.
5. 아카이브 완료 후 Organizer 창에서 **Distribute App > App Store Connect > Upload** 를 선택해 빌드를 업로드합니다.

### 4단계: App Store Connect 메타데이터 입력
- `ios-release/AppStoreConnect_Metadata_KO_EN.md` 파일에 준비된 **한국어/영어 앱 이름, 부제, 키워드, 설명문, 개인정보 보호("데이터 수집 안 함") 체크리스트**를 그대로 복사해 App Store Connect에 붙여넣고 심사를 제출하시면 됩니다.
