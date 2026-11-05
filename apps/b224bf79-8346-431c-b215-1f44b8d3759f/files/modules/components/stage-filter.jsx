import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'tremor';

export function StageFilter({ stage, stages, onChange }) {
  return (
    <Select value={stage} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All stages" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All stages</SelectItem>
        {stages.map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
