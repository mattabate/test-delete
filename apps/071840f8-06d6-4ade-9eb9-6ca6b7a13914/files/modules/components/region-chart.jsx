import { BarChart, Card } from 'tremor';
import { compactCurrency } from '../lib/format.js';

export function RegionChart({ rows }) {
  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Amount by region</div>
      <div className="text-xs text-gray-500">Total deal amount, filtered by stage</div>
      <BarChart
        data={rows}
        index="region"
        categories={['amount']}
        valueFormatter={compactCurrency}
        colors={['accent']}
        className="mt-6 h-72"
      />
    </Card>
  );
}
