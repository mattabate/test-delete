def visit_tier(name):
    visits = int(ana.sql("SELECT count(*) AS n FROM visits").iloc[0, 0])
    beats = int(ana.sql("SELECT count(*) AS n FROM heartbeat").iloc[0, 0])
    tier = "gold" if visits >= 20 else "silver" if visits >= 5 else "bronze"
    return {"name": str(name), "visits": visits, "heartbeats": beats, "tier": tier}
