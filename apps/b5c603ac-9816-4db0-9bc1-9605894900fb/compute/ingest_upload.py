def ingest_upload(file, target, label, target_columns, upload_id, offset):
    import pyarrow.parquet as pq, json, uuid, datetime
    CHUNK = 20000
    MAX_ROWS = 400000    if file.get('raw_only'):
        raise ValueError('This file could not be parsed as a table.')
    paths = file.get('table_paths') or []
    if not paths:
        raise ValueError('No tabular data was found in this file.')

    start = int(offset or 0)
    pf = pq.ParquetFile(paths[0])
    total = int(pf.metadata.num_rows)
    ceiling = min(total, MAX_ROWS)

    def q(v):
        return "'" + str(v).replace("'", "''") + "'"

    name = str(file.get('name') or 'upload')
    lbl = str(label or name)
    cols = [str(c) for c in pf.schema_arrow.names]
    expected = [str(c) for c in (target_columns or [])]
    matched = len([c for c in cols if c in expected])

    uid = str(upload_id or '').strip()
    if not uid:
        uid = str(uuid.uuid4())
        ts = datetime.datetime.utcnow().isoformat(timespec='seconds')
        ana.sql(
            'INSERT INTO uploads (upload_id, label, target_table, file_name, row_count, col_count, matched_cols, created_at, total_rows) VALUES ('
            + q(uid) + ', ' + q(lbl) + ', ' + q(target) + ', ' + q(name) + ', 0, '
            + str(len(cols)) + ', ' + str(matched) + ', ' + q(ts) + ', ' + str(total) + ')'
        )

    if start >= ceiling:
        return {'upload_id': uid, 'staged': start, 'inserted': 0, 'next_offset': start,
                'total': total, 'ceiling': ceiling, 'done': True, 'truncated': total > ceiling}

    import time
    deadline = time.monotonic() + 45.0
    md = pf.metadata
    cursor = start
    inserted = 0
    out_of_time = False

    group_start = 0
    for gi in range(md.num_row_groups):
        g_rows = int(md.row_group(gi).num_rows)
        g_end = group_start + g_rows
        if g_end <= cursor:
            group_start = g_end
            continue
        if cursor >= ceiling or out_of_time:
            break

        take_from = cursor - group_start
        take_to = min(g_rows, ceiling - group_start)
        grp = pf.read_row_group(gi)
        sub = grp.slice(take_from, take_to - take_from)
        df = sub.to_pandas()
        clean = df.astype(object).where(df.notna(), None)
        recs = clean.to_dict(orient='records')
        del grp, sub, df, clean

        batch = []
        for i, rec in enumerate(recs):
            payload = json.dumps({str(k): v for k, v in rec.items()}, default=str)
            batch.append('(' + q(uid) + ', ' + q(target) + ', ' + str(cursor + i) + ', ' + q(payload) + ')')
            if len(batch) >= 1000:
                ana.sql('INSERT INTO staged_rows VALUES ' + ', '.join(batch))
                inserted += len(batch)
                cursor += len(batch)
                batch = []
                if time.monotonic() > deadline:
                    out_of_time = True
                    break
        if batch:
            ana.sql('INSERT INTO staged_rows VALUES ' + ', '.join(batch))
            inserted += len(batch)
            cursor += len(batch)
            batch = []

        group_start = g_end
        if time.monotonic() > deadline:
            out_of_time = True

    staged = cursor
    ana.sql('UPDATE uploads SET row_count = ' + str(staged) + ' WHERE upload_id = ' + q(uid))
    return {'upload_id': uid, 'staged': staged, 'inserted': inserted, 'next_offset': staged,
            'total': total, 'ceiling': ceiling, 'done': staged >= ceiling,
            'truncated': total > ceiling}
