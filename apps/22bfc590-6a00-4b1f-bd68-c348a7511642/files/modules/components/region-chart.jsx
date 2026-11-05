import { BarChart, Card, Skeleton } from 'tremor';
import { compactUsd } from '../lib/format.js';

export function RegionChart({ rows, loading, error, retry, stage }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        amount by region
      </div>
      <div className="mt-1 text-sm text-gray-500">
        {stage === 'All' ? 'All stages' : `Stage: ${stage}`}
      </div>
      {loading ? (
        <div role="status" aria-label="Loading chart">
          <Skeleton className="mt-6 h-72 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6 flex h-72 flex-col items-center justify-center gap-3 text-sm text-gray-500">
          <p>This chart could not load.</p>
          <button className="font-mono text-xs underline" onClick={retry}>
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex h-72 items-center justify-center text-sm text-gray-500">
          No deals match this filter.
        </div>
      ) : (
        <BarChart
          data={rows}
          index="region"
          categories={['amount']}
          colors={['accent']}
          valueFormatter={compactUsd}
          showLegend={false}
          className="mt-6 h-72"
        />
      )}
    </Card>
  );
}
