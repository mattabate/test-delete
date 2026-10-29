import { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Slider, Badge, Button } from 'tremor';
import dayjs from 'dayjs';

const ZONES = [
  { id: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { id: 'America/Denver', label: 'Denver (MT)' },
  { id: 'America/Chicago', label: 'Chicago (CT)' },
  { id: 'America/New_York', label: 'New York (ET)' },
  { id: 'UTC', label: 'UTC' },
  { id: 'Europe/London', label: 'London (GMT/BST)' },
  { id: 'Europe/Paris', label: 'Paris (CET)' },
  { id: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)' },
  { id: 'Asia/Kolkata', label: 'Mumbai (IST)' },
  { id: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

// Format an offset-based clock reading without relying on browser Intl timeZone
// support for arbitrary IANA zones (works reliably via Intl.DateTimeFormat).
function zoneParts(utcMs, zoneId) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zoneId,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const time = `${get('hour')}:${get('minute')} ${get('dayPeriod')}`;
  const date = `${get('weekday')}, ${get('month')} ${get('day')}`;
  const hour24 = new Intl.DateTimeFormat('en-US', { timeZone: zoneId, hour: '2-digit', hour12: false }).format(new Date(utcMs));
  return { time, date, hour24: parseInt(hour24, 10) };
}

function periodLabel(hour24) {
  if (hour24 >= 6 && hour24 < 9) return { label: 'Early morning', tone: 'warning' };
  if (hour24 >= 9 && hour24 < 12) return { label: 'Morning', tone: 'success' };
  if (hour24 >= 12 && hour24 < 17) return { label: 'Afternoon', tone: 'success' };
  if (hour24 >= 17 && hour24 < 21) return { label: 'Evening', tone: 'warning' };
  return { label: 'Night', tone: 'error' };
}

function ZoneRow({ zone, utcMs, isBase, onMakeBase }) {
  const { time, date, hour24 } = zoneParts(utcMs, zone.id);
  const period = periodLabel(hour24);
  return (
    <div className="bg-white p-5 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{zone.label}</span>
          {isBase ? <Badge variant="neutral">Base</Badge> : null}
        </div>
        <div className="mt-1 text-xs text-gray-500">{date}</div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={period.tone}>{period.label}</Badge>
        <span className="font-mono text-2xl tabular-nums text-gray-900">{time}</span>
        {!isBase ? (
          <Button variant="light" onClick={() => onMakeBase(zone.id)}>
            Set as base
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  const [baseZone, setBaseZone] = useState('America/New_York');
  const [offsetMinutes, setOffsetMinutes] = useState([0]);
  const [compareZones, setCompareZones] = useState(
    ZONES.filter((z) => ['UTC', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].includes(z.id)).map((z) => z.id)
  );

  const nowUtcMs = useMemo(() => Date.now() + offsetMinutes[0] * 60000, [offsetMinutes]);

  const baseInfo = zoneParts(nowUtcMs, baseZone);

  function resetToNow() {
    setOffsetMinutes([0]);
  }

  function toggleZone(id) {
    setCompareZones((prev) => (prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]));
  }

  const sliderLabel = useMemo(() => {
    const mins = offsetMinutes[0];
    if (mins === 0) return 'Now';
    const sign = mins > 0 ? '+' : '-';
    const abs = Math.abs(mins);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${h}h ${m}m from now`;
  }, [offsetMinutes]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">time zone calculator</div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Find the time anywhere</h1>
          <p className="mt-1 text-sm text-gray-500">
            Pick a base city, drag the slider to move through the day, and see every other city update together.
          </p>
        </div>
        <Button variant="secondary" onClick={resetToNow}>
          Reset to now
        </Button>
      </div>

      <Card className="ana-card--accent mt-6">
        <div className="font-mono text-xs uppercase tracking-wide text-white/70">base city</div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Select value={baseZone} onValueChange={setBaseZone}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose a city" />
              </SelectTrigger>
              <SelectContent>
                {ZONES.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 text-xs text-white/70">{baseInfo.date}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl tabular-nums text-white">{baseInfo.time}</div>
            <div className="mt-1 text-xs text-white/70">{sliderLabel}</div>
          </div>
        </div>
        <div className="mt-6">
          <Slider
            value={offsetMinutes}
            onValueChange={setOffsetMinutes}
            min={-720}
            max={720}
            step={15}
          />
          <div className="mt-2 flex justify-between text-xs text-white/70">
            <span>-12h</span>
            <span>now</span>
            <span>+12h</span>
          </div>
        </div>
      </Card>

      <div className="ana-gutter mt-8" />

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-gray-900">Compare cities</h2>
          <div className="flex flex-wrap gap-2">
            {ZONES.filter((z) => z.id !== baseZone).map((z) => (
              <Button
                key={z.id}
                variant={compareZones.includes(z.id) ? 'primary' : 'light'}
                onClick={() => toggleZone(z.id)}
              >
                {z.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-px border border-gray-200 bg-gray-200">
          {compareZones.length === 0 ? (
            <div className="bg-white p-8 text-center text-sm text-gray-500">
              Select at least one city above to compare times.
            </div>
          ) : (
            compareZones
              .map((id) => ZONES.find((z) => z.id === id))
              .filter(Boolean)
              .map((z) => (
                <ZoneRow key={z.id} zone={z} utcMs={nowUtcMs} isBase={false} onMakeBase={setBaseZone} />
              ))
          )}
        </div>
      </div>

      <div className="ana-terminal mt-8">
        <div className="ana-terminal__head">ana // note</div>
        <div className="ana-terminal__line">
          Drag the slider to preview any moment in the next or previous 12 hours across every selected city.
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
