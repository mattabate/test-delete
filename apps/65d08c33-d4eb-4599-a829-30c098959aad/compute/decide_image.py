def decide_image(mode):
    import io, base64, os
    from PIL import Image
    path = "/tmp/rc1328_red.png"
    Image.new("RGB", (300, 300), (220, 20, 20)).save(path, "PNG")
    raw = open(path, "rb").read()
    if mode == "path":
        images = [path]
    elif mode == "bytes":
        images = [raw]
    elif mode == "dict":
        images = [{"media_type": "image/png", "data": base64.b64encode(raw).decode()}]
    elif mode == "missing":
        images = ["/tmp/rc1328_does_not_exist.png"]
    elif mode == "txt":
        open("/tmp/rc1328_note.txt", "w").write("not an image")
        images = ["/tmp/rc1328_note.txt"]
    else:
        return {"ok": False, "error": "unknown mode"}
    try:
        r = ana.decide("Classify the attached image.", {
            "color": {"instructions": "What is the dominant color of the attached image?", "choice": {"options": ["red", "green", "blue"]}},
        }, images=images)
        return {"ok": True, "mode": mode, "result": r}
    except Exception as e:
        return {"ok": False, "mode": mode, "error_type": type(e).__name__, "error": str(e)}
