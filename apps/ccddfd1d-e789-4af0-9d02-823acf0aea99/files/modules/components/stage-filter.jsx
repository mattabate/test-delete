import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'tremor';

export function StageFilter({ stages, value, onValueChange }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Stage" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All stages</SelectItem>
        {stages.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
