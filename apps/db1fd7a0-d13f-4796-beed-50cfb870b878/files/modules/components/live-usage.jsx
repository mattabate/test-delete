import { useEffect, useState } from "react";
import { BarChart, Callout, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "tremor";
import { count, dayLabel } from "../lib/format.js";

const WINDOWS = ["7", "30", "90"];

export function LiveUsage() {
  const [days, setDays] = useState("7");
  const [state, setState] = useState({ status: "idle", rows: [], error: null });

  useEffect(() => {
    if (!ana.compute.available) {
      setState({ status: "unavailable", rows: [], error: null });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading", error: null }));
    ana.compute
      .run("live_usage", { days: Number(days) })
      .then((rows) => {
        if (!cancelled) setState({ status: "ready", rows: Array.isArray(rows) ? rows : [], error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ status: "error", rows: [], error: String(e.message || e) });
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const data = state.rows.map((r) => ({ day: dayLabel(r.day), cells: Number(r.cells ?? 0) }));
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-900">Cells run per day</span>
        {state.status === "ready" ? (
          <span className="ana-tag ana-tag--live">
            <span className="ana-tag__dot" />
            live
          </span>
        ) : null}
        <div className="ml-auto">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Window" />
            </SelectTrigger>
            <SelectContent>
              {WINDOWS.map((w) => (
                <SelectItem key={w} value={w}>
                  Last {w} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {state.status === "unavailable" ? (
        <p className="mt-4 text-sm text-gray-500">Open this app to query live usage.</p>
      ) : null}
      {state.status === "loading" ? <p className="mt-4 text-sm text-gray-500">Querying usage...</p> : null}
      {state.status === "error" ? (
        <Callout title="The live query failed" className="mt-4">
          {state.error}
        </Callout>
      ) : null}
      {state.status === "ready" ? (
        <BarChart data={data} index="day" categories={["cells"]} valueFormatter={count} className="mt-6 h-60" />
      ) : null}
    </Card>
  );
}
