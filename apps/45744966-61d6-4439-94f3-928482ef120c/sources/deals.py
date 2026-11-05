import pandas as pd
import numpy as np

np.random.seed(42)
n = 200
regions = ['North', 'South', 'East', 'West']
reps = ['Alice', 'Bob', 'Carla', 'David', 'Elena', 'Frank']
stages = ['Closed Won', 'Closed Lost', 'Negotiation', 'Proposal', 'Prospecting']

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.3, 0.25, 0.15, 0.15, 0.15]),
    'amount': np.round(np.random.uniform(1000, 50000, n), 2),
    'close_month': np.random.choice(pd.date_range('2026-01-01', periods=12, freq='MS').strftime('%Y-%m'), n)
})
