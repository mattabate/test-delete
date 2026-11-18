import time

def slow_probe(seconds):
    time.sleep(float(seconds))
    return {"slept": seconds}
