import pandas as pd
import numpy as np

np.random.seed(42)
n = 200
regions = ['North', 'South', 'East', 'West']
reps = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve']
stages = ['Closed Won', 'Closed Lost', 'Negotiation', 'Proposal']

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.35, 0.25, 0.2, 0.2]),
    'amount': np.round(np.random.uniform(1000, 50000, n), 2),
    'close_month': np.random.choice(pd.period_range('2026-01', '2026-09', freq='M').astype(str), n),
})
