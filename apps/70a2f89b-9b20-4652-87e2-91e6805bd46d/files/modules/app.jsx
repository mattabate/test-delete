import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const data = [
  { category: 'A', value: 12 },
  { category: 'B', value: 19 },
  { category: 'C', value: 7 },
  { category: 'D', value: 15 },
  { category: 'E', value: 10 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">refinery automation test 1.4.1</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Sample data app</h1>
      <p className="mt-1 text-sm text-gray-500">Today is {today}</p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Five hard-coded values</div>
        <BarChart
          data={data}
          index="category"
          categories={['value']}
          className="mt-6"
        />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
