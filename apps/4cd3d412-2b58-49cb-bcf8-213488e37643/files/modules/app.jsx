import { createRoot } from 'react-dom/client';
import { Card, BarChart, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';

function App() {
  const rows = ana.data.get('smoke');
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="ana-kicker">smoke test 1.3.27</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-2">Smoke test dataframe</h1>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <div className="text-sm font-medium text-gray-900 mb-4">Table</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>name</TableHead>
                <TableHead className="text-right">test_col</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium text-gray-900">{r.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.test_col}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-900 mb-4">Chart</div>
          <BarChart data={rows} index="name" categories={['test_col']} />
        </Card>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
