def decide_text(text):
    try:
        r = ana.decide(text, {
            "urgent": {"instructions": "Is this ticket urgent?"},
            "team": {"instructions": "Which team owns it?", "choice": {"options": ["billing", "platform", "other"]}},
        })
        return {"ok": True, "result": r}
    except Exception as e:
        return {"ok": False, "error_type": type(e).__name__, "error": str(e)}
