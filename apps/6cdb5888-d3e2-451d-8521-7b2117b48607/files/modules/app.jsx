import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const today = dayjs().format('dddd, MMMM D, YYYY');

const data = [
  { label: 'A', value: 12 },
  { label: 'B', value: 28 },
  { label: 'C', value: 19 },
  { label: 'D', value: 35 },
  { label: 'E', value: 22 },
];

function App() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Smoke test</h1>
      <Card className="mt-6">
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500">today</div>
        <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{today}</div>
      </Card>
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
