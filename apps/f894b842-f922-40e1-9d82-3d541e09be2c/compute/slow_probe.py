def slow_probe(seconds):
    import time
    seconds = float(seconds)
    time.sleep(seconds)
    return {"slept": seconds}
