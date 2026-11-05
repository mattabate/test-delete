def slow_probe(seconds):
    import time
    seconds = float(seconds)
    if seconds < 0:
        seconds = 0
    if seconds > 60:
        seconds = 60
    time.sleep(seconds)
    return {"slept": seconds}
