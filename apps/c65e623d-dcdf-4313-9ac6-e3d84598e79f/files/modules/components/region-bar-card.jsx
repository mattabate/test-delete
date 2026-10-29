import { BarChart, Card } from 'tremor';
import { compactUsd, usd } from '../lib/format.js';

export function RegionBarCard({ data }) {
  const total = data.reduce((sum, r) => sum + r.amount, 0);
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm font-medium text-gray-900">
            Amount by region
          </div>
          <div className="text-xs text-gray-500">
            Total: {usd(total)}
          </div>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">
          No deals match this filter.
        </div>
      ) : (
        <BarChart
          data={data}
          index="region"
          categories={['amount']}
          valueFormatter={compactUsd}
          colors={['accent']}
          className="mt-6 h-72"
          showLegend={false}
        />
      )}
    </Card>
  );
}
