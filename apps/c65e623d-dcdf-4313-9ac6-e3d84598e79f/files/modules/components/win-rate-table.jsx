import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'tremor';

const pct = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(v);

export function WinRateTable({ data }) {
  if (data.length === 0) {
    return (
      <div className="mt-6 text-sm text-gray-500">
        No closed deals to compute win rate.
      </div>
    );
  }
  return (
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
        {data.map((r) => (
          <TableRow key={r.rep}>
            <TableCell className="font-medium text-gray-900">
              {r.rep}
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.won}</TableCell>
            <TableCell className="text-right tabular-nums">
              {r.closed}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {pct(r.winRate)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
