import numpy as np, pandas as pd
np.random.seed(42)
n = 200
regions = ['North', 'South', 'East', 'West']
reps = [f'Rep {i}' for i in range(1, 11)]
stages = ['Won', 'Lost', 'Open']
deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.4, 0.3, 0.3]),
    'amount': np.round(np.random.uniform(1000, 50000, n), 2),
    'close_month': np.random.choice(pd.date_range('2026-01-01', periods=12, freq='MS').strftime('%Y-%m'), n)
})
