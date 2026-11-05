import { useMemo } from "react";
import { BarList, Callout, Card } from "tremor";
import { compact, count } from "../lib/format.js";
import { useSnapshot } from "../hooks/use-snapshot.js";

function Readout({ label, value }) {
  return (
    <div className="ana-readout">
      <span className="ana-readout__label">{label}</span>
      <span className="ana-readout__value">{value}</span>
    </div>
  );
}

export function WarehouseKpis() {
  const { rows, loading, error } = useSnapshot("warehouse_summary");
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({ n: acc.n + Number(r.n ?? 0), amount: acc.amount + Number(r.amount ?? 0) }),
        { n: 0, amount: 0 },
      ),
    [rows],
  );
  const top = useMemo(
    () =>
      [...rows]
        .sort((a, b) => Number(b.n ?? 0) - Number(a.n ?? 0))
        .slice(0, 8)
        .map((r) => ({ name: String(r.category ?? "unknown"), value: Number(r.n ?? 0) })),
    [rows],
  );
  if (loading) {
    return <p className="text-sm text-gray-500">Loading the warehouse summary...</p>;
  }
  if (error) {
    return <Callout title="The warehouse summary could not load">{error}</Callout>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">The warehouse summary has no rows yet. Refresh the app to load it.</p>;
  }
  return (
    <div className="space-y-6">
      <div className="ana-readout-row">
        <Readout label="categories" value={count(rows.length)} />
        <Readout label="records" value={compact(totals.n)} />
        <Readout label="amount" value={compact(totals.amount)} />
      </div>
      <Card>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-gray-900">Largest categories</span>
          <span className="font-mono text-xs uppercase tracking-wide text-gray-500">records</span>
        </div>
        <BarList data={top} valueFormatter={count} className="mt-4" />
      </Card>
    </div>
  );
}
