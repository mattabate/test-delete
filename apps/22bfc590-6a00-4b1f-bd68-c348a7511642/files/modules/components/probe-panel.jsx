import { useState } from 'react';
import { Button, Callout, Card, Input } from 'tremor';

export function ProbePanel() {
  const [seconds, setSeconds] = useState('2');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const run = async () => {
    const value = Number(seconds);
    if (!Number.isFinite(value) || value < 0) {
      setErrorMsg('Enter a non-negative number of seconds.');
      return;
    }
    setErrorMsg('');
    setStatus('running');
    setResult(null);
    try {
      const res = await ana.compute.run('slow_probe', { seconds: value });
      setResult(res);
      setStatus('done');
    } catch (e) {
      setErrorMsg(e?.message || 'The probe failed.');
      setStatus('error');
    }
  };

  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
        slow probe
      </div>
      <div className="mt-1 text-sm text-gray-500">
        Calls the slow_probe compute function, which sleeps server-side for the given number of seconds.
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Input
          className="w-28"
          type="number"
          min="0"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          disabled={!ana.compute.available || status === 'running'}
        />
        <Button
          onClick={run}
          disabled={!ana.compute.available || status === 'running'}
        >
          {status === 'running' ? 'Running...' : 'Run probe'}
        </Button>
        {!ana.compute.available ? (
          <span className="text-xs text-gray-500">Compute is unavailable in this context.</span>
        ) : null}
      </div>
      {errorMsg ? (
        <Callout className="mt-4" title="Probe failed" color="red">
          {errorMsg}
        </Callout>
      ) : null}
      {status === 'done' && result ? (
        <div className="mt-4 font-mono text-sm text-gray-900">
          slept: {result.slept}s
        </div>
      ) : null}
    </Card>
  );
}
