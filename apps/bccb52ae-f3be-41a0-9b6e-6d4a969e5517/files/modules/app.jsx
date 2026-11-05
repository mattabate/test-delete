import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const data = [
  { label: 'A', value: 12 },
  { label: 'B', value: 19 },
  { label: 'C', value: 7 },
  { label: 'D', value: 24 },
  { label: 'E', value: 15 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY HH:mm');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Sanity check app</h1>
      <p className="mt-1 text-sm text-gray-500">Current date: <span className="font-mono">{today}</span></p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Five hard-coded values</div>
        <BarChart
          data={data}
          index="label"
          categories={['value']}
          className="mt-4 h-60"
        />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
