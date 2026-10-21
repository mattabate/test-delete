
def bulk_load(start, n):
    start = int(start); n = int(n)
    cols = ", ".join(f"hash(i, {c}) AS c{c}" for c in range(20))
    ana.sql(f"INSERT INTO bulk SELECT i AS id, {cols} FROM range({start}, {start + n}) t(i)")
    return {"inserted": n, "start": start}
