import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const data = [
  { label: 'Alpha', value: 42 },
  { label: 'Beta', value: 68 },
  { label: 'Gamma', value: 31 },
  { label: 'Delta', value: 55 },
  { label: 'Epsilon', value: 77 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">simple bar chart demo</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Hard-coded values</h1>
      <p className="mt-1 text-sm text-gray-500">{today}</p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Five hard-coded values</div>
        <BarChart
          data={data}
          index="label"
          categories={['value']}
          className="mt-6"
        />
      </Card>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
