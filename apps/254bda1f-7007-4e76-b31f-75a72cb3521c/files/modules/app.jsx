import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { BarChart, Card } from 'tremor';

const data = [
  { label: 'A', value: 12 },
  { label: 'B', value: 19 },
  { label: 'C', value: 7 },
  { label: 'D', value: 24 },
  { label: 'E', value: 15 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <div className="mt-4 font-mono text-xs uppercase tracking-wide text-gray-500">
        Today's date
      </div>
      <div className="mt-1 text-lg font-medium text-gray-900">{today}</div>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Sample values</div>
        <BarChart
          data={data}
          index="label"
          categories={['value']}
          className="mt-4"
        />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
