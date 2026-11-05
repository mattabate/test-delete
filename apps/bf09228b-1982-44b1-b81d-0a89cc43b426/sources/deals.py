import pandas as pd, numpy as np
rng = np.random.default_rng(42)
n = 200
regions = ["North","South","East","West"]
reps = [f"Rep {i}" for i in range(1,11)]
stages = ["Won","Lost","Open"]
months = pd.date_range("2025-01-01", periods=12, freq="MS").strftime("%Y-%m")
deals = pd.DataFrame({
    "region": rng.choice(regions, n),
    "rep": rng.choice(reps, n),
    "stage": rng.choice(stages, n, p=[0.4,0.35,0.25]),
    "amount": rng.integers(2000, 50000, n),
    "close_month": rng.choice(months, n),
})
