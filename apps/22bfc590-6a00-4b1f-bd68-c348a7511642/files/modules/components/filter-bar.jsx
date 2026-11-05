import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'tremor';

export function FilterBar({ stage, onStageChange, stages }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
        filter
      </span>
      <Select value={stage} onValueChange={onStageChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All stages</SelectItem>
          {stages.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
