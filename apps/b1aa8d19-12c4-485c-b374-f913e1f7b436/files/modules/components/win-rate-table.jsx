import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton, Button, Card } from 'tremor';

function computeWinRates(rows) {
  const byRep = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const entry = byRep.get(r.rep) || { won: 0, lost: 0 };
    if (r.stage === 'Won') entry.won += 1;
    else entry.lost += 1;
    byRep.set(r.rep, entry);
  }
  return Array.from(byRep, ([rep, { won, lost }]) => ({
    rep,
    won,
    lost,
    total: won + lost,
    winRate: won + lost > 0 ? won / (won + lost) : 0,
  })).sort((a, b) => b.winRate - a.winRate);
}

const pct = (v) => (v * 100).toFixed(1) + '%';

export function WinRateTable({ rows, loading, error, retry }) {
  const data = computeWinRates(rows);
  return (
    <Card>
      <div className="text-sm font-semibold text-gray-900">Win rate by rep</div>
      <div className="mt-1 text-xs text-gray-500">Won / (Won + Lost) closed deals</div>
      {loading ? (
        <div role="status" aria-label="Loading win rate table">
          <Skeleton className="mt-4 h-60 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-4 h-60 flex flex-col items-start justify-center gap-3">
          <p className="text-sm text-gray-500">The table could not be loaded.</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      ) : data.length === 0 ? (
        <div className="mt-4 h-60 flex items-center justify-center text-sm text-gray-500">
          No closed deals yet.
        </div>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Won</TableHead>
              <TableHead className="text-right">Lost</TableHead>
              <TableHead className="text-right">Closed</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.rep}>
                <TableCell className="font-medium text-gray-900">{d.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{d.won}</TableCell>
                <TableCell className="text-right tabular-nums">{d.lost}</TableCell>
                <TableCell className="text-right tabular-nums">{d.total}</TableCell>
                <TableCell className="text-right tabular-nums">{pct(d.winRate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
