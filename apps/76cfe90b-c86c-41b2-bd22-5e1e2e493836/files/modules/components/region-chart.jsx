import { BarChart, Card, Skeleton, Callout, Button } from 'tremor';
import { compactCurrency } from '../lib/format.js';

export function RegionChart({ rows, loading, error, retry }) {
  if (loading) {
    return (
      <div role="status" aria-label="Loading deals">
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <Callout title="Deals could not be loaded" variant="error">
        <p className="mb-2">{String(error.message || error)}</p>
        <Button onClick={retry} variant="secondary">Retry</Button>
      </Callout>
    );
  }
  if (!rows.length) {
    return (
      <Card>
        <p className="text-sm text-gray-500">No deals match this stage.</p>
      </Card>
    );
  }
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        total amount by region
      </div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">
        {compactCurrency(total)}
      </div>
      <BarChart
        data={rows}
        index="region"
        categories={['amount']}
        valueFormatter={compactCurrency}
        className="mt-6 h-72"
        yAxisWidth={60}
      />
    </Card>
  );
}
