import { Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'tremor';
import { num } from './format.js';

export function UploadsTable({ rows, onPreview, onDelete, busyId }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center border border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-500">No batches staged yet. Upload a file above to add data.</span>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Batch</TableHead>
          <TableHead>Target</TableHead>
          <TableHead className="text-right">Rows staged</TableHead>
          <TableHead className="text-right">In file</TableHead>
          <TableHead className="text-right">Columns</TableHead>
          <TableHead>Match</TableHead>
          <TableHead>Staged</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.upload_id}>
            <TableCell className="font-medium text-gray-900">{r.label}</TableCell>
            <TableCell className="font-mono text-xs text-gray-500">{r.target_table}</TableCell>
            <TableCell className="text-right tabular-nums">{num(r.row_count)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {num(r.total_rows)}
              {Number(r.total_rows) > Number(r.row_count) ? (
                <Badge variant="warning" className="ml-2">partial</Badge>
              ) : null}
            </TableCell>
            <TableCell className="text-right tabular-nums">{num(r.col_count)}</TableCell>
            <TableCell>
              {r.matched_cols > 0 ? (
                <Badge variant={r.matched_cols === r.col_count ? 'success' : 'warning'}>{r.matched_cols}/{r.col_count}</Badge>
              ) : (
                <Badge variant="neutral">unmapped</Badge>
              )}
            </TableCell>
            <TableCell className="tabular-nums text-gray-500">{String(r.created_at).replace('T', ' ')}</TableCell>
            <TableCell className="text-right">
              <Button variant="light" onClick={() => onPreview(r)}>Preview</Button>
              <Button variant="ghost" disabled={busyId === r.upload_id} onClick={() => onDelete(r)}>Remove</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
