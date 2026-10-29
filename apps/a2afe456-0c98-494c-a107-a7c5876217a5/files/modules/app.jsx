import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, BarChart, AreaChart, Badge, Button, Callout } from 'tremor';
import { RiUploadCloudLine, RiFileTextLine, RiCloseLine } from 'remixicon';
import {
  createGrid,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const troops = ana.data.get('troops') || [];
const weekly = ana.data.get('weekly') || [];

const totalMembers = troops.reduce((s, t) => s + (t.members || 0), 0);
const totalBananas = troops.reduce((s, t) => s + (t.bananas_per_day || 0), 0);
const topTroop = troops.length
  ? troops.reduce((a, b) => (b.bananas_per_day > a.bananas_per_day ? b : a))
  : null;
const avgPerMonkey = totalMembers > 0 ? (totalBananas / totalMembers).toFixed(1) : '0';

function Kpi({ label, value, note }) {
  return (
    <Card>
      <div className="font-mono text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 font-mono text-3xl tabular-nums text-gray-900">{value}</div>
      {note ? <div className="mt-1 text-xs text-gray-500">{note}</div> : null}
    </Card>
  );
}

function Header() {
  return (
    <div>
      <div className="ana-kicker">[ troop watch . daily banana report ]</div>
      <div className="ana-figure ana-brackets mt-4">
        <span className="ana-figure__label">total bananas eaten per day</span>
        <div className="ana-figure__value">{totalBananas.toLocaleString('en-US')}</div>
        <span className="ana-figure__note">across {troops.length} tracked troops and {totalMembers} monkeys</span>
      </div>
    </div>
  );
}

function UploadGrid({ rows, columns }) {
  const gridRef = useRef(null);
  useEffect(() => {
    if (!gridRef.current || !rows.length) return;
    const columnDefs = columns.map((c) => ({
      field: c,
      sortable: true,
      filter: true,
      resizable: true,
    }));
    const api = createGrid(gridRef.current, {
      theme: 'legacy', // ag-grid.min.css (CSS file theme) is linked in index.html, so opt out of the v33 Theming API
      rowData: rows,
      columnDefs,
      defaultColDef: { flex: 1, minWidth: 120 },
      rowBuffer: 20,
    });
    return () => api.destroy();
  }, [rows, columns]);
  return <div ref={gridRef} className="ag-theme-quartz mt-4 h-96 w-full" />;
}

function BenchmarkTable({ rows }) {
  if (!rows.length) {
    return <div className="mt-4 text-xs text-gray-500">No upload benchmarks recorded yet. Upload a file above to record one.</div>;
  }
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="py-2 pr-4">File</th>
            <th className="py-2 pr-4 text-right">Size</th>
            <th className="py-2 pr-4 text-right">Upload time</th>
            <th className="py-2">Recorded (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-900">{r.file_name}</td>
              <td className="py-2 pr-4 text-right font-mono tabular-nums text-gray-900">{formatBytes(r.file_size_bytes)}</td>
              <td className="py-2 pr-4 text-right font-mono tabular-nums text-gray-900">{formatMs(r.upload_ms)}</td>
              <td className="py-2 text-gray-500">{r.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatBytes(n) {
  if (!n || n <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return (n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

function formatMs(ms) {
  if (ms == null) return '-';
  return ms >= 1000 ? (ms / 1000).toFixed(2) + ' s' : Math.round(ms) + ' ms';
}

function UploadHistory({ onOpen, openingKey, refreshToken, sizeByFileName }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState(null);

  const uploadsAvailable = typeof ana !== 'undefined' && ana.uploads && ana.uploads.available;

  async function load() {
    if (!uploadsAvailable) return;
    setStatus('loading');
    setError(null);
    try {
      const page = await ana.uploads.list({ pageSize: 25 });
      setItems((page && page.items) || []);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err && err.message ? err.message : 'Could not load saved uploads.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  async function handleRemove(item) {
    if (!ana.uploads.remove) return;
    try {
      await ana.uploads.remove(item.file);
      setItems((prev) => prev.filter((it) => it !== item));
    } catch (err) {
      // non-fatal: leave the list as-is if removal fails
    }
  }

  if (!uploadsAvailable) {
    return (
      <Callout title="Upload history unavailable here" color="gray" className="mt-4">
        Saved-upload history requires a signed-in viewer and isn't available in shared previews or screenshots.
      </Callout>
    );
  }

  return (
    <div className="mt-4">
      {status === 'loading' ? <div className="text-xs text-gray-500">Loading your uploaded files...</div> : null}
      {status === 'error' ? (
        <Callout title="Could not load uploads" color="red" className="mt-2">
          {error}
        </Callout>
      ) : null}
      {status === 'done' && !items.length ? (
        <div className="text-xs text-gray-500">You haven't uploaded any files yet.</div>
      ) : null}
      {status === 'done' && items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4 text-right">Size</th>
                <th className="py-2 pr-4">Uploaded</th>
                <th className="py-2 pr-4"></th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const key = item.file && item.file.dataset_id ? item.file.dataset_id : String(i);
                const knownSize = sizeByFileName && Object.prototype.hasOwnProperty.call(sizeByFileName, item.name)
                  ? sizeByFileName[item.name]
                  : null;
                return (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-2 pr-4 text-right font-mono tabular-nums text-gray-900">{knownSize != null ? formatBytes(knownSize) : '-'}</td>
                    <td className="py-2 pr-4 text-gray-500">{item.createdAt}</td>
                    <td className="py-2 pr-4">
                      <Button variant="secondary" onClick={() => onOpen(item)} disabled={openingKey === key}>
                        {openingKey === key ? 'Opening...' : 'Open preview'}
                      </Button>
                    </td>
                    <td className="py-2">
                      <Button variant="ghost" onClick={() => handleRemove(item)}>
                        <RiCloseLine size={16} className="mr-1" />
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function CsvUpload() {
  const [fileName, setFileName] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | previewing | done | error
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [lastUploadMs, setLastUploadMs] = useState(null);
  const [benchmarks, setBenchmarks] = useState([]);
  const [benchmarksLoaded, setBenchmarksLoaded] = useState(false);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [openingKey, setOpeningKey] = useState(null);
  const inputRef = useRef(null);

  const uploadAvailable = typeof ana !== 'undefined' && ana.upload && ana.upload.available;
  const computeAvailable = typeof ana !== 'undefined' && ana.compute && ana.compute.available;

  async function refreshBenchmarks() {
    if (!computeAvailable) return;
    try {
      const result = await ana.compute.run('list_upload_benchmarks', {});
      setBenchmarks(Array.isArray(result) ? result : []);
    } catch (err) {
      // non-fatal: benchmark history is a nice-to-have, don't block the upload flow
    } finally {
      setBenchmarksLoaded(true);
    }
  }

  useEffect(() => {
    refreshBenchmarks();
  }, []);

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setRows([]);
    setColumns([]);
    setProgress(0);
    setLastUploadMs(null);

    if (!uploadAvailable || !computeAvailable) {
      setStatus('error');
      setError('File upload is not available in this view (e.g. a shared preview or screenshot).');
      return;
    }

    try {
      setStatus('uploading');
      const startedAt = performance.now();
      const upload = await ana.upload(file, { onProgress: setProgress });
      const uploadMs = performance.now() - startedAt;
      setLastUploadMs(uploadMs);

      // Fire-and-forget: log this upload's timing so the benchmark panel can show it,
      // without blocking the preview from loading.
      ana.compute
        .run('log_upload_benchmark', { file_name: file.name, file_size_bytes: file.size, upload_ms: Math.round(uploadMs) })
        .then(refreshBenchmarks)
        .catch(() => {});

      setStatus('previewing');
      const result = await ana.compute.run('upload_preview', { file: upload });
      const previewRows = Array.isArray(result) ? result : [];
      setColumns(previewRows.length ? Object.keys(previewRows[0]) : []);
      setRows(previewRows);
      setStatus('done');
      setHistoryRefreshToken((t) => t + 1); // the file we just uploaded now shows up in the saved-uploads list
    } catch (err) {
      setStatus('error');
      setError(err && err.message ? err.message : 'Could not process this file.');
    }
  }

  async function openSavedUpload(item) {
    const key = item.file && item.file.dataset_id ? item.file.dataset_id : item.name;
    setOpeningKey(key);
    setError(null);
    setFileName(item.name);
    setStatus('previewing');
    setRows([]);
    setColumns([]);
    try {
      const result = await ana.compute.run('upload_preview', { file: item.file });
      const previewRows = Array.isArray(result) ? result : [];
      setColumns(previewRows.length ? Object.keys(previewRows[0]) : []);
      setRows(previewRows);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err && err.message ? err.message : 'Could not open this saved file.');
    } finally {
      setOpeningKey(null);
    }
  }

  function reset() {
    setFileName(null);
    setStatus('idle');
    setError(null);
    setProgress(0);
    setRows([]);
    setColumns([]);
    setLastUploadMs(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <Card className="mt-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-900">Upload your own troop data</div>
          <div className="text-xs text-gray-500">CSV, XLS, or XLSX files are uploaded and parsed server-side, then previewed below.</div>
        </div>
        <div className="flex items-center gap-2">
          {fileName ? (
            <Button variant="ghost" onClick={reset} disabled={status === 'uploading' || status === 'previewing'}>
              <RiCloseLine size={16} className="mr-1" />
              Clear
            </Button>
          ) : null}
          <Button
            variant="secondary"
            onClick={() => inputRef.current && inputRef.current.click()}
            disabled={status === 'uploading' || status === 'previewing' || !uploadAvailable}
          >
            <RiUploadCloudLine size={16} className="mr-1" />
            Upload file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => handleFile(e.target.files && e.target.files[0])}
          />
        </div>
      </div>

      {!uploadAvailable ? (
        <Callout title="Upload unavailable here" color="gray" className="mt-4">
          File upload requires a signed-in viewer and isn't available in shared previews or screenshots.
        </Callout>
      ) : null}

      {fileName ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <RiFileTextLine size={16} className="text-gray-400" />
          <span className="font-medium text-gray-700">{fileName}</span>
          {status === 'uploading' ? <Badge variant="neutral">Uploading... {progress ? Math.round(progress * 100) + '%' : ''}</Badge> : null}
          {status === 'previewing' ? <Badge variant="neutral">Preparing preview...</Badge> : null}
          {status === 'done' ? (
            <Badge variant="success">
              {rows.length.toLocaleString('en-US')} rows previewed{rows.length >= 5000 ? ' (first 5,000)' : ''}
            </Badge>
          ) : null}
        </div>
      ) : null}

      {status === 'error' ? (
        <Callout title="Upload failed" color="red" className="mt-4">
          {error}
        </Callout>
      ) : null}

      {status === 'done' && rows.length ? <UploadGrid rows={rows} columns={columns} /> : null}
      {status === 'done' && !rows.length ? (
        <div className="mt-4 text-sm text-gray-500">The file was processed but had no data rows.</div>
      ) : null}

      <div className="mt-8 border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">Upload time benchmark</div>
          {lastUploadMs != null ? (
            <Badge variant="neutral">Last upload: {formatMs(lastUploadMs)}</Badge>
          ) : null}
        </div>
        <div className="text-xs text-gray-500">Every upload's transfer time is timed client-side and logged to the app database.</div>
        {benchmarksLoaded ? <BenchmarkTable rows={benchmarks} /> : <div className="mt-4 text-xs text-gray-500">Loading benchmark history...</div>}
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <div className="text-sm font-medium text-gray-900">Previously uploaded files</div>
        <div className="text-xs text-gray-500">Reopen a file you already uploaded to this app without re-uploading it.</div>
        <UploadHistory
          onOpen={openSavedUpload}
          openingKey={openingKey}
          refreshToken={historyRefreshToken}
          sizeByFileName={benchmarks.reduce((acc, b) => {
            if (!(b.file_name in acc)) acc[b.file_name] = b.file_size_bytes; // benchmarks are newest-first, keep the most recent size
            return acc;
          }, {})}
        />
      </div>
    </Card>
  );
}

function TroopTable() {
  if (!troops.length) {
    return <Card className="mt-6"><div className="text-sm text-gray-500">No troop data available.</div></Card>;
  }
  return (
    <Card className="mt-6">
      <div className="text-sm font-medium text-gray-900">Troop roster</div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2 pr-4">Troop</th>
              <th className="py-2 pr-4">Species</th>
              <th className="py-2 pr-4 text-right">Members</th>
              <th className="py-2 pr-4 text-right">Bananas / day</th>
              <th className="py-2">Favorite snack</th>
            </tr>
          </thead>
          <tbody>
            {troops.map((t) => (
              <tr key={t.troop} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium text-gray-900">{t.troop}</td>
                <td className="py-2 pr-4 text-gray-500">{t.species}</td>
                <td className="py-2 pr-4 text-right font-mono tabular-nums text-gray-900">{t.members}</td>
                <td className="py-2 pr-4 text-right font-mono tabular-nums text-gray-900">{t.bananas_per_day}</td>
                <td className="py-2 text-gray-500">{t.favorite_snack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function App() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <Header />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi label="Troops tracked" value={troops.length} />
        <Kpi label="Total monkeys" value={totalMembers} />
        <Kpi label="Bananas / monkey / day" value={avgPerMonkey} />
        <Kpi label="Top troop" value={topTroop ? topTroop.troop : '-'} note={topTroop ? topTroop.bananas_per_day + ' bananas/day' : ''} />
      </div>

      <div className="ana-gutter mt-10" />

      <Card className="mt-10">
        <div className="text-sm font-medium text-gray-900">Bananas eaten this week</div>
        <div className="text-xs text-gray-500">Colony-wide total, by day</div>
        <AreaChart
          data={weekly}
          index="day"
          categories={['bananas_eaten']}
          valueFormatter={(v) => v.toLocaleString('en-US') + ' bananas'}
          className="mt-6 h-64"
        />
      </Card>

      <Card className="mt-6">
        <div className="text-sm font-medium text-gray-900">Bananas per day by troop</div>
        <BarChart
          data={troops}
          index="troop"
          categories={['bananas_per_day']}
          valueFormatter={(v) => v.toLocaleString('en-US') + ' bananas'}
          className="mt-6 h-64"
        />
      </Card>

      <TroopTable />

      <CsvUpload />

      <div className="ana-terminal mt-10">
        <div className="ana-terminal__head">ana // closing-note</div>
        <div className="ana-terminal__line">Vine Vandals eat more bananas than any other troop, but Canopy Crew has the most mouths to feed.</div>
        <div className="ana-terminal__attrib">troop watch, daily report</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
