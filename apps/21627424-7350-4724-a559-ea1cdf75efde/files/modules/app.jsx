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
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">date and chart demo</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">{today}</h1>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Sample values</div>
        <BarChart
          data={data}
          index="label"
          categories={['value']}
          className="mt-6 h-60"
        />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
