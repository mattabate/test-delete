import { Card, BarChart } from 'tremor';
import { usd } from '../lib/format.js';

export function RegionChart({ rows }) {
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-900">Amount by region</span>
        <span className="font-mono text-xs uppercase tracking-wide text-gray-500">
          {rows.length} region{rows.length === 1 ? '' : 's'}
        </span>
      </div>
      <BarChart
        data={rows}
        index="region"
        categories={['amount']}
        valueFormatter={usd}
        colors={['accent']}
        className="mt-6 h-72"
        yAxisWidth={70}
      />
    </Card>
  );
}
