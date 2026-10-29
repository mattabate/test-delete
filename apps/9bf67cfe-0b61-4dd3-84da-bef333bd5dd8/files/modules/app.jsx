import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, BarChart } from 'tremor';
import { useSource } from './hooks/use-source.js';

function App() {
  const { rows, loading, error } = useSource('smoke');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">smoke 1.3.27</div>
      <h1 className="text-lg font-semibold text-gray-900 mt-2">Smoke 1.3.27 lemur</h1>
      {loading ? (
        <p className="text-sm text-gray-500 mt-4">Loading...</p>
      ) : error ? (
        <p className="text-sm text-gray-500 mt-4">Could not load data.</p>
      ) : (
        <div className="space-y-8 mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>col</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono tabular-nums">{r.col}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <Card>
            <BarChart data={rows.map((r, i) => ({ row: 'row ' + i, col: r.col }))} index="row" categories={['col']} />
          </Card>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
