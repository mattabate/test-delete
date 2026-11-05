import { createRoot } from 'react-dom/client';
import { Card, BarChart } from 'tremor';
import dayjs from 'dayjs';

const data = [
  { label: 'A', value: 24 },
  { label: 'B', value: 58 },
  { label: 'C', value: 37 },
  { label: 'D', value: 82 },
  { label: 'E', value: 15 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Test data app</h1>
      <p className="text-sm text-gray-500">{today}</p>
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
