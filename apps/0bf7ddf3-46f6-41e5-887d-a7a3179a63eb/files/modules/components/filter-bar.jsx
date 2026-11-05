import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from 'tremor';

export function FilterBar({ stage, stages, onChange, onReset }) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500 mb-1">
          stage
        </div>
        <Select value={stage} onValueChange={onChange}>
          <SelectTrigger className="w-44">
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
      {stage !== 'all' ? (
        <Button variant="light" onClick={onReset}>Reset</Button>
      ) : null}
    </div>
  );
}
