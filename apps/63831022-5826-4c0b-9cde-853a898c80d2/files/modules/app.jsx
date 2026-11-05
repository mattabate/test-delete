import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const today = dayjs().format('dddd, MMMM D, YYYY');

const data = [
  { label: 'A', value: 12 },
  { label: 'B', value: 28 },
  { label: 'C', value: 19 },
  { label: 'D', value: 34 },
  { label: 'E', value: 22 },
];

function App() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Sample data app</h1>
      <p className="mt-1 text-sm text-gray-500">Today's date: {today}</p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Sample values</div>
        <BarChart
          data={data}
          index="label"
          categories={['value']}
          className="mt-4 h-72"
        />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
