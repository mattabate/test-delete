import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';

export function WinRateTable({ rows }) {
  const closed = rows.filter((r) => r.stage === 'Closed Won' || r.stage === 'Closed Lost');
  const totals = {};
  for (const r of closed) {
    if (!totals[r.rep]) totals[r.rep] = { won: 0, total: 0 };
    totals[r.rep].total += 1;
    if (r.stage === 'Closed Won') totals[r.rep].won += 1;
  }
  const data = Object.entries(totals)
    .map(([rep, t]) => ({ rep, winRate: t.total ? (t.won / t.total) * 100 : 0, closedDeals: t.total }))
    .sort((a, b) => b.winRate - a.winRate);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rep</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
          <TableHead className="text-right">Closed deals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((d) => (
          <TableRow key={d.rep}>
            <TableCell className="font-medium text-gray-900">{d.rep}</TableCell>
            <TableCell className="text-right tabular-nums">{d.winRate.toFixed(1)}%</TableCell>
            <TableCell className="text-right tabular-nums">{d.closedDeals}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
