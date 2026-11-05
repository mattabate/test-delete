def inspect_upload(file, target_columns):
    import pyarrow.parquet as pq
    if file.get('raw_only'):
        raise ValueError('This file could not be parsed as a table. Upload a CSV, XLSX or Parquet file.')
    paths = file.get('table_paths') or []
    if not paths:
        raise ValueError('No tabular data was found in this file.')
    df = pq.read_table(paths[0]).to_pandas()
    cols = [str(c) for c in df.columns]
    expected = [str(c) for c in (target_columns or [])]
    missing = [c for c in expected if c not in cols]
    extra = [c for c in cols if expected and c not in expected]
    head = df.head(5).astype(object).where(df.head(5).notna(), None)
    preview = [{str(k): (None if v is None else str(v)) for k, v in rec.items()} for rec in head.to_dict(orient='records')]
    return {'row_count': int(len(df)), 'columns': cols, 'missing': missing, 'extra': extra, 'preview': preview}
