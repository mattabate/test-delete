export const num = (v) => (Number.isFinite(Number(v)) ? Number(v).toLocaleString('en-US') : '--');

export const FREEFORM = 'Free-form';

export function schemaMap(rows) {
  const m = {};
  (rows || []).forEach((r) => {
    if (!m[r.target_table]) m[r.target_table] = [];
    m[r.target_table].push(r.column_name);
  });
  return m;
}

export function parseRow(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return {};
  }
}
