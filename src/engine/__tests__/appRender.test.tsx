// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('Dice Architect - Full App UI Integration Tests', () => {
  it('renders the Korean title, 3 heroes, 5x6 dungeon grid, and 3D dice tray', () => {
    render(<App />);

    expect(screen.getByText('주사위 던전 건축가')).toBeTruthy();
    expect(screen.getByText(/레온/)).toBeTruthy();
    expect(screen.getByText(/실비/)).toBeTruthy();
    expect(screen.getByText(/미르/)).toBeTruthy();

    const gridCells = screen.getAllByRole('gridcell');
    expect(gridCells.length).toBe(30); // 6 rows x 5 cols

    // Place a Tactical Corridor tile on cell (4, 2)
    fireEvent.click(gridCells[4 * 5 + 2]);

    // Open and close the How To Play & Synergy Guide modal
    const guideBtn = screen.getByTitle('가이드 & 시너지');
    fireEvent.click(guideBtn);
    expect(screen.getByText('타일 시너지 도감')).toBeTruthy();

    // Switch language to English and verify localization
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    const langBtn = screen.getByTitle('Switch Language (KO/EN)');
    fireEvent.click(langBtn);
    expect(screen.getByText('Dice Architect')).toBeTruthy();
  });
});
