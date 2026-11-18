import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Button, Callout, Card } from "tremor";
import { count, stamp } from "../lib/format.js";
import { useSnapshot } from "../hooks/use-snapshot.js";

function tierFor(visits, tiers) {
  let best = "bronze";
  for (const t of tiers) {
    if (visits >= Number(t.min_visits ?? 0)) best = String(t.tier);
  }
  return best;
}

export function VisitsPanel() {
  const { rows: tierRows } = useSnapshot("reference_tiers");
  const tiers = useMemo(() => [...tierRows].sort((a, b) => a.min_visits - b.min_visits), [tierRows]);
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [available, setAvailable] = useState(false);

  const load = useCallback(async () => {
    const rows = await ana.compute.run("app_db_stats", {});
    setStats(Array.isArray(rows) && rows.length ? rows[0] : null);
  }, []);

  useEffect(() => {
    if (!ana.compute.available) return;
    setAvailable(true);
    load().catch((e) => setError(String(e.message || e)));
  }, [load]);

  const record = async () => {
    setBusy(true);
    setError(null);
    try {
      await ana.compute.run("record_visit", { note: "Recorded from the app", source: "ui" });
      await load();
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const visits = Number(stats?.visits ?? 0);
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-900">Visit log</span>
        {stats ? <Badge variant="neutral">{tierFor(visits, tiers)} tier</Badge> : null}
        <Button className="ml-auto" variant="primary" disabled={!available || busy} onClick={record}>
          {busy ? "Recording..." : "Record a visit"}
        </Button>
      </div>
      {!available ? <p className="mt-4 text-sm text-gray-500">Open this app to record visits.</p> : null}
      {error ? (
        <Callout title="The visit log could not be updated" className="mt-4">
          {error}
        </Callout>
      ) : null}
      {stats ? (
        <div className="ana-readout-row mt-4">
          <div className="ana-readout ana-readout--run">
            <span className="ana-readout__label">visits</span>
            <span className="ana-readout__value">{count(visits)}</span>
          </div>
          <div className="ana-readout">
            <span className="ana-readout__label">daily heartbeats</span>
            <span className="ana-readout__value">{count(stats.heartbeats)}</span>
          </div>
          <div className="ana-readout">
            <span className="ana-readout__label">last heartbeat</span>
            <span className="ana-readout__value">{stamp(stats.last_heartbeat)}</span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
