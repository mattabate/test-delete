def state_probe(tag):
    ana.state.set("rc141_probe", {"tag": str(tag)}, shared=True)
    return {"got": ana.state.get("rc141_probe", shared=True)}
