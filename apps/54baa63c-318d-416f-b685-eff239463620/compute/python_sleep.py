def python_sleep(seconds):
    import time
    seconds = float(seconds)
    time.sleep(seconds)
    return {"seconds": seconds, "completed": True}
