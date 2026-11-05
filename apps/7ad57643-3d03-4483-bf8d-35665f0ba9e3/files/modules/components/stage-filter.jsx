import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'tremor';

export function StageFilter({ stages, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Filter by stage" />
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
