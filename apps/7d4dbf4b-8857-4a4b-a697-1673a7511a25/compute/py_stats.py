
def py_stats():
    df = ana.sql("SELECT count(*) AS bulk_rows, (SELECT count(*) FROM marks) AS marks FROM bulk")
    return df.to_dict(orient="records")
