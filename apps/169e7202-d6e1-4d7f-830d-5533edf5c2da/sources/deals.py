import pandas as pd
import numpy as np

np.random.seed(42)
n = 200
regions = ['North', 'South', 'East', 'West']
reps = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank']
stages = ['Prospecting', 'Negotiation', 'Won', 'Lost']
months = pd.date_range('2025-01-01', periods=12, freq='MS').strftime('%Y-%m')

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.3, 0.25, 0.25, 0.2]),
    'amount': np.random.randint(1000, 50000, n),
    'close_month': np.random.choice(months, n)
})
