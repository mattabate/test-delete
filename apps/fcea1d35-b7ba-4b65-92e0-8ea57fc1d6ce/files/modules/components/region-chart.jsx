import { Card, BarChart } from 'tremor';
import { compactCurrency } from '../lib/format.js';

export function RegionChart({ data }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        amount by region
      </div>
      <BarChart
        data={data}
        index="region"
        categories={['amount']}
        valueFormatter={compactCurrency}
        colors={['accent']}
        className="mt-6 h-72"
        yAxisWidth={60}
      />
    </Card>
  );
}
