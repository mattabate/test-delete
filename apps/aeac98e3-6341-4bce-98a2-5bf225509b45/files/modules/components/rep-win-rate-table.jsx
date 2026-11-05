import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Card } from 'tremor';

function formatPercent(v) {
  return (v * 100).toFixed(1) + '%';
}

export function RepWinRateTable({ rows }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        win rate by rep
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Closed deals</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.rep}>
              <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
              <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPercent(r.winRate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
