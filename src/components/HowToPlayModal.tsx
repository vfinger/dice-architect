import React from 'react';
import { X, Sparkles, Dices, Map, Swords } from 'lucide-react';
import type { Language } from '../types/game';
import { LOCALES } from '../data/i18n';

interface HowToPlayModalProps {
  lang: Language;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  lang,
  onClose,
}) => {
  const t = LOCALES[lang];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card guide-modal-card">
        <div className="guide-modal-top">
          <h2>{t.howToPlay}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="guide-steps-section">
          <div className="guide-step-item">
            <Dices size={20} className="guide-step-icon" />
            <div>
              <strong>
                {lang === 'ko'
                  ? '1. 3D 주사위 굴리기 & 눈금 조작'
                  : '1. Roll & Manipulate 3D Dice'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '매 턴 주사위를 굴리고 원하는 눈금을 고정(Hold)한 뒤 리롤하세요. 건축 마나(M)로 눈금 +1/-1, 뒤집기(7-X), ★황금 각성(와일드) 스킬을 사용할 수 있습니다.'
                  : 'Roll 3D dice, hold key dice before rerolling, or spend Mana to nudge pips (+1/-1), flip faces (7-X), or awaken a ★Star Wild die.'}
              </p>
            </div>
          </div>

          <div className="guide-step-item">
            <Map size={20} className="guide-step-icon" />
            <div>
              <strong>
                {lang === 'ko'
                  ? '2. 던전 타일 건설 & 경로 설계'
                  : '2. Build Dungeon Tiles & Route Party'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '주사위 눈금 조건(홀수, 짝수, 4 이상 등)에 맞는 타일 도면을 골라 5×6 격자에 배치하세요. 영웅 원정대는 입구(5,2)에서 보스 방(0,2)까지 플레이어가 건설한 타일 경로를 우선 따라 행군합니다!'
                  : 'Select an unlocked blueprint and tap a grid cell to build. The Hero Party automatically follows your constructed tile road from Entrance (5,2) to Boss Room (0,2).'}
              </p>
            </div>
          </div>

          <div className="guide-step-item">
            <Swords size={20} className="guide-step-icon" />
            <div>
              <strong>
                {lang === 'ko'
                  ? '3. 자동 행군 & 함정 포격 전투'
                  : '3. Auto-Advance March & Trap Barrage'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '[던전 행군 개시!]를 누르면 전사·궁수·마법사 파티가 전진하며 성소 버프와 치유를 받고, 배치된 가시 함정·화염 포탑·빙결 룬이 주변 몬스터와 보스를 포격합니다.'
                  : 'Tap [START HERO MARCH!] to watch your Warrior, Archer, and Mage traverse the dungeon, trigger shrines, and unleash trap barrages on monsters and the Floor Boss.'}
              </p>
            </div>
          </div>
        </div>

        <h3 className="synergy-codex-title">
          <Sparkles size={15} />
          <span>{t.synergyGuide}</span>
        </h3>

        <div className="synergy-codex-list">
          <div className="synergy-codex-row">
            <span className="syn-badge syn-frost">❄️ + 🗡️/🔥</span>
            <div>
              <strong>
                {lang === 'ko'
                  ? '빙결 파쇄 / 융해 (피해량 2.0배!)'
                  : 'Frost Shatter / Melt (2.0x Damage!)'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '빙결 룬 옆에 가시 함정이나 화염 포탑을 나란히 배치하면 함정·포탑 피해량이 2배로 폭증합니다.'
                  : 'Place a Frost Rune adjacent to a Spike Trap or Flame Turret to double trap damage.'}
              </p>
            </div>
          </div>

          <div className="synergy-codex-row">
            <span className="syn-badge syn-sanctum">🔨 + 👣</span>
            <div>
              <strong>
                {lang === 'ko'
                  ? '전술 보급로 (버프·방어 +50%)'
                  : 'Tactical Supply Line (+50% Power)'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '전쟁 성소와 전술 돌복도가 인접하면 두 타일의 공격력·보호막 효과가 +50% 증가합니다.'
                  : 'Adjacent Forge Sanctum and Tactical Corridor boost each other by +50%.'}
              </p>
            </div>
          </div>

          <div className="synergy-codex-row">
            <span className="syn-badge syn-alchemy">🧪 + 💚</span>
            <div>
              <strong>
                {lang === 'ko'
                  ? '비전 성소 보호막 (+40% & 보호막 +35)'
                  : 'Arcane Sanctuary (+40% & +35 Shield)'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '연금술 실험실과 치유의 성소가 인접하면 치유 시 파티 전체에 +35 보호막을 추가 부여합니다.'
                  : 'Adjacent Alchemy Lab and Healing Shrine grant +35 Shield to all heroes.'}
              </p>
            </div>
          </div>

          <div className="synergy-codex-row">
            <span className="syn-badge syn-vault">🪙 + 🔨</span>
            <div>
              <strong>
                {lang === 'ko'
                  ? '황금 무장 (+50% 골드 & 공격력 보너스)'
                  : 'Golden Armament (+50% Gold & ATK)'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '황금 금고와 전쟁 성소가 인접하면 골드 획득량과 공격력 강화량이 +50% 상승합니다.'
                  : 'Adjacent Gold Vault and Forge Sanctum boost both Gold yield and ATK buff by +50%.'}
              </p>
            </div>
          </div>

          <div className="synergy-codex-row">
            <span className="syn-badge syn-twin">✦ + ✦</span>
            <div>
              <strong>
                {lang === 'ko'
                  ? '동종 타일 공명 (+35% 위력)'
                  : 'Twin Tile Resonance (+35% Power)'}
              </strong>
              <p>
                {lang === 'ko'
                  ? '같은 종류의 타일 2개를 나란히 배치하면 공명 효과로 두 타일 모두 위력이 +35% 증가합니다.'
                  : 'Two identical tiles placed side-by-side resonate for +35% output each.'}
              </p>
            </div>
          </div>
        </div>

        <button type="button" className="modal-primary-cta" onClick={onClose}>
          <span>{lang === 'ko' ? '확인 (건축으로 돌아가기)' : 'Got It!'}</span>
        </button>
      </div>
    </div>
  );
};
