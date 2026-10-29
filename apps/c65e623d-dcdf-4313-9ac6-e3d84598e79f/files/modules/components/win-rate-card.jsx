import { Card } from 'tremor';
import { WinRateTable } from './win-rate-table.jsx';

export function WinRateCard({ data }) {
  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Win rate by rep</div>
      <div className="text-xs text-gray-500">
        Based on closed (won or lost) deals
      </div>
      <WinRateTable data={data} />
    </Card>
  );
}
