import React from 'react';
import {
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  Play,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';
import type { Language, RolledDie } from '../types/game';
import { LOCALES } from '../data/i18n';

interface DiceTray3DProps {
  dice: RolledDie[];
  selectedDieId: string | null;
  rerollsLeft: number;
  mana: number;
  freeManipulationsLeft: number;
  isRolling: boolean;
  disabled: boolean;
  lang: Language;
  onSelectDie: (id: string) => void;
  onToggleLock: (id: string) => void;
  onReroll: () => void;
  onManipulateDie: (mode: 'up' | 'down' | 'flip' | 'star') => void;
  onStartMarch: () => void;
}

const PIP_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Target 3D Euler rotations so the front face displays the rolled value
const CUBE_ROTATIONS: Record<number, [number, number]> = {
  1: [0, 0],
  2: [0, -180],
  3: [0, -90],
  4: [0, 90],
  5: [-90, 0],
  6: [90, 0],
};

const DieFaceGrid: React.FC<{ faceValue: number; isStar: boolean }> = ({
  faceValue,
  isStar,
}) => {
  const activePips = PIP_POSITIONS[faceValue] || [4];
  return (
    <div className="die-face-grid">
      {Array.from({ length: 9 }).map((_, idx) => {
        const hasPip = activePips.includes(idx);
        return (
          <span
            key={idx}
            className={`die-pip ${hasPip ? 'active' : ''} ${
              faceValue === 1 || faceValue === 4 ? 'pip-crimson' : ''
            } ${isStar && hasPip ? 'pip-star' : ''}`}
          />
        );
      })}
    </div>
  );
};

export const DiceTray3D: React.FC<DiceTray3DProps> = ({
  dice,
  selectedDieId,
  rerollsLeft,
  mana,
  freeManipulationsLeft,
  isRolling,
  disabled,
  lang,
  onSelectDie,
  onToggleLock,
  onReroll,
  onManipulateDie,
  onStartMarch,
}) => {
  const t = LOCALES[lang];
  const selectedDie = dice.find((d) => d.id === selectedDieId && !d.used) || null;
  const unusedCount = dice.filter((d) => !d.used).length;
  const basicCost = freeManipulationsLeft > 0 ? 0 : 1;
  const starCost = freeManipulationsLeft > 0 ? 0 : 2;

  return (
    <section className="dice-tray-panel" aria-label="3D Dice Tray">
      {/* Dice Manipulation Skills Bar */}
      <div className="dice-manip-bar">
        <button
          type="button"
          className="manip-btn"
          disabled={
            disabled ||
            !selectedDie ||
            selectedDie.value >= 6 ||
            mana < basicCost
          }
          onClick={() => onManipulateDie('up')}
          title={t.nudgeUp}
        >
          <ArrowUp size={13} />
          <span>
            {lang === 'ko' ? '눈금+1' : 'Pip+1'}{' '}
            <em>({basicCost}M)</em>
          </span>
        </button>

        <button
          type="button"
          className="manip-btn"
          disabled={
            disabled ||
            !selectedDie ||
            selectedDie.value <= 1 ||
            mana < basicCost
          }
          onClick={() => onManipulateDie('down')}
          title={t.nudgeDown}
        >
          <ArrowDown size={13} />
          <span>
            {lang === 'ko' ? '눈금-1' : 'Pip-1'}{' '}
            <em>({basicCost}M)</em>
          </span>
        </button>

        <button
          type="button"
          className="manip-btn"
          disabled={disabled || !selectedDie || mana < basicCost}
          onClick={() => onManipulateDie('flip')}
          title={t.flipDie}
        >
          <RefreshCw size={13} />
          <span>
            {lang === 'ko' ? '뒤집기' : 'Flip'}{' '}
            <em>({basicCost}M)</em>
          </span>
        </button>

        <button
          type="button"
          className="manip-btn manip-star"
          disabled={
            disabled ||
            !selectedDie ||
            selectedDie.special === 'star' ||
            mana < starCost
          }
          onClick={() => onManipulateDie('star')}
          title={t.starEmpower}
        >
          <Sparkles size={13} />
          <span>
            {lang === 'ko' ? '★각성' : '★Wild'}{' '}
            <em>({starCost}M)</em>
          </span>
        </button>
      </div>

      {/* 3D Dice Row */}
      <div className="dice-row-container">
        {dice.map((die) => {
          const isSelected = selectedDieId === die.id && !die.used;
          const [baseRx, baseRy] = CUBE_ROTATIONS[die.value] || [0, 0];
          // Extra full 360 spins based on rollSeed so every roll visibly tumbles in 3D
          const tumbleTurnsX = ((die.rollSeed % 3) + 1) * 360;
          const tumbleTurnsY = (((die.rollSeed >> 3) % 3) + 1) * 360;
          const rx = baseRx + (die.locked ? 0 : tumbleTurnsX);
          const ry = baseRy + (die.locked ? 0 : tumbleTurnsY);

          return (
            <div
              key={die.id}
              className={`die-slot-wrapper ${die.used ? 'die-used' : ''} ${
                isSelected ? 'die-selected' : ''
              }`}
            >
              <button
                type="button"
                disabled={disabled || die.used}
                onClick={() => onSelectDie(die.id)}
                className={`die-3d-scene ${
                  die.special === 'star'
                    ? 'special-star'
                    : die.special === 'gold'
                    ? 'special-gold'
                    : ''
                } ${isRolling && !die.locked && !die.used ? 'tumble-active' : ''}`}
                aria-label={`Die value ${die.value}${
                  die.special === 'star' ? ' Star Wild' : ''
                }`}
              >
                <div
                  className="die-3d-cube"
                  style={{
                    transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
                  }}
                >
                  <div className="cube-face face-1">
                    <DieFaceGrid faceValue={1} isStar={die.special === 'star'} />
                  </div>
                  <div className="cube-face face-2">
                    <DieFaceGrid faceValue={2} isStar={die.special === 'star'} />
                  </div>
                  <div className="cube-face face-3">
                    <DieFaceGrid faceValue={3} isStar={die.special === 'star'} />
                  </div>
                  <div className="cube-face face-4">
                    <DieFaceGrid faceValue={4} isStar={die.special === 'star'} />
                  </div>
                  <div className="cube-face face-5">
                    <DieFaceGrid faceValue={5} isStar={die.special === 'star'} />
                  </div>
                  <div className="cube-face face-6">
                    <DieFaceGrid faceValue={6} isStar={die.special === 'star'} />
                  </div>
                </div>

                {/* Numeric & Star badge overlay for instant readability */}
                <span className="die-value-badge">
                  {die.special === 'star' ? `★${die.value}` : die.value}
                </span>
              </button>

              <button
                type="button"
                disabled={disabled || die.used}
                onClick={() => onToggleLock(die.id)}
                className={`die-lock-pill ${die.locked ? 'locked' : ''}`}
                title={t.lockHint}
              >
                {die.locked ? <Lock size={11} /> : <Unlock size={11} />}
                <span>
                  {die.used
                    ? lang === 'ko'
                      ? '배치됨'
                      : 'Used'
                    : die.locked
                    ? lang === 'ko'
                      ? '고정됨'
                      : 'Locked'
                    : lang === 'ko'
                    ? '고정'
                    : 'Hold'}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Buttons: Reroll & Start Hero March */}
      <div className="dice-actions-row">
        <button
          type="button"
          className="action-reroll-btn"
          disabled={disabled || rerollsLeft <= 0 || unusedCount === 0}
          onClick={onReroll}
        >
          <RotateCcw size={16} className={isRolling ? 'spin-icon' : ''} />
          <span>
            {t.rerollDice} <strong>({rerollsLeft})</strong>
          </span>
        </button>

        <button
          type="button"
          className="action-march-btn"
          disabled={disabled}
          onClick={onStartMarch}
        >
          <Play size={16} fill="currentColor" />
          <span>{t.startMarch}</span>
        </button>
      </div>
    </section>
  );
};
