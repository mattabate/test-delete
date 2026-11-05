import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import { BarChart, Card } from 'tremor';

const data = [
  { label: 'Alpha', value: 12 },
  { label: 'Bravo', value: 27 },
  { label: 'Charlie', value: 18 },
  { label: 'Delta', value: 34 },
  { label: 'Echo', value: 9 },
];

function App() {
  const today = dayjs().format('dddd, MMMM D, YYYY');
  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="ana-kicker">dayjs + tremor demo</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">Sample bar chart</h1>
      <p className="mt-1 text-sm text-gray-500">Rendered on {today}</p>
      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Five sample values</div>
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
