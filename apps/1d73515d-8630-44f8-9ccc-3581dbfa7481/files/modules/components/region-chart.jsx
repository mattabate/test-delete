import { BarChart, Card } from 'tremor';
import { usd } from '../lib/format.js';

export function RegionChart({ data }) {
  return (
    <Card>
      <div className="text-sm font-medium text-gray-700">Amount by region</div>
      {data.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">No deals match the selected stage.</div>
      ) : (
        <BarChart
          data={data}
          index="region"
          categories={['amount']}
          valueFormatter={usd}
          colors={['accent']}
          className="mt-6 h-72"
          yAxisWidth={70}
        />
      )}
    </Card>
  );
}
