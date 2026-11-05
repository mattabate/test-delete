import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'tremor';

const percent = (v) => (v * 100).toFixed(1) + '%';

export function WinRateTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rep</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.rep}>
            <TableCell className="font-medium text-gray-900">{row.rep}</TableCell>
            <TableCell className="text-right tabular-nums">{percent(row.winRate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
