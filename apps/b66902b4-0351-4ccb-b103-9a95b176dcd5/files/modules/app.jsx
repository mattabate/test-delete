import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const data = [
  { label: 'A', value: 12 },
  { label: 'B', value: 28 },
  { label: 'C', value: 19 },
  { label: 'D', value: 35 },
  { label: 'E', value: 22 },
];

function App() {
  const today = dayjs().format('YYYY-MM-DD HH:mm:ss');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <div className="mt-4 font-mono text-sm text-gray-500">
        rendered at <span className="text-gray-900">{today}</span>
      </div>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Hard-coded values</div>
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
