import time

def slow_probe(seconds):
    time.sleep(seconds)
    return {"slept": seconds}
