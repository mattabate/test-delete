import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from 'tremor';
import { useSource } from './hooks/use-source.js';

const currency = (v) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

function aggregateByRegion(rows) {
  const totals = {};
  for (const row of rows) {
    const region = row.region;
    const amount = Number(row.amount) || 0;
    totals[region] = (totals[region] || 0) + amount;
  }
  return Object.entries(totals)
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function App() {
  const { rows: fetchedRows, loading, error, retry } = useSource('orders');
  const allRows = fetchedRows || [];
  const [product, setProduct] = useState('all');
  const products = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.product))).sort(),
    [allRows],
  );
  const rows = useMemo(
    () => (product === 'all' ? allRows : allRows.filter((r) => r.product === product)),
    [allRows, product],
  );
  const chartData = useMemo(() => aggregateByRegion(rows), [rows]);
  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
    [rows],
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">qa cache test · rc140</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Orders by region (edited)</h1>
      <p className="mt-1 text-sm text-gray-500">
        Synthetic dataset of 100 orders across region and product.
      </p>

      {!loading && !error ? (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-gray-500">Product</span>
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {loading ? (
        <div role="status" aria-label="Loading orders">
          <Skeleton className="mt-6 h-80 w-full" />
        </div>
      ) : error ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-500">Orders could not be loaded.</p>
          <button className="mt-2 text-sm text-indigo-600" onClick={retry}>
            Retry
          </button>
        </Card>
      ) : (
        <>
          <div className="ana-figure ana-brackets mt-6">
            <span className="ana-figure__label">total order value</span>
            <div className="ana-figure__value">{currency(total)}</div>
            <span className="ana-figure__note">{rows.length} orders across {chartData.length} regions</span>
          </div>

          <Card className="mt-6">
            <div className="text-sm font-medium text-gray-900">Amount by region</div>
            <BarChart
              data={chartData}
              index="region"
              categories={['amount']}
              valueFormatter={currency}
              className="mt-4 h-72"
            />
          </Card>
        </>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
