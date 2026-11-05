import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'tremor';

function formatPercent(v) {
  return (v * 100).toFixed(1) + '%';
}

export function WinRateTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rep</TableHead>
          <TableHead className="text-right">Won</TableHead>
          <TableHead className="text-right">Closed</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => (
          <TableRow key={r.rep}>
            <TableCell className="font-medium text-gray-900">{r.rep}</TableCell>
            <TableCell className="text-right tabular-nums">{r.won}</TableCell>
            <TableCell className="text-right tabular-nums">{r.closed}</TableCell>
            <TableCell className="text-right tabular-nums">{formatPercent(r.winRate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
