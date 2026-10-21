
import pandas as pd, time
stamp = pd.DataFrame({"refreshed_at": [time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())], "epoch": [time.time()]})
