import time

def slow_probe(seconds):
    seconds = float(seconds)
    time.sleep(seconds)
    return {"slept": seconds}
