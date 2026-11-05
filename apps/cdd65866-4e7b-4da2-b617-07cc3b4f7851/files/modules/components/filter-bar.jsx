import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from 'tremor';

export function FilterBar({ stages, stage, onStageChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">Stage</div>
        <Select value={stage} onValueChange={onStageChange}>
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
      </div>
      <Button variant="light" onClick={onReset}>Reset</Button>
    </div>
  );
}
