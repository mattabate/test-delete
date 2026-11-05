import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { Card, BarChart } from 'tremor';

const data = [
  { label: 'Alpha', value: 12 },
  { label: 'Beta', value: 19 },
  { label: 'Gamma', value: 7 },
  { label: 'Delta', value: 24 },
  { label: 'Epsilon', value: 15 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">[ ch.01 · automation test 1.4.1 ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Refinery automation test</h1>
      <p className="mt-1 text-sm text-gray-500">Current date: <span className="font-mono">{today}</span></p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Five hard-coded values</div>
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
