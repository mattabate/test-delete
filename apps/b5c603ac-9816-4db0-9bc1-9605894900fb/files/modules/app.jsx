import { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Callout, BarChart, Dialog, DialogContent, DialogTitle, DialogFooter, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { num, schemaMap, parseRow } from './format.js';
import { UploadPanel } from './upload_panel.jsx';
import { UploadsTable } from './uploads_table.jsx';

const schemaRows = ana.data.get('target_schema');
const schema = schemaMap(schemaRows);
const targets = Object.keys(schema).sort();

function Readout({ label, value, run }) {
  return (
    <div className={run ? 'ana-readout ana-readout--run' : 'ana-readout'}>
      <span className="ana-readout__label">{label}</span>
      <span className="ana-readout__value">{value}</span>
    </div>
  );
}

function PreviewDialog({ open, batch, rows, onClose }) {
  const parsed = (rows || []).map((r) => parseRow(r.row_json));
  const cols = parsed.length > 0 ? Object.keys(parsed[0]).slice(0, 8) : [];
  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent>
        <DialogTitle>{batch ? batch.label : 'Preview'}</DialogTitle>
        <div className="mt-4 overflow-x-auto">
          {parsed.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-500">No rows to show.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {cols.map((c) => (
                    <TableHead key={c}>{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((p, i) => (
                  <TableRow key={i}>
                    {cols.map((c) => (
                      <TableCell key={c} className="font-mono text-xs">{p[c] === null || p[c] === undefined ? '--' : String(p[c])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function App() {
  const [uploads, setUploads] = useState([]);
  const [totals, setTotals] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [preview, setPreview] = useState({ open: false, batch: null, rows: [] });

  const refresh = useCallback(async () => {
    if (!ana.compute.available) return;
    try {
      const [u, t] = await Promise.all([
        ana.compute.run('list_uploads', {}),
        ana.compute.run('staged_totals', {}),
      ]);
      setUploads(u || []);
      setTotals(t || []);
      setLoadError('');
    } catch (err) {
      setLoadError(String(err && err.message ? err.message : err));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function openPreview(batch) {
    try {
      const rows = await ana.compute.run('preview_rows', { upload_id: batch.upload_id });
      setPreview({ open: true, batch: batch, rows: rows || [] });
    } catch (err) {
      setLoadError(String(err && err.message ? err.message : err));
    }
  }

  async function removeBatch(batch) {
    setBusyId(batch.upload_id);
    try {
      await ana.compute.run('delete_upload', { upload_id: batch.upload_id });
      await refresh();
    } catch (err) {
      setLoadError(String(err && err.message ? err.message : err));
    } finally {
      setBusyId('');
    }
  }

  const totalRows = totals.reduce((a, r) => a + Number(r.rows_staged || 0), 0);
  const chartData = totals.map((r) => ({ target: r.target_table, rows: Number(r.rows_staged || 0) }));

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="ana-kicker">[ client360 · staging ]</div>
      <h1 className="mt-3 text-lg font-semibold text-gray-900">CSV staging</h1>
      <p className="mt-1 text-sm text-gray-500">
        Upload files into this app's own DuckDB database. Rows are validated against the CLIENT360 table shapes and
        stored here; the warehouse itself is read-only and is never written to.
      </p>

      {loadError ? (
        <Callout title="Could not reach the app database" variant="error" className="mt-6">{loadError}</Callout>
      ) : null}

      <div className="ana-readout-row mt-6">
        <Readout label="batches" value={num(uploads.length)} />
        <Readout label="rows staged" value={num(totalRows)} run />
        <Readout label="targets used" value={num(totals.length)} />
        <Readout label="known shapes" value={num(targets.length)} />
      </div>

      <div className="mt-10">
        <div className="ana-kicker">[ ch.01 · add data ]</div>
        <h2 className="mt-3 text-sm font-medium text-gray-900">Upload a file</h2>
        <div className="mt-4">
          <UploadPanel targets={targets} schema={schema} onStaged={refresh} />
        </div>
      </div>

      <div className="ana-gutter mt-10" />

      <div className="mt-10">
        <div className="ana-kicker">[ ch.02 · what is staged ]</div>
        <h2 className="mt-3 text-sm font-medium text-gray-900">Rows staged by target shape</h2>
        <p className="mt-1 text-sm text-gray-500">How much uploaded data sits against each CLIENT360 table.</p>
        <div className="mt-4 h-60">
          {chartData.length === 0 ? (
            <div className="flex h-60 items-center justify-center border border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-500">Nothing staged yet.</span>
            </div>
          ) : (
            <BarChart data={chartData} index="target" categories={['rows']} valueFormatter={num} yAxisWidth={60} className="h-60" />
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-gray-900">Staged batches</h2>
        <div className="mt-4">
          <UploadsTable rows={uploads} onPreview={openPreview} onDelete={removeBatch} busyId={busyId} />
        </div>
      </div>

      <PreviewDialog
        open={preview.open}
        batch={preview.batch}
        rows={preview.rows}
        onClose={() => setPreview({ open: false, batch: null, rows: [] })}
      />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
