import numpy as np
import pandas as pd

np.random.seed(42)
n = 200
regions = ['North', 'South', 'East', 'West']
reps = [f'Rep {i}' for i in range(1, 11)]
stages = ['Closed Won', 'Closed Lost', 'Negotiation', 'Proposal']

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.35, 0.25, 0.2, 0.2]),
    'amount': np.random.randint(1000, 50000, n),
    'close_month': np.random.choice(pd.date_range('2026-01-01', periods=10, freq='MS').strftime('%Y-%m'), n),
})
