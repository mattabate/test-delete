def slow_query(seconds):
    import time
    t0 = time.time()
    df = ana.query('slow_q', secs=int(seconds))
    return {"waited": int(seconds), "rows": int(len(df)), "elapsed": round(time.time() - t0, 1)}
