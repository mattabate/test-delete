import { useState } from 'react';
import { Button, Card, Badge } from 'tremor';

export function ProbePanel() {
  const [seconds, setSeconds] = useState(2);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setStatus('running');
    setError(null);
    try {
      const r = await ana.compute.run('slow_probe', { seconds });
      setResult(r);
      setStatus('done');
    } catch (e) {
      setError(e.message || String(e));
      setStatus('error');
    }
  };

  return (
    <Card>
      <div className="text-sm font-medium text-gray-900">Slow probe</div>
      <div className="mt-1 text-xs text-gray-500">
        Calls the slow_probe compute function, which sleeps server-side before responding.
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="number"
          min="0"
          step="1"
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          className="w-24 border border-gray-300 px-2 py-1.5 text-sm font-mono"
        />
        <Button onClick={run} disabled={!ana.compute.available || status === 'running'}>
          {status === 'running' ? 'Sleeping...' : 'Run probe'}
        </Button>
        {status === 'done' && result ? (
          <Badge variant="success">slept {result.slept}s</Badge>
        ) : null}
        {status === 'error' ? <Badge variant="error">{error}</Badge> : null}
        {!ana.compute.available ? (
          <span className="ana-tag ana-tag--unavailable">compute unavailable</span>
        ) : null}
      </div>
    </Card>
  );
}
