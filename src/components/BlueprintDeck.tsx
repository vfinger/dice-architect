import React from 'react';
import {
  Footprints,
  Sword,
  Flame,
  Heart,
  Hammer,
  Coins,
  Snowflake,
  FlaskConical,
} from 'lucide-react';
import type { Language, RolledDie, TileType } from '../types/game';
import { TILE_BLUEPRINTS, TILE_ORDER } from '../data/gameData';
import { LOCALES } from '../data/i18n';
import { calculateTileOutput, canDieUnlockTile } from '../engine/dungeonEngine';

interface BlueprintDeckProps {
  selectedDie: RolledDie | null;
  selectedBlueprint: TileType | null;
  blueprintLevels: Record<TileType, number>;
  ownedRelicIds: string[];
  disabled: boolean;
  lang: Language;
  onSelectBlueprint: (type: TileType) => void;
}

export const TileIcon: React.FC<{ type: TileType; size?: number }> = ({
  type,
  size = 16,
}) => {
  switch (type) {
    case 'corridor':
      return <Footprints size={size} />;
    case 'spike_trap':
      return <Sword size={size} />;
    case 'flame_turret':
      return <Flame size={size} />;
    case 'healing_shrine':
      return <Heart size={size} />;
    case 'forge_sanctum':
      return <Hammer size={size} />;
    case 'gold_vault':
      return <Coins size={size} />;
    case 'frost_tile':
      return <Snowflake size={size} />;
    case 'alchemy_lab':
      return <FlaskConical size={size} />;
  }
};

function formatTileOutputBadge(
  type: TileType,
  value: number,
  lang: Language
): string {
  switch (type) {
    case 'corridor':
      return lang === 'ko' ? `보호막 +${value}` : `SHD +${value}`;
    case 'spike_trap':
    case 'flame_turret':
      return lang === 'ko' ? `피해 ${value}` : `DMG ${value}`;
    case 'healing_shrine':
      return lang === 'ko' ? `회복 +${value}` : `HEAL +${value}`;
    case 'forge_sanctum':
      return lang === 'ko' ? `공격 +${value}` : `ATK +${value}`;
    case 'gold_vault':
      return `+${value}G`;
    case 'frost_tile':
      return lang === 'ko' ? `빙결·함정2x` : `Chill·2xTrap`;
    case 'alchemy_lab':
      return lang === 'ko' ? `치명 +${value}%` : `CRIT +${value}%`;
  }
}

export const BlueprintDeck: React.FC<BlueprintDeckProps> = ({
  selectedDie,
  selectedBlueprint,
  blueprintLevels,
  ownedRelicIds,
  disabled,
  lang,
  onSelectBlueprint,
}) => {
  const t = LOCALES[lang];

  return (
    <section className="blueprint-deck-panel" aria-label="Tile Blueprints">
      <div className="blueprint-grid">
        {TILE_ORDER.map((type) => {
          const bp = TILE_BLUEPRINTS[type];
          const localeInfo = t.tiles[type];
          const level = blueprintLevels[type] || 1;
          const unlocked = selectedDie
            ? canDieUnlockTile(selectedDie, type, ownedRelicIds)
            : false;
          const isSelected = selectedBlueprint === type && unlocked;
          const previewVal = calculateTileOutput(
            type,
            selectedDie ? selectedDie.value : 4,
            selectedDie ? selectedDie.special : 'normal',
            level,
            1,
            ownedRelicIds
          );

          return (
            <button
              key={type}
              type="button"
              disabled={disabled || !unlocked}
              onClick={() => onSelectBlueprint(type)}
              className={`blueprint-card ${unlocked ? 'unlocked' : 'locked'} ${
                isSelected ? 'selected' : ''
              }`}
              style={
                {
                  '--bp-bg': bp.color,
                  '--bp-accent': bp.accentColor,
                } as React.CSSProperties
              }
              title={`${localeInfo.detailDesc} (${localeInfo.synergyTip})`}
            >
              <div className="bp-card-top">
                <span className="bp-icon-wrap" style={{ color: bp.accentColor }}>
                  <TileIcon type={type} size={15} />
                </span>
                <span className="bp-req-badge">{localeInfo.reqBadge}</span>
              </div>

              <div className="bp-card-title">
                <span>{localeInfo.name}</span>
                {level > 1 && <em className="bp-lvl">Lv.{level}</em>}
              </div>

              <div className="bp-card-stat">
                <span className="bp-output-pill">
                  {formatTileOutputBadge(type, previewVal, lang)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
