import type { Player } from '@sidelinereel/shared';
import { playerLabel } from '../../../lib/format';
import { Select } from '../../atoms';

interface PlayerPickerProps {
  label: string;
  roster: Player[];
  value: number | null;
  onChange: (number: number | null) => void;
  placeholder?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}

export function PlayerPicker({
  label,
  roster,
  value,
  onChange,
  placeholder,
  hideLabel,
  disabled,
}: PlayerPickerProps) {
  return (
    <Select
      label={label}
      hideLabel={hideLabel}
      disabled={disabled}
      placeholder={placeholder}
      options={roster.map((p) => ({ value: String(p.number), label: playerLabel(p) }))}
      value={value === null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
    />
  );
}
