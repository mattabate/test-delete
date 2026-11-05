import { BarChart, Card } from 'tremor';
import { compactCurrency, currency } from '../lib/format.js';

export function RegionChart({ rows }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        amount by region
      </div>
      <BarChart
        data={rows}
        index="region"
        categories={['amount']}
        valueFormatter={compactCurrency}
        colors={['accent']}
        yAxisWidth={60}
        className="mt-6 h-72"
      />
    </Card>
  );
}
