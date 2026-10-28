import React from 'react';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  FastForward,
  Coins,
  Zap,
  Trophy,
  Shield,
  Swords,
} from 'lucide-react';
import type { HeroUnit, Language, Relic } from '../types/game';
import { LOCALES } from '../data/i18n';

interface PartyStatusBarProps {
  floor: number;
  floorName: string;
  gold: number;
  mana: number;
  score: number;
  bestScore: number;
  heroes: HeroUnit[];
  relics: Relic[];
  speedMultiplier: 1 | 2;
  muted: boolean;
  lang: Language;
  onToggleSpeed: () => void;
  onToggleMute: () => void;
  onToggleLang: () => void;
  onOpenGuide: () => void;
}

export const PartyStatusBar: React.FC<PartyStatusBarProps> = ({
  floor,
  floorName,
  gold,
  mana,
  score,
  bestScore,
  heroes,
  relics,
  speedMultiplier,
  muted,
  lang,
  onToggleSpeed,
  onToggleMute,
  onToggleLang,
  onOpenGuide,
}) => {
  const t = LOCALES[lang];

  return (
    <header className="top-hud-header">
      {/* Row 1: Title, Floor, Controls */}
      <div className="hud-top-row">
        <div className="hud-brand">
          <span className="hud-floor-pill">
            {floor}
            {t.floor}
          </span>
          <div className="hud-title-group">
            <h1 className="hud-title">{t.gameTitle}</h1>
            <span className="hud-floor-name">{floorName}</span>
          </div>
        </div>

        <div className="hud-controls">
          <button
            type="button"
            className="hud-icon-btn speed-btn"
            onClick={onToggleSpeed}
            title={t.speed}
          >
            <FastForward size={13} />
            <span>{speedMultiplier}x</span>
          </button>

          <button
            type="button"
            className="hud-icon-btn lang-btn"
            onClick={onToggleLang}
            title="Switch Language (KO/EN)"
          >
            <span>{lang.toUpperCase()}</span>
          </button>

          <button
            type="button"
            className="hud-icon-btn"
            onClick={onToggleMute}
            aria-label="Toggle Sound"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            type="button"
            className="hud-icon-btn guide-btn"
            onClick={onOpenGuide}
            title={t.howToPlay}
          >
            <HelpCircle size={15} />
          </button>
        </div>
      </div>

      {/* Row 2: Resources & Relics */}
      <div className="hud-resources-row">
        <div className="res-chip gold-chip">
          <Coins size={13} />
          <span>{gold}G</span>
        </div>

        <div className="res-chip mana-chip">
          <Zap size={13} />
          <span>
            {t.mana} {mana}
          </span>
        </div>

        <div className="res-chip score-chip">
          <Trophy size={13} />
          <span>
            {score.toLocaleString()}{' '}
            <small>
              ({t.bestScore} {Math.max(score, bestScore).toLocaleString()})
            </small>
          </span>
        </div>

        {relics.length > 0 && (
          <div className="hud-relics-strip" title={t.relicsOwned}>
            {relics.map((r) => (
              <span
                key={r.id}
                className={`relic-mini-badge rarity-${r.rarity}`}
                title={`${lang === 'ko' ? r.nameKo : r.nameEn}: ${
                  lang === 'ko' ? r.descKo : r.descEn
                }`}
              >
                ✦ {lang === 'ko' ? r.nameKo.slice(0, 4) : r.nameEn.slice(0, 6)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Row 3: 3 Hero Party Status Cards */}
      <div className="hero-party-strip">
        {heroes.map((h) => {
          const hpPercent = Math.max(0, Math.min(100, (h.hp / h.maxHp) * 100));
          const isAlive = h.hp > 0;
          return (
            <div
              key={h.id}
              className={`hero-mini-card ${!isAlive ? 'hero-fallen' : ''}`}
              style={{ '--hero-color': h.color } as React.CSSProperties}
            >
              <div className="hero-card-top">
                <span className="hero-name">
                  {h.id === 'warrior' ? '🛡️' : h.id === 'archer' ? '🏹' : '🔮'}{' '}
                  {lang === 'ko' ? h.nameKo : h.nameEn}
                </span>
                <span className="hero-stats-inline">
                  <Swords size={10} />
                  {h.atk}
                  {h.shield > 0 && (
                    <em className="hero-shield-badge">
                      <Shield size={9} />+{h.shield}
                    </em>
                  )}
                </span>
              </div>

              <div className="hero-hp-bar-outer">
                <div
                  className="hero-hp-bar-inner"
                  style={{ width: `${hpPercent}%`, backgroundColor: h.color }}
                />
                <span className="hero-hp-numbers">
                  {h.hp}/{h.maxHp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};
