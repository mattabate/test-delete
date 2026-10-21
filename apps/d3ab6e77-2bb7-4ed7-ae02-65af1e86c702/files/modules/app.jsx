import { createRoot } from 'react-dom/client';
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, BarChart } from 'tremor';

function App() {
  const rows = ana.data.get('smoke');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">smoke test</div>
      <h1 className="text-lg font-semibold mt-2">Smoke 1.3.27 lemur</h1>
      <Card className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>test_col</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.test_col}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card className="mt-6">
        <BarChart data={rows} index="test_col" categories={["test_col"]} />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
