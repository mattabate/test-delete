def live_usage(days):
    days = int(days)
    if days < 1 or days > 90:
        return {"error": "days must be between 1 and 90"}
    return ana.query("usage_window", days=days)
