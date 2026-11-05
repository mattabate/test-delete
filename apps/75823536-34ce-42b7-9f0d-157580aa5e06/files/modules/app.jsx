import { createRoot } from 'react-dom/client';
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, BarChart, Skeleton } from 'tremor';
import { useSource } from './hooks/use-source.js';

function App() {
  const { rows, loading, error } = useSource('tables');
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">smoke 1.3.27 · lemur</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-2">Smoke test data app</h1>
      {loading ? (
        <Skeleton className="mt-4 h-40 w-full" />
      ) : error ? (
        <div role="alert" className="mt-4">Could not load tables.</div>
      ) : (
        <div className="space-y-8 mt-6">
          <Card>
            <div className="text-sm font-medium text-gray-900 mb-4">Reachable tables</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>schema</TableHead>
                  <TableHead>table</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.table_schema}</TableCell>
                    <TableCell className="font-medium text-gray-900">{r.table_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Card>
            <div className="text-sm font-medium text-gray-900 mb-4">Table name length</div>
            <BarChart
              data={rows.map((r) => ({ table: r.table_name, length: r.table_name.length }))}
              index="table"
              categories={['length']}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
