import { useMemo } from "react";
import { AreaChart, Callout, Card } from "tremor";
import { count, dayLabel } from "../lib/format.js";
import { useSnapshot } from "../hooks/use-snapshot.js";

export function UsageTrend() {
  const { rows, loading, error } = useSnapshot("usage_daily");
  const data = useMemo(() => rows.map((r) => ({ day: dayLabel(r.day), chats: Number(r.chats ?? 0) })), [rows]);
  const total = useMemo(() => data.reduce((s, r) => s + r.chats, 0), [data]);
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">chats started, last 30 days</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{count(total)}</div>
      {loading ? <p className="mt-4 text-sm text-gray-500">Loading usage...</p> : null}
      {error ? (
        <Callout title="Usage could not load" className="mt-4">
          {error}
        </Callout>
      ) : null}
      {loading || error ? null : data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No chats in the last 30 days.</p>
      ) : (
        <AreaChart data={data} index="day" categories={["chats"]} valueFormatter={count} className="mt-6 h-60" />
      )}
    </Card>
  );
}
