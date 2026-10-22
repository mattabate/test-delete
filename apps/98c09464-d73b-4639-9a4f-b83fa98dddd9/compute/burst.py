
def burst(n, threads):
    import time, threading
    n = int(n); threads = int(threads)
    ok = [0]; limited = [0]; other = []; msgs = {}; lock = threading.Lock(); stamps = []
    t0 = time.time()
    def worker(k):
        for i in range(k):
            try:
                ana.sql("SELECT 1 AS x")
                with lock: ok[0] += 1; stamps.append(time.time() - t0)
            except Exception as e:
                s = str(e)
                with lock:
                    if "Too many" in s: limited[0] += 1; msgs[s[:90]] = msgs.get(s[:90], 0) + 1
                    else: other.append(s[:160])
    per = n // threads
    ts = [threading.Thread(target=worker, args=(per,)) for _ in range(threads)]
    [t.start() for t in ts]; [t.join() for t in ts]
    el = time.time() - t0
    first_sec = sum(1 for s in stamps if s <= 1.0)
    return {"calls": per * threads, "ok": ok[0], "rate_limited": limited[0], "other_errors": other[:3], "n_other": len(other), "limit_msgs": msgs, "elapsed_s": round(el, 2), "ok_within_first_1s": first_sec, "ok_per_s": round(ok[0] / el, 1)}
