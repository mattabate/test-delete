import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';

function winRateByRep(deals) {
  const closed = new Map();
  for (const d of deals) {
    if (d.stage !== 'Closed Won' && d.stage !== 'Closed Lost') continue;
    const entry = closed.get(d.rep) || { won: 0, total: 0 };
    entry.total += 1;
    if (d.stage === 'Closed Won') entry.won += 1;
    closed.set(d.rep, entry);
  }
  return Array.from(closed.entries())
    .map(([rep, { won, total }]) => ({
      rep,
      won,
      total,
      winRate: total > 0 ? won / total : 0,
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

export function WinRateTable({ deals }) {
  const rows = winRateByRep(deals);
  return (
    <Card>
      <div className="text-sm font-medium text-gray-700">Win rate by rep</div>
      {rows.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">No closed deals yet.</div>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Won</TableHead>
              <TableHead className="text-right">Closed</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.rep}>
                <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                <TableCell className="text-right tabular-nums">{r.total}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {(r.winRate * 100).toFixed(0)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
