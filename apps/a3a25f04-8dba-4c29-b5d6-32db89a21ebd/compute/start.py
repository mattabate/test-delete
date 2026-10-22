
def start(q, using):
    run = ana.ask(q, using=using)
    return {"ask_id": run.ask_id, "chat_id": run.chat_id, "chat_url": run.chat_url}
