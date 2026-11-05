import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const data = [
  { label: 'Item A', value: 12 },
  { label: 'Item B', value: 28 },
  { label: 'Item C', value: 19 },
  { label: 'Item D', value: 35 },
  { label: 'Item E', value: 22 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Smoke test app</h1>
      <p className="mt-1 text-sm text-gray-500">{today}</p>
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
