
def poll(ask_id, cursor, using):
    return ana.ask_poll(ask_id, cursor or "0", using=using)
