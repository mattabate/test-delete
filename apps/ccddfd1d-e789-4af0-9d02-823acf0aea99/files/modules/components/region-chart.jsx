import { BarChart, Card } from 'tremor';
import { compactCurrency, currency } from '../lib/format.js';

export function RegionChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        amount by region
      </div>
      <div className="mt-2 flex items-baseline gap-2.5">
        <span className="font-mono text-3xl tabular-nums text-gray-900">
          {compactCurrency(total)}
        </span>
        <span className="text-xs text-gray-500">total filtered amount</span>
      </div>
      <BarChart
        data={data}
        index="region"
        categories={['amount']}
        valueFormatter={currency}
        colors={['accent']}
        className="mt-6 h-72"
        yAxisWidth={70}
      />
    </Card>
  );
}
