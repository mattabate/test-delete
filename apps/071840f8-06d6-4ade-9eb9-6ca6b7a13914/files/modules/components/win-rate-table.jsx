import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';

export function WinRateTable({ rows }) {
  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Win rate by rep</div>
      <div className="text-xs text-gray-500">Share of closed deals (won or lost) that were won</div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.rep}>
              <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
              <TableCell className="text-right tabular-nums">{r.win_rate_pct}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
