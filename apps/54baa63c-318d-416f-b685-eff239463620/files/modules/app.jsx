import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Card,
  Badge,
  Button,
  Callout,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from 'tremor';

const BRACKETS = [30, 100, 140, 160, 300, 400, 580, 595, 610];

function statusVariant(status) {
  if (status === 'completed') return 'success';
  if (status === 'failed') return 'error';
  if (status === 'running') return 'warning';
  return 'neutral';
}

function statusLabel(status) {
  if (status === 'not_run') return 'not run';
  return status;
}

function TestPanel({ title, description, fnName, badgeNote }) {
  const [seconds, setSeconds] = useState(String(BRACKETS[0]));
  const [status, setStatus] = useState('not_run');
  const [elapsedMs, setElapsedMs] = useState(null);
  const [error, setError] = useState(null);

  const canRun = ana.compute.available && status !== 'running';

  async function runTest() {
    setStatus('running');
    setError(null);
    setElapsedMs(null);
    const start = performance.now();
    try {
      const result = await ana.compute.run(fnName, { seconds: Number(seconds) });
      const elapsed = performance.now() - start;
      setElapsedMs(elapsed);
      if (result && result.error) {
        setStatus('failed');
        setError(String(result.error));
      } else {
        setStatus('completed');
      }
    } catch (e) {
      const elapsed = performance.now() - start;
      setElapsedMs(elapsed);
      setStatus('failed');
      setError(e && e.message ? e.message : String(e));
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="mt-1 text-xs text-gray-500">{description}</div>
        </div>
        <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-wide text-gray-500">
            duration
          </div>
          <Select value={seconds} onValueChange={setSeconds}>
            <SelectTrigger className="w-32 mt-1">
              <SelectValue placeholder="seconds" />
            </SelectTrigger>
            <SelectContent>
              {BRACKETS.map((b) => (
                <SelectItem key={b} value={String(b)}>
                  {b}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={runTest} disabled={!canRun}>
          Run test
        </Button>
        {!ana.compute.available ? (
          <span className="text-xs text-gray-500">
            compute unavailable in this view (share link / screenshot)
          </span>
        ) : null}
      </div>

      <div className="ana-readout-row mt-5">
        <div className="ana-readout">
          <span className="ana-readout__label">requested</span>
          <span className="ana-readout__value">{seconds}s</span>
        </div>
        <div className="ana-readout">
          <span className="ana-readout__label">elapsed</span>
          <span className="ana-readout__value">
            {elapsedMs === null ? '--' : (elapsedMs / 1000).toFixed(1) + 's'}
          </span>
        </div>
        <div className="ana-readout">
          <span className="ana-readout__label">path</span>
          <span className="ana-readout__value">{badgeNote}</span>
        </div>
      </div>

      {error ? (
        <Callout title="Error" variant="error" className="mt-4">
          <span className="font-mono text-xs break-words">{error}</span>
        </Callout>
      ) : null}
    </Card>
  );
}

function InterpretationNote() {
  return (
    <div className="ana-terminal mt-8">
      <div className="ana-terminal__head">ana // how to read a run</div>
      <div className="ana-terminal__line">
        Completing past ~150s but under ~590s confirms the new budget is live on
        that worker.
      </div>
      <div className="ana-terminal__line">
        Failing right around the old ~120-150s mark means that worker has not
        picked up the rollout yet (partial-rollout case).
      </div>
      <div className="ana-terminal__line">
        Fire two long runs back-to-back on this same app to separately check the
        120s session queue-wait limit, which this PR does not touch.
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="ana-kicker">compute timeout tester</div>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">
        Compute / refresh timeout bracket test
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Manual harness for the pending PR extending data-app compute and refresh
        timeouts from roughly 2-5 minutes up to 10 minutes. Pick a bracket, run
        a test, and read the elapsed time and status against the old and new
        ceilings below.
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TestPanel
          title="python_sleep"
          description="Calls time.sleep(seconds) in a python compute function. Exercises the sandbox ScriptRequest timeout budget directly."
          fnName="python_sleep"
          badgeNote="sandbox exec"
        />
        <TestPanel
          title="sql_sleep"
          description="Runs a server-side wait of the given duration on a SQL connector (SYSTEM$WAIT). Exercises the ana.query dispatch HTTP timeout path (old limit ~120s, claimed new limit ~590s)."
          fnName="sql_sleep"
          badgeNote="connector dispatch"
        />
      </div>

      <InterpretationNote />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
