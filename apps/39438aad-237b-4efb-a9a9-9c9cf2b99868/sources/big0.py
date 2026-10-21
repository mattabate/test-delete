
import numpy as np, pandas as pd
n = 600000
rng = np.random.default_rng(1328)
h = rng.integers(0, 2**62, size=(n, 4), dtype=np.int64)
big0 = pd.DataFrame({"id": np.arange(n) + 0, "a": [format(x, "016x") for x in h[:,0]], "b": [format(x, "016x") for x in h[:,1]],
                    "c": [format(x, "016x") for x in h[:,2]], "x": h[:,3] / 3.0})
