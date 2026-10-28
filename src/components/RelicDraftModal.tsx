import React, { useState } from 'react';
import { Sparkles, PlusCircle, Heart, Hammer, ArrowRight } from 'lucide-react';
import type { Language, Relic } from '../types/game';
import { LOCALES } from '../data/i18n';

interface RelicDraftModalProps {
  floorCleared: number;
  relicChoices: Relic[];
  gold: number;
  maxDiceCount: number;
  lang: Language;
  onDraftRelic: (relic: Relic) => void;
  onBuyExtraDie: () => void;
  onBuyPartyHeal: () => void;
  onBuyBlueprintUpgrade: () => void;
  onProceedNextFloor: () => void;
}

export const RelicDraftModal: React.FC<RelicDraftModalProps> = ({
  floorCleared,
  relicChoices,
  gold,
  maxDiceCount,
  lang,
  onDraftRelic,
  onBuyExtraDie,
  onBuyPartyHeal,
  onBuyBlueprintUpgrade,
  onProceedNextFloor,
}) => {
  const t = LOCALES[lang];
  const [pickedRelicId, setPickedRelicId] = useState<string | null>(null);

  const handleSelectRelic = (relic: Relic) => {
    if (pickedRelicId) return;
    setPickedRelicId(relic.id);
    onDraftRelic(relic);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card relic-modal-card">
        <div className="modal-header-badge">
          <Sparkles size={16} />
          <span>
            {floorCleared}
            {t.floor} {t.floorCleared}
          </span>
        </div>

        <h2 className="modal-title">{t.chooseRelic}</h2>
        <div className="relic-choices-list">
          {relicChoices.map((relic) => {
            const isPicked = pickedRelicId === relic.id;
            return (
              <button
                key={relic.id}
                type="button"
                disabled={pickedRelicId !== null}
                onClick={() => handleSelectRelic(relic)}
                className={`relic-choice-btn rarity-${relic.rarity} ${
                  isPicked ? 'picked' : ''
                }`}
              >
                <div className="relic-choice-header">
                  <strong>{lang === 'ko' ? relic.nameKo : relic.nameEn}</strong>
                  <span className="relic-rarity-pill">
                    {relic.rarity.toUpperCase()}
                  </span>
                </div>
                <p>{lang === 'ko' ? relic.descKo : relic.descEn}</p>
              </button>
            );
          })}
        </div>

        <h3 className="shop-section-title">
          {t.architectShop} <span>({gold}G)</span>
        </h3>
        <div className="shop-actions-grid">
          <button
            type="button"
            className="shop-item-btn"
            disabled={gold < 95 || maxDiceCount >= 6}
            onClick={onBuyExtraDie}
          >
            <PlusCircle size={15} />
            <div>
              <strong>
                {lang === 'ko'
                  ? `최대 주사위 +1 (${maxDiceCount}/6)`
                  : `+1 Max Die (${maxDiceCount}/6)`}
              </strong>
              <span>95G</span>
            </div>
          </button>

          <button
            type="button"
            className="shop-item-btn"
            disabled={gold < 55}
            onClick={onBuyPartyHeal}
          >
            <Heart size={15} />
            <div>
              <strong>
                {lang === 'ko'
                  ? '파티 전체 치유 & 최대체력 +20'
                  : 'Full Party Heal & +20 Max HP'}
              </strong>
              <span>55G</span>
            </div>
          </button>

          <button
            type="button"
            className="shop-item-btn"
            disabled={gold < 75}
            onClick={onBuyBlueprintUpgrade}
          >
            <Hammer size={15} />
            <div>
              <strong>
                {lang === 'ko'
                  ? '모든 타일 설계도 레벨 +1 강화'
                  : 'Upgrade All Tile Blueprints +1 Lv'}
              </strong>
              <span>75G</span>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="modal-primary-cta"
          onClick={onProceedNextFloor}
        >
          <span>{t.nextFloor}</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
};
