import pandas as pd
import numpy as np

np.random.seed(42)

regions = ['North', 'South', 'East', 'West']
reps = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank']
stages = ['Prospecting', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
months = pd.date_range('2025-01-01', periods=12, freq='MS').strftime('%Y-%m')

n = 200
deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.2, 0.2, 0.2, 0.25, 0.15]),
    'amount': np.random.randint(1000, 50000, n),
    'close_month': np.random.choice(months, n),
})
