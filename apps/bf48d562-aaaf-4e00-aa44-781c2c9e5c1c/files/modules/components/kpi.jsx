import { Card } from 'tremor';

export function Kpi({ label, value, note }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {value === null ? '—' : value.toLocaleString('en-US')}
      </div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </Card>
  );
}
