import pandas as pd
import numpy as np

np.random.seed(42)
n = 200
regions = ['North', 'South', 'East', 'West']
reps = [f'Rep_{i}' for i in range(1, 11)]
stages = ['Closed Won', 'Closed Lost', 'Negotiation', 'Proposal']
months = pd.date_range('2025-01-01', '2025-12-01', freq='MS').strftime('%Y-%m')

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.35, 0.25, 0.2, 0.2]),
    'amount': np.round(np.random.uniform(1000, 50000, n), 2),
    'close_month': np.random.choice(months, n),
})
