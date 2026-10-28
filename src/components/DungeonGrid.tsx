import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import type {
  FloatingText,
  GridCell,
  Language,
  ProjectileEffect,
  SynergyLink,
  TileType,
} from '../types/game';
import { GRID_COLS, GRID_ROWS, TILE_BLUEPRINTS } from '../data/gameData';
import { LOCALES } from '../data/i18n';
import { calculateTileOutput } from '../engine/dungeonEngine';
import { TileIcon } from './BlueprintDeck';

interface DungeonGridProps {
  grid: GridCell[][];
  path: Array<[number, number]>;
  synergyLinks: SynergyLink[];
  partyPos: [number, number];
  isMarching: boolean;
  canPlaceNow: boolean;
  selectedBlueprint: TileType | null;
  ownedRelicIds: string[];
  floatingTexts: FloatingText[];
  projectiles: ProjectileEffect[];
  lang: Language;
  onCellClick: (row: number, col: number) => void;
  onRemoveTile: (row: number, col: number, e: React.MouseEvent) => void;
}

export const DungeonGrid: React.FC<DungeonGridProps> = ({
  grid,
  path,
  synergyLinks,
  partyPos,
  isMarching,
  canPlaceNow,
  selectedBlueprint,
  ownedRelicIds,
  floatingTexts,
  projectiles,
  lang,
  onCellClick,
  onRemoveTile,
}) => {
  const t = LOCALES[lang];

  // Convert (row, col) to SVG percentage coordinates (0..100, 0..100)
  const toSvgCoord = (r: number, c: number): [number, number] => {
    const x = ((c + 0.5) / GRID_COLS) * 100;
    const y = ((r + 0.5) / GRID_ROWS) * 100;
    return [x, y];
  };

  const pathPoints = path
    .map(([r, c]) => {
      const [x, y] = toSvgCoord(r, c);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="dungeon-board-wrapper">
      {/* SVG Overlay for Path Preview, Synergy Beams, and Trap Projectiles */}
      <svg
        className="dungeon-svg-overlay"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="marchPathGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Predicted Hero March Path */}
        {path.length > 1 && (
          <polyline
            points={pathPoints}
            fill="none"
            stroke="url(#marchPathGrad)"
            strokeWidth="1.25"
            strokeDasharray="2.2 1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="svg-march-path"
          />
        )}

        {/* Active Tile Synergy Links */}
        {synergyLinks.map((link, idx) => {
          const [x1, y1] = toSvgCoord(link.fromRow, link.fromCol);
          const [x2, y2] = toSvgCoord(link.toRow, link.toCol);
          return (
            <g key={`syn-${idx}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={link.color}
                strokeWidth="1.9"
                strokeLinecap="round"
                className="svg-synergy-beam"
              />
              <circle
                cx={(x1 + x2) / 2}
                cy={(y1 + y2) / 2}
                r="1.6"
                fill={link.color}
              />
            </g>
          );
        })}

        {/* Active Trap / Turret Projectiles */}
        {projectiles.map((proj) => {
          const [x1, y1] = toSvgCoord(proj.fromRow, proj.fromCol);
          const [x2, y2] = toSvgCoord(proj.toRow, proj.toCol);
          return (
            <g key={proj.id}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={proj.color}
                strokeWidth="2.4"
                strokeLinecap="round"
                className="svg-projectile-line"
              />
              <circle cx={x2} cy={y2} r="2.8" fill={proj.color} opacity="0.85" />
            </g>
          );
        })}
      </svg>

      {/* 6x5 Interactive Dungeon Grid */}
      <div className="dungeon-grid-cells" role="grid" aria-label="Dungeon Grid">
        {grid.map((rowCells) =>
          rowCells.map((cell) => {
            const { row, col, feature, placedTile, monster } = cell;
            const isPartyHere =
              partyPos[0] === row && partyPos[1] === col;
            const pathStepIdx = path.findIndex(
              ([pr, pc]) => pr === row && pc === col
            );
            const isOnPath = pathStepIdx !== -1;

            const isBuildable =
              !isMarching &&
              feature !== 'pillar' &&
              feature !== 'boss' &&
              feature !== 'entrance';

            const highlightPlaceable =
              canPlaceNow && isBuildable && selectedBlueprint !== null;

            const bp = placedTile ? TILE_BLUEPRINTS[placedTile.type] : null;
            const tileOutput = placedTile
              ? calculateTileOutput(
                  placedTile.type,
                  placedTile.dieValue,
                  placedTile.special,
                  placedTile.level,
                  cell.synergyMultiplier,
                  ownedRelicIds
                )
              : 0;

            const cellFloating = floatingTexts.filter(
              (ft) => ft.row === row && ft.col === col
            );

            return (
              <div
                key={`${row}-${col}`}
                role="gridcell"
                tabIndex={0}
                onClick={() => onCellClick(row, col)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCellClick(row, col);
                  }
                }}
                className={`dungeon-cell feature-${feature} ${
                  placedTile ? `has-tile tile-${placedTile.type}` : ''
                } ${isOnPath ? 'on-march-path' : ''} ${
                  highlightPlaceable ? 'can-build-target' : ''
                } ${cell.synergyMultiplier > 1 ? 'has-synergy-glow' : ''} ${
                  isPartyHere ? 'party-present' : ''
                }`}
                style={
                  bp
                    ? ({
                        '--tile-bg': bp.color,
                        '--tile-accent': bp.accentColor,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                {/* Path step order indicator */}
                {isOnPath && feature !== 'entrance' && feature !== 'boss' && (
                  <span className="path-step-num">{pathStepIdx}</span>
                )}

                {/* Feature: Entrance */}
                {feature === 'entrance' && (
                  <div className="cell-feature-badge entrance-badge">
                    <span className="feature-emoji">⛩️</span>
                    <span className="feature-label">
                      {lang === 'ko' ? '던전 입구' : 'ENTRANCE'}
                    </span>
                  </div>
                )}

                {/* Feature: Pillar */}
                {feature === 'pillar' && (
                  <div className="cell-feature-badge pillar-badge" title={t.pillar}>
                    <span className="feature-emoji">🗿</span>
                    <span className="feature-label">
                      {lang === 'ko' ? '석주' : 'PILLAR'}
                    </span>
                  </div>
                )}

                {/* Feature: Mana Crystal */}
                {feature === 'mana_crystal' && !cell.crystalCollected && (
                  <div
                    className="cell-crystal-indicator"
                    title={t.manaCrystal}
                  >
                    <span>💎</span>
                    <small>+2M</small>
                  </div>
                )}

                {/* Placed Architectural Tile */}
                {placedTile && bp && (
                  <div className="placed-tile-content">
                    <div className="placed-tile-header">
                      <span className="placed-die-pip">
                        {placedTile.special === 'star'
                          ? `★${placedTile.dieValue}`
                          : `🎲${placedTile.dieValue}`}
                      </span>

                      {cell.synergyMultiplier > 1 && (
                        <span className="synergy-mult-badge">
                          <Sparkles size={9} />
                          {cell.synergyMultiplier}x
                        </span>
                      )}

                      {!isMarching && (
                        <button
                          type="button"
                          className="tile-remove-btn"
                          onClick={(e) => onRemoveTile(row, col, e)}
                          title={t.removeTile}
                          aria-label={t.removeTile}
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>

                    <div
                      className="placed-tile-icon"
                      style={{ color: bp.accentColor }}
                    >
                      <TileIcon type={placedTile.type} size={17} />
                      {placedTile.level > 1 && (
                        <sub className="tile-lvl-sub">L{placedTile.level}</sub>
                      )}
                    </div>

                    <div className="placed-tile-stat">
                      {placedTile.type === 'frost_tile'
                        ? lang === 'ko'
                          ? '빙결·2x'
                          : 'Chill·2x'
                        : placedTile.type === 'gold_vault'
                        ? `+${tileOutput}G`
                        : `${tileOutput}`}
                    </div>
                  </div>
                )}

                {/* Monster or Floor Boss Overlay */}
                {monster && monster.hp > 0 && (
                  <div
                    className={`cell-monster-unit ${
                      monster.isBoss ? 'boss-unit' : ''
                    } ${monster.chilled ? 'status-chilled' : ''} ${
                      monster.bleeding ? 'status-bleeding' : ''
                    }`}
                  >
                    <div className="monster-top-row">
                      <span className="monster-emoji">{monster.icon}</span>
                      <span className="monster-atk-badge">⚔{monster.atk}</span>
                    </div>
                    <div className="monster-hp-bar-bg">
                      <div
                        className="monster-hp-bar-fill"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, (monster.hp / monster.maxHp) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="monster-hp-text">
                      {monster.hp}/{monster.maxHp}
                    </span>
                  </div>
                )}

                {/* Defeated skull marker */}
                {monster && monster.hp <= 0 && (
                  <div className="monster-defeated-badge">☠️</div>
                )}

                {/* Hero Party Token */}
                {isPartyHere && (
                  <div className="hero-party-token" title={t.partyStatus}>
                    <span className="party-avatars">🛡️🏹🔮</span>
                  </div>
                )}

                {/* Floating Damage / Heal / Gold Numbers */}
                {cellFloating.map((ft) => (
                  <div
                    key={ft.id}
                    className={`floating-combat-text ${
                      ft.isCrit ? 'crit-pop' : ''
                    }`}
                    style={{ color: ft.color }}
                  >
                    {ft.text}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
