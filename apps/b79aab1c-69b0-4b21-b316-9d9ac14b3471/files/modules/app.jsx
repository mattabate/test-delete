import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const today = dayjs().format('dddd, MMMM D, YYYY');

const data = [
  { label: 'A', value: 23 },
  { label: 'B', value: 47 },
  { label: 'C', value: 15 },
  { label: 'D', value: 62 },
  { label: 'E', value: 34 },
];

function App() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Smoke test app</h1>
      <p className="mt-1 text-sm text-gray-500">Today is {today}</p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Sample values</div>
        <BarChart
          className="mt-4"
          data={data}
          index="label"
          categories={['value']}
        />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
