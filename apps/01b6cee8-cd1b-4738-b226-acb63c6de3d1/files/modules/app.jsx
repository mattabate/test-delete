import { createRoot } from 'react-dom/client';
import { BarChart, Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { useSource } from './hooks/use-source.js';

function App() {
  const { rows, loading, error } = useSource('smoke');
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">smoke test 1.3.27</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-2">Smoke 1.3.27 lemur</h1>
      {loading ? (
        <p className="text-sm text-gray-500 mt-4">Loading...</p>
      ) : error ? (
        <p className="text-sm text-red-600 mt-4">Error loading data.</p>
      ) : (
        <div className="mt-6 space-y-8">
          <Card>
            <BarChart data={rows} index="table_name" categories={[ 'columns' ]} />
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead className="text-right">Columns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.table_name}>
                    <TableCell className="font-medium text-gray-900">{r.table_name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.columns}</TableCell>
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
