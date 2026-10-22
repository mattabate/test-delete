
def decide_burst(n, threads):
    import time, threading
    n = int(n); threads = int(threads)
    ok = [0]; errs = {}; lock = threading.Lock(); t0 = time.time()
    def w(k, base):
        for i in range(k):
            try:
                r = ana.decide("Item %d: an apple" % (base + i), {"is_fruit": {"instructions": "Is the item a fruit?"}})
                with lock: ok[0] += 1
            except Exception as e:
                with lock: errs[str(e)[:100]] = errs.get(str(e)[:100], 0) + 1
    per = n // threads
    ts = [threading.Thread(target=w, args=(per, j * per)) for j in range(threads)]
    [t.start() for t in ts]; [t.join() for t in ts]
    return {"calls": per * threads, "ok": ok[0], "errors": errs, "elapsed_s": round(time.time() - t0, 1)}
