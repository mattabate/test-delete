import { createRoot } from 'react-dom/client';
import { Card, BarChart, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from 'tremor';
import { useSource } from './hooks/use-source.js';

function App() {
  const { rows, loading, error, retry } = useSource('smoke_rows');
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">smoke 1.3.27 lemur</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-2">Smoke test app</h1>
      {loading ? (
        <Skeleton className="mt-4 h-40 w-full" />
      ) : error ? (
        <div role="alert" className="mt-4">
          <p>Data could not be loaded.</p>
          <button onClick={retry}>Retry</button>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          <Card>
            <div className="font-mono text-xs uppercase tracking-wide text-gray-500">rows</div>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead className="text-right">Test col</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-gray-900">{r.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.test_col}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Card>
            <div className="font-mono text-xs uppercase tracking-wide text-gray-500">chart</div>
            <BarChart data={rows} index="label" categories={['test_col']} className="mt-4" />
          </Card>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
