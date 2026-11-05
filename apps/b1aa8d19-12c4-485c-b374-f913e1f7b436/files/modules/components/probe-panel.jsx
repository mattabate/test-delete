import { useState } from 'react';
import { Button, Card, Input, Badge } from 'tremor';

export function ProbePanel() {
  const [seconds, setSeconds] = useState('2');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const run = async () => {
    const n = Number(seconds);
    if (!Number.isFinite(n) || n < 0) {
      setErrorMsg('Enter a non-negative number of seconds.');
      setStatus('error');
      return;
    }
    if (!ana.compute.available) {
      setErrorMsg('Compute is not available right now.');
      setStatus('error');
      return;
    }
    setStatus('running');
    setErrorMsg('');
    try {
      const res = await ana.compute.run('slow_probe', { seconds: n });
      setResult(res);
      setStatus('done');
    } catch (e) {
      setErrorMsg(String(e.message || e));
      setStatus('error');
    }
  };

  return (
    <Card>
      <div className="text-sm font-semibold text-gray-900">Server-side probe</div>
      <div className="mt-1 text-xs text-gray-500">
        Calls slow_probe, which sleeps server-side for the given seconds.
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Input
          className="w-28"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          placeholder="seconds"
        />
        <Button onClick={run} disabled={status === 'running'}>
          {status === 'running' ? 'Running…' : 'Run probe'}
        </Button>
        {status === 'done' ? (
          <Badge variant="success">slept: {result?.slept}</Badge>
        ) : null}
        {status === 'error' ? <Badge variant="error">{errorMsg}</Badge> : null}
      </div>
    </Card>
  );
}
