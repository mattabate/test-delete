import { useRef, useState } from 'react';
import { Button, Badge, Callout, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from 'tremor';
import { RiUploadCloudLine } from 'remixicon';
import { num, FREEFORM } from './format.js';

function ColumnDiff({ report }) {
  if (!report) return null;
  const clean = report.missing.length === 0 && report.extra.length === 0;
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-wide text-gray-500">{num(report.row_count)} rows</span>
        <span className="font-mono text-xs uppercase tracking-wide text-gray-500">{num(report.columns.length)} columns</span>
        {clean ? <Badge variant="success">Columns match</Badge> : null}
        {report.missing.length > 0 ? <Badge variant="error">{report.missing.length} missing</Badge> : null}
        {report.extra.length > 0 ? <Badge variant="warning">{report.extra.length} unexpected</Badge> : null}
      </div>
      {report.missing.length > 0 ? (
        <div className="mt-3 text-sm text-gray-500">Missing: <span className="font-mono text-gray-900">{report.missing.join(', ')}</span></div>
      ) : null}
      {report.extra.length > 0 ? (
        <div className="mt-2 text-sm text-gray-500">Not in target: <span className="font-mono text-gray-900">{report.extra.join(', ')}</span></div>
      ) : null}
    </div>
  );
}

export function UploadPanel({ targets, schema, onStaged }) {
  const fileRef = useRef(null);
  const [target, setTarget] = useState(FREEFORM);
  const [label, setLabel] = useState('');
  const [picked, setPicked] = useState(null);
  const [ref, setRef] = useState(null);
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const ready = ana.compute.available && ana.upload && ana.upload.available;
  const cols = target === FREEFORM ? [] : schema[target] || [];

  async function pick(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setPicked(f.name);
    setReport(null);
    setRef(null);
    setError('');
    setNotice('');
    setBusy('Uploading...');
    try {
      const up = await ana.upload(f, {
        onProgress: (p) => {
          const frac = p && typeof p === 'object' ? (p.loaded && p.total ? p.loaded / p.total : p.progress) : p;
          const pct = Number(frac);
          if (Number.isFinite(pct)) {
            const shown = pct <= 1 ? Math.round(pct * 100) : Math.round(pct);
            setBusy('Uploading ' + Math.min(100, Math.max(0, shown)) + '%...');
          }
        },
      });
      setRef(up);
      setBusy('Reading columns...');
      const r = await ana.compute.run('inspect_upload', { file: up, target_columns: cols });
      setReport(r);
    } catch (err) {
      setError(String(err && err.message ? err.message : err));
    } finally {
      setBusy('');
    }
  }

  async function recheck(next) {
    setTarget(next);
    if (!ref) return;
    const nextCols = next === FREEFORM ? [] : schema[next] || [];
    setBusy('Checking columns...');
    try {
      const r = await ana.compute.run('inspect_upload', { file: ref, target_columns: nextCols });
      setReport(r);
    } catch (err) {
      setError(String(err && err.message ? err.message : err));
    } finally {
      setBusy('');
    }
  }

  async function stage() {
    if (!ref) return;
    setError('');
    setNotice('');
    let uid = '';
    let cursor = 0;
    let guard = 0;
    try {
      for (;;) {
        guard += 1;
        if (guard > 400) throw new Error('Stopped after 400 chunks. Split the file and retry.');
        let res = null;
        let lastErr = null;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            res = await ana.compute.run('ingest_upload', {
              file: ref,
              target: target,
              label: label || picked || 'upload',
              target_columns: cols,
              upload_id: uid,
              offset: cursor,
            });
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            setBusy('Chunk failed, retrying from row ' + num(cursor) + '...');
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          }
        }
        if (lastErr) {
          throw new Error(
            'Staged ' + num(cursor) + ' rows, then the loader stopped: ' +
            String(lastErr && lastErr.message ? lastErr.message : lastErr) +
            ' Re-select the file to resume.'
          );
        }
        const before = cursor;
        uid = res.upload_id;
        cursor = Number(res.next_offset || 0);
        setBusy('Staged ' + num(cursor) + ' of ' + num(res.ceiling) + ' rows...');
        await onStaged(res);
        if (!res.done && cursor <= before) {
          throw new Error('The loader stopped making progress at row ' + num(cursor) + '.');
        }
        if (res.done) {
          if (res.truncated) {
            setNotice(
              'Stored ' + num(res.ceiling) + ' of ' + num(res.total) +
              ' rows. This file exceeds the 400,000-row ceiling for the app database, so the remainder was not staged.'
            );
          } else {
            setNotice('Stored all ' + num(res.total) + ' rows.');
          }
          break;
        }
      }
      setRef(null);
      setReport(null);
      setPicked(null);
      setLabel('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(String(err && err.message ? err.message : err));
    } finally {
      setBusy('');
    }
  }

  if (!ready) {
    return (
      <Callout title="Uploading is unavailable here" variant="neutral">
        File upload needs a signed-in viewer and the live app page. Open the app directly to add data.
      </Callout>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Target shape</div>
          <Select value={target} onValueChange={recheck}>
            <SelectTrigger className="mt-2 w-72">
              <SelectValue placeholder="Choose a target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FREEFORM}>{FREEFORM}</SelectItem>
              {targets.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="font-mono text-xs uppercase tracking-wide text-gray-500">Batch label</div>
          <Input className="mt-2 w-64" placeholder="Optional name" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="ml-auto">
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.parquet" className="hidden" onChange={pick} />
          <Button variant="secondary" disabled={busy !== ''} onClick={() => fileRef.current && fileRef.current.click()}>
            <RiUploadCloudLine size={16} /> Choose file
          </Button>
        </div>
      </div>

      <div className="mt-4 min-h-24 border border-gray-200 bg-gray-50 p-5">
        {error ? (
          <Callout title="Upload failed" variant="error">{error}</Callout>
        ) : busy ? (
          <div className="text-sm text-gray-500">{busy}</div>
        ) : notice ? (
          <Callout title="Staging complete" variant="neutral">{notice}</Callout>
        ) : picked ? (
          <div>
            <div className="text-sm font-medium text-gray-900">{picked}</div>
            <ColumnDiff report={report} />
            <div className="mt-4">
              <Button disabled={!ref} onClick={stage}>Stage into app database</Button>
              <span className="ml-3 text-xs text-gray-500">Loaded in resumable chunks; ceiling 400,000 rows per file.</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No file selected. Choose a CSV, Excel, or Parquet file to validate it against the target shape.</div>
        )}
      </div>
    </div>
  );
}
