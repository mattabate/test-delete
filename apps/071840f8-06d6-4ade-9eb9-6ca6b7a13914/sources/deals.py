import numpy as np
import pandas as pd

np.random.seed(42)

n = 200
regions = ['North', 'South', 'East', 'West']
reps = [f'Rep_{i}' for i in range(1, 11)]
stages = ['Won', 'Lost', 'In Progress']

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.4, 0.35, 0.25]),
    'amount': np.round(np.random.uniform(1000, 50000, n), 2),
    'close_month': pd.to_datetime(
        np.random.choice(pd.date_range('2026-01-01', '2026-10-01', freq='MS'), n)
    ).strftime('%Y-%m')
})
