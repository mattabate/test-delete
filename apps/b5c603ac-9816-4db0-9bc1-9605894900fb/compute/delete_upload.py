def delete_upload(upload_id):
    uid = str(upload_id).replace("'", "''")
    n = ana.sql("SELECT count(*) AS n FROM staged_rows WHERE upload_id = '" + uid + "'")
    removed = int(n.iloc[0, 0]) if len(n) else 0
    ana.sql("DELETE FROM staged_rows WHERE upload_id = '" + uid + "'")
    ana.sql("DELETE FROM uploads WHERE upload_id = '" + uid + "'")
    return {'removed': removed}
