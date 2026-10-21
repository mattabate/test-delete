import { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  Card,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  BarChart,
} from "tremor";
import { RiSwapLine } from "remixicon";

const rows = ana.data.get("fx_rates") ?? [];

const amountFormatter = (v) =>
  Number.isFinite(v)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(v)
    : "--";

function rateFor(code, list) {
  const r = list.find((x) => x.code === code);
  return r ? r.rate_per_usd : null;
}

function Header() {
  return (
    <div>
      <div className="ana-kicker">[ currency · converter ]</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">
        Currency converter
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Convert an amount between currencies using a reference rate table.
      </p>
    </div>
  );
}

function ConverterCard({ list }) {
  const codes = list.map((r) => r.code);
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState(codes.includes("USD") ? "USD" : codes[0] ?? "");
  const [to, setTo] = useState(codes.includes("EUR") ? "EUR" : codes[1] ?? codes[0] ?? "");

  const numericAmount = Number.parseFloat(amount);
  const validAmount = Number.isFinite(numericAmount) ? numericAmount : null;

  const result = useMemo(() => {
    if (validAmount === null || !from || !to) return null;
    const rFrom = rateFor(from, list);
    const rTo = rateFor(to, list);
    if (!rFrom || !rTo) return null;
    const usd = validAmount / rFrom;
    return usd * rTo;
  }, [validAmount, from, to, list]);

  const rFrom = rateFor(from, list);
  const rTo = rateFor(to, list);
  const unitRate = rFrom && rTo ? rTo / rFrom : null;

  function swap() {
    setFrom(to);
    setTo(from);
  }

  if (list.length === 0) {
    return (
      <Card>
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          No exchange rate data available.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div>
          <label className="font-mono text-xs uppercase tracking-wide text-gray-500">
            Amount
          </label>
          <Input
            className="mt-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
          />
          <label className="mt-4 block font-mono text-xs uppercase tracking-wide text-gray-500">
            From
          </label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {list.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  {r.code} · {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center pb-2">
          <Button variant="secondary" onClick={swap} aria-label="Swap currencies">
            <RiSwapLine size={16} />
          </Button>
        </div>

        <div>
          <label className="font-mono text-xs uppercase tracking-wide text-gray-500">
            Converted amount
          </label>
          <div className="mt-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-3xl tabular-nums text-gray-900">
            {result !== null ? amountFormatter(result) : "--"}
          </div>
          <label className="mt-4 block font-mono text-xs uppercase tracking-wide text-gray-500">
            To
          </label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {list.map((r) => (
                <SelectItem key={r.code} value={r.code}>
                  {r.code} · {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-500">
        {unitRate !== null ? (
          <span>
            1 {from} = <span className="font-mono tabular-nums text-gray-900">{amountFormatter(unitRate)}</span> {to}
          </span>
        ) : (
          "Select two currencies to see the exchange rate."
        )}
      </div>

      <div className="mt-3">
        <span className="ana-tag ana-tag--snapshot">
          <span className="ana-tag__dot" />
          Reference rates, not live market data
        </span>
      </div>
    </Card>
  );
}

function RatesChart({ list }) {
  if (list.length === 0) {
    return (
      <Card>
        <div className="flex h-48 items-center justify-center text-sm text-gray-500">
          No rate data to chart.
        </div>
      </Card>
    );
  }
  const chartData = list
    .filter((r) => r.code !== "USD")
    .map((r) => ({ code: r.code, "Units per USD": r.rate_per_usd }));
  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Units per US Dollar</div>
      <div className="mt-1 text-xs text-gray-500">
        How many units of each currency one US Dollar buys, per the reference table.
      </div>
      <BarChart
        data={chartData}
        index="code"
        categories={["Units per USD"]}
        valueFormatter={amountFormatter}
        className="mt-6 h-72"
        yAxisWidth={60}
      />
    </Card>
  );
}

function RatesTable({ list }) {
  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Reference rate table</div>
      <div className="mt-1 text-xs text-gray-500">Units of currency per 1 US Dollar.</div>
      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Rate per USD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((r) => (
              <TableRow key={r.code}>
                <TableCell className="font-medium text-gray-900">{r.code}</TableCell>
                <TableCell className="text-gray-500">{r.name}</TableCell>
                <TableCell className="text-right font-mono tabular-nums text-gray-900">
                  {amountFormatter(r.rate_per_usd)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function App() {
  const list = rows;
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <Header />
      <ConverterCard list={list} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RatesChart list={list} />
        <RatesTable list={list} />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
