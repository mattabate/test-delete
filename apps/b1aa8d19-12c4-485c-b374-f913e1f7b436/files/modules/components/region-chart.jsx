import { BarChart, Card, Skeleton, Button } from 'tremor';
import { usd } from '../lib/format.js';

export function RegionChart({ rows, loading, error, retry }) {
  return (
    <Card>
      <div className="text-sm font-semibold text-gray-900">Amount by region</div>
      <div className="mt-1 text-xs text-gray-500">Total deal amount, filtered by stage</div>
      {loading ? (
        <div role="status" aria-label="Loading chart">
          <Skeleton className="mt-4 h-60 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-4 h-60 flex flex-col items-start justify-center gap-3">
          <p className="text-sm text-gray-500">The chart could not be loaded.</p>
          <Button onClick={retry}>Retry</Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-4 h-60 flex items-center justify-center text-sm text-gray-500">
          No deals match this stage.
        </div>
      ) : (
        <BarChart
          data={rows}
          index="region"
          categories={['amount']}
          valueFormatter={usd}
          colors={['accent']}
          yAxisWidth={60}
          className="mt-6 h-60"
        />
      )}
    </Card>
  );
}
