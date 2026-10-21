import { createRoot } from 'react-dom/client';
import { Card, BarChart, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';

const rows = ana.data.get('currencies');

const pct = (v) => v.toFixed(1) + '%';
const signedPp = (v) => (v > 0 ? '+' : '') + v.toFixed(1) + ' pp';

function Hero() {
  const top = rows[0] ?? { code: '--', share_2025: 0 };
  return (
    <div>
      <div className="ana-kicker">[ fx markets · 2025 triennial survey ]</div>
      <h1 className="ana-headline mt-3">
        The dollar still runs <span className="ana-headline__accent">the world's trades</span>
      </h1>
      <p className="mt-3 max-w-xl text-base text-gray-600">
        Five currencies sit on one side of nearly every foreign-exchange trade on
        earth. Shares are measured as the percent of global FX turnover each
        currency touches, so they sum to 200% across all currencies (every trade
        has two sides).
      </p>
      <div className="ana-readout-row mt-6">
        <div className="ana-readout">
          <span className="ana-readout__label">source</span>
          <span className="ana-readout__value">BIS triennial survey</span>
        </div>
        <div className="ana-readout">
          <span className="ana-readout__label">survey window</span>
          <span className="ana-readout__value">April 2025</span>
        </div>
        <div className="ana-readout">
          <span className="ana-readout__label">currencies ranked</span>
          <span className="ana-readout__value">{rows.length}</span>
        </div>
        <div className="ana-readout ana-readout--run">
          <span className="ana-readout__label">leader</span>
          <span className="ana-readout__value">{top.code} · {pct(top.share_2025)}</span>
        </div>
      </div>
    </div>
  );
}

function ShareChart() {
  const chartData = rows.map((r) => ({ currency: r.code + ' — ' + r.name, share: r.share_2025 }));
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        share of global fx turnover, april 2025
      </div>
      <div className="mt-1 text-sm text-gray-600">
        Percent of trades with this currency on one side.
      </div>
      <BarChart
        data={chartData}
        index="currency"
        categories={['share']}
        valueFormatter={pct}
        layout="vertical"
        colors={['accent']}
        className="mt-6 h-72"
        showLegend={false}
        yAxisWidth={170}
      />
    </Card>
  );
}

function RankingTable() {
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-gray-900">Top 5 traded currencies</div>
        <div className="font-mono text-xs uppercase tracking-wide text-gray-500">vs. 2022 survey</div>
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">2025 share</TableHead>
            <TableHead className="text-right">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.code}>
              <TableCell className="font-mono tabular-nums text-gray-500">{r.rank}</TableCell>
              <TableCell className="font-medium text-gray-900">{r.code} — {r.name}</TableCell>
              <TableCell className="text-gray-500">{r.region}</TableCell>
              <TableCell className="text-right font-mono tabular-nums text-gray-900">{pct(r.share_2025)}</TableCell>
              <TableCell className="text-right">
                <Badge variant={r.change_pp >= 0 ? 'success' : 'error'}>{signedPp(r.change_pp)}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function ClosingNote() {
  return (
    <div className="ana-terminal">
      <div className="ana-terminal__head">ana // closing-note</div>
      <div className="ana-terminal__line">
        the top five currencies alone account for over 150 percentage points of
        global fx turnover share — concentration that has barely moved in a decade.
      </div>
      <div className="ana-terminal__line">
        sterling is the one currency losing meaningful ground, while the renminbi
        keeps climbing toward the pound's old rank.
      </div>
      <div className="ana-terminal__attrib">source: BIS triennial central bank survey, April 2025</div>
    </div>
  );
}

function App() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <Hero />
      <div className="ana-gutter my-10" />
      <div className="grid grid-cols-1 gap-6">
        <ShareChart />
        <RankingTable />
      </div>
      <div className="mt-10">
        <ClosingNote />
      </div>
      <div className="mt-10 border-t border-gray-200 pt-6 font-mono text-xs uppercase tracking-widest text-gray-500">
        [ data curated from BIS triennial survey, released 2025-09-30 ]
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
