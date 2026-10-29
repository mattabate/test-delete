import { useState } from 'react';
import { Card, Button, Input, Badge } from 'tremor';

export function ProbeCard() {
  const [seconds, setSeconds] = useState('2');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setStatus('running');
    setError(null);
    setResult(null);
    try {
      const value = Number(seconds) || 0;
      const res = await ana.compute.run('slow_probe', { seconds: value });
      setResult(res);
      setStatus('done');
    } catch (e) {
      setError(e.message || String(e));
      setStatus('error');
    }
  };

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-900">Slow probe</span>
        {status === 'running' ? (
          <Badge variant="neutral">Running</Badge>
        ) : status === 'done' ? (
          <Badge variant="success">Done</Badge>
        ) : status === 'error' ? (
          <Badge variant="error">Error</Badge>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Calls the slow_probe compute function, which sleeps server-side for the given number of seconds.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Seconds</div>
          <Input
            className="mt-1 w-32"
            type="number"
            min="0"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            disabled={!ana.compute.available || status === 'running'}
          />
        </div>
        <Button onClick={run} disabled={!ana.compute.available || status === 'running'}>
          Run probe
        </Button>
      </div>
      {!ana.compute.available ? (
        <p className="mt-3 text-sm text-gray-500">Compute functions are not available in this context.</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : result ? (
        <p className="mt-3 font-mono text-sm text-gray-900">slept: {String(result.slept)}</p>
      ) : null}
    </Card>
  );
}
