import time

def slow_probe(seconds):
    s = float(seconds)
    time.sleep(s)
    return {"slept": s}
