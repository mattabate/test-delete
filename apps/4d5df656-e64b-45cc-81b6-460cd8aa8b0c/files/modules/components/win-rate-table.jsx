import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';

function formatRate(rate) {
  return (rate * 100).toFixed(1) + '%';
}

export function WinRateTable({ rows }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-900">Win rate by rep</span>
        <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
          {rows.length} rep{rows.length === 1 ? '' : 's'}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Share of closed deals (Closed Won vs Closed Lost) won by each rep.
      </p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No decided deals yet.</p>
      ) : (
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead className="text-right">Won</TableHead>
              <TableHead className="text-right">Lost</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.rep}>
                <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
                <TableCell className="text-right tabular-nums">{r.won}</TableCell>
                <TableCell className="text-right tabular-nums">{r.lost}</TableCell>
                <TableCell className="text-right tabular-nums">{formatRate(r.rate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
