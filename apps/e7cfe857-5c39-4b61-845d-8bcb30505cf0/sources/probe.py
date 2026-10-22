import time, pandas as pd
if time.time() > 1792637682:
    raise RuntimeError('rc1328-qa intentional failure for #17092 (fails after 1792637682)')
probe = pd.DataFrame({'x':[1]})