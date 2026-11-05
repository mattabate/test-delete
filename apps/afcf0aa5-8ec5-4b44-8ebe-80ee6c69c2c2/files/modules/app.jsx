import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Card, Skeleton, Button } from 'tremor';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from 'tremor';
import { Tabs, TabsList, TabsTrigger, TabsContent } from 'tremor';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from 'tremor';
import { usd, compactUsd } from './lib/format.js';
import { useSource } from './hooks/use-source.js';

const STAGES = ['All', 'Won', 'Lost', 'Open'];

function StageFilter({ stage, onChange }) {
  return (
    <Select value={stage} onValueChange={onChange}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Stage" />
      </SelectTrigger>
      <SelectContent>
        {STAGES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RegionChart({ rows, stage }) {
  const filtered = useMemo(
    () => (stage === 'All' ? rows : rows.filter((r) => r.stage === stage)),
    [rows, stage],
  );

  const byRegion = useMemo(() => {
    const totals = new Map();
    for (const r of filtered) {
      totals.set(r.region, (totals.get(r.region) || 0) + Number(r.amount));
    }
    return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
      (a, b) => b.amount - a.amount,
    );
  }, [filtered]);

  const total = useMemo(
    () => byRegion.reduce((sum, r) => sum + r.amount, 0),
    [byRegion],
  );

  if (byRegion.length === 0) {
    return (
      <Card className="mt-6">
        <p className="text-sm text-gray-500">No deals match this filter.</p>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <div className="text-sm text-gray-500">
        Total amount by region{stage !== 'All' ? ` \u2014 stage: ${stage}` : ''}
      </div>
      <div className="mt-1 text-2xl font-semibold text-gray-900 font-mono tabular-nums">
        {usd(total)}
      </div>
      <BarChart
        data={byRegion}
        index="region"
        categories={['amount']}
        valueFormatter={compactUsd}
        className="mt-6 h-72"
        yAxisWidth={70}
      />
    </Card>
  );
}

function RepWinRateTable({ rows }) {
  const byRep = useMemo(() => {
    const stats = new Map();
    for (const r of rows) {
      const entry = stats.get(r.rep) || { rep: r.rep, won: 0, total: 0 };
      entry.total += 1;
      if (r.stage === 'Won') entry.won += 1;
      stats.set(r.rep, entry);
    }
    return Array.from(stats.values())
      .map((e) => ({ ...e, winRate: e.total ? e.won / e.total : 0 }))
      .sort((a, b) => b.winRate - a.winRate);
  }, [rows]);

  if (byRep.length === 0) {
    return (
      <Card className="mt-6">
        <p className="text-sm text-gray-500">No deals available.</p>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <div className="text-sm text-gray-500">Win rate by rep</div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Rep</TableHead>
            <TableHead className="text-right">Won</TableHead>
            <TableHead className="text-right">Total deals</TableHead>
            <TableHead className="text-right">Win rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {byRep.map((r) => (
            <TableRow key={r.rep}>
              <TableCell className="font-medium text-gray-900">
                {r.rep}
              </TableCell>
              <TableCell className="text-right tabular-nums">{r.won}</TableCell>
              <TableCell className="text-right tabular-nums">
                {r.total}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {(r.winRate * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function Shell() {
  const { rows, loading, refreshing, error, retry } = useSource('deals');
  const [stage, setStage] = useState('All');

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">sales deals</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Deal amount by region
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Filter by stage to see how the regional mix shifts.
          </p>
        </div>
        <StageFilter stage={stage} onChange={setStage} />
      </div>

      {refreshing ? (
        <p role="status" className="mt-2 text-sm text-gray-500">
          Updating\u2026
        </p>
      ) : null}

      {loading ? (
        <div role="status" aria-label="Loading deals">
          <Skeleton className="mt-6 h-80 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="mt-6">
          <p className="text-sm text-gray-500">Deals could not be loaded.</p>
          <Button className="mt-3" onClick={retry}>
            Retry
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="by-region" className="mt-6">
          <TabsList>
            <TabsTrigger value="by-region">By region</TabsTrigger>
            <TabsTrigger value="win-rate">Win rate by rep</TabsTrigger>
          </TabsList>
          <TabsContent value="by-region">
            <RegionChart rows={rows} stage={stage} />
          </TabsContent>
          <TabsContent value="win-rate">
            <RepWinRateTable rows={rows} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Shell />);
