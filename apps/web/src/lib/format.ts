import type { ClipStatus, Player } from '@sidelinereel/shared';
import type { Tone } from '../components/atoms';

export const percent = (n: number) => `${Math.round(n * 100)}%`;

export const playerLabel = (p: Player) => `#${p.number} ${p.name}`;

export const findPlayer = (roster: Player[], number: number | null) =>
  number === null ? undefined : roster.find((p) => p.number === number);

export const STATUS_LABEL: Record<ClipStatus, { text: string; tone: Tone }> = {
  auto: { text: 'Auto-accepted', tone: 'success' },
  review: { text: 'Needs review', tone: 'warning' },
  confirmed: { text: 'Confirmed', tone: 'success' },
  reassigned: { text: 'Reassigned', tone: 'info' },
  excluded: { text: 'Excluded', tone: 'neutral' },
  reported: { text: 'Reported by parent', tone: 'danger' },
};

export const pluralize = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
