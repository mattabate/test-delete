import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';

function winRateByRep(rows) {
  const totals = new Map();
  for (const r of rows) {
    if (r.stage !== 'Closed Won' && r.stage !== 'Closed Lost') continue;
    const entry = totals.get(r.rep) || { won: 0, closed: 0 };
    entry.closed += 1;
    if (r.stage === 'Closed Won') entry.won += 1;
    totals.set(r.rep, entry);
  }
  return Array.from(totals.entries())
    .map(([rep, { won, closed }]) => ({ rep, won, closed, winRate: closed > 0 ? (won / closed) * 100 : 0 }))
    .sort((a, b) => b.winRate - a.winRate);
}

export function WinRateTable({ rows }) {
  const data = winRateByRep(rows);
  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Win rate by rep</div>
      <div className="text-xs text-gray-500 mt-1">Closed won vs. closed lost deals, filtered by stage</div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Closed deals</TableHead>
            <TableHead className="text-right">Won</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell className="text-sm text-gray-500">No closed deals for this stage.</TableCell>
            </TableRow>
          ) : (
            data.map((d) => (
              <TableRow key={d.rep}>
                <TableCell className="font-medium text-gray-900">{d.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{d.closed}</TableCell>
                <TableCell className="text-right tabular-nums">{d.won}</TableCell>
                <TableCell className="text-right tabular-nums">{d.winRate.toFixed(1)}%</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
