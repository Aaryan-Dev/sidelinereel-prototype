import type { SeedGame } from '../repositories/types';

/**
 * A fictional U12 game. The clips mirror the failures in the support tickets:
 *  - #4 wearing the shirt, read as #14 (Ridgeline)
 *  - #11 read as #1 (Cobblestone)
 *  - #14 read as #41, swapped digits (Brightwater)
 * plus a low-confidence read, a number not on the roster, a correct read that still gets
 * flagged because similar numbers exist, and one confident wrong match that slips through.
 */
export const demoGame: SeedGame = {
  players: [
    { number: 1, name: 'Maya Park' },
    { number: 4, name: 'Sofia Rivera' },
    { number: 5, name: 'Jordan Lee' },
    { number: 7, name: 'Ava Chen' },
    { number: 8, name: 'Nora Brooks' },
    { number: 9, name: 'Lila Ortiz' },
    { number: 11, name: 'Mia Patel' },
    { number: 14, name: 'Lucy Grant' },
    { number: 23, name: 'Ella Novak' },
    { number: 41, name: 'Ruby Shah' },
  ],
  clips: [
    { minute: 4, moment: 'Goal', detected: 14, confidence: 0.81, frameNumber: 4 },
    { minute: 8, moment: 'Goal', detected: 7, confidence: 0.97, frameNumber: 7 },
    { minute: 12, moment: 'Save', detected: 1, confidence: 0.91, frameNumber: 11 },
    { minute: 15, moment: 'Save', detected: 5, confidence: 0.95, frameNumber: 5 },
    { minute: 19, moment: 'Goal', detected: 41, confidence: 0.93, frameNumber: 14 },
    { minute: 22, moment: 'Big play', detected: 8, confidence: 0.93, frameNumber: 8 },
    { minute: 27, moment: 'Big play', detected: 4, confidence: 0.96, frameNumber: 4 },
    { minute: 31, moment: 'Assist', detected: 9, confidence: 0.62, frameNumber: 9 },
    { minute: 35, moment: 'Goal', detected: 32, confidence: 0.88, frameNumber: 23 },
    { minute: 38, moment: 'Goal', detected: 23, confidence: 0.9, frameNumber: 23 },
    { minute: 44, moment: 'Save', detected: 5, confidence: 0.92, frameNumber: 5 },
    // A confident wrong match: #7 read as #9. The system accepts it, so only a parent can catch it.
    { minute: 49, moment: 'Goal', detected: 9, confidence: 0.92, frameNumber: 7 },
  ],
};
