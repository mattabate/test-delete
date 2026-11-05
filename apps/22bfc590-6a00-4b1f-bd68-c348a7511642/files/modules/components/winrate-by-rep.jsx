import {
  Card,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'tremor';

const percent = (v) =>
  Number.isFinite(v) ? `${(v * 100).toFixed(1)}%` : '--';

export function WinRateTable({ rows, loading, error, retry }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        win rate by rep
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Won / (Won + Lost) across closed deals.
      </div>
      {loading ? (
        <div role="status" aria-label="Loading win rate">
          <Skeleton className="mt-6 h-72 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6 flex h-72 flex-col items-center justify-center gap-3 text-sm text-gray-500">
          <p>This table could not load.</p>
          <button className="font-mono text-xs underline" onClick={retry}>
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex h-72 items-center justify-center text-sm text-gray-500">
          No closed deals to compute win rate from.
        </div>
      ) : (
        <Table className="mt-6">
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
                <TableCell className="text-right tabular-nums">{percent(r.winRate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
