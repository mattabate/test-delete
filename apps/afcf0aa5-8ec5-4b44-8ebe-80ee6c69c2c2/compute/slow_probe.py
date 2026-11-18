def slow_probe(seconds):
    import time
    t0 = time.time()
    time.sleep(float(seconds))
    return {"slept": float(seconds), "elapsed": round(time.time() - t0, 1)}
