import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const data = [
  { label: 'A', value: 23 },
  { label: 'B', value: 47 },
  { label: 'C', value: 12 },
  { label: 'D', value: 58 },
  { label: 'E', value: 31 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Sanity check app</h1>
      <p className="mt-1 text-sm text-gray-500">Today is {today}</p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">5 hard-coded values</div>
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
