import { createRoot } from 'react-dom/client';
import { Card, BarChart, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton } from 'tremor';
import { useSource } from './hooks/use-source.js';

function App() {
  const state = useSource('tables_by_schema');
  const rows = state.rows || [];
  const loading = state.loading;
  const error = state.error;

  const counts = {};
  rows.forEach((r) => {
    counts[r.table_schema] = (counts[r.table_schema] || 0) + 1;
  });
  const chartData = Object.keys(counts).map((k) => ({ schema: k, tables: counts[k] }));

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">smoke 1.3.27 lemur</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-2">Smoke test data app</h1>
      {loading ? (
        <div role="status" aria-label="Loading"><Skeleton className="mt-4 h-60 w-full" /></div>
      ) : error ? (
        <div role="alert" className="mt-4 text-sm text-red-600">Failed to load data.</div>
      ) : (
        <div className="mt-6 space-y-8">
          <Card>
            <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Tables per schema</div>
            <BarChart data={chartData} index="schema" categories={['tables']} className="mt-4 h-60" />
          </Card>
          <Card>
            <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Table list</div>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Schema</TableHead>
                  <TableHead>Table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.table_schema}</TableCell>
                    <TableCell>{r.table_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
