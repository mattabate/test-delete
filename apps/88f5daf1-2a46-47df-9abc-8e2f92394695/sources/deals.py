import numpy as np
import pandas as pd

np.random.seed(42)

regions = ['North America', 'EMEA', 'APAC', 'LATAM']
reps = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank']
stages = ['Won', 'Lost', 'Open']
months = pd.date_range('2026-01-01', periods=10, freq='MS').strftime('%Y-%m')

n = 200
deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.4, 0.3, 0.3]),
    'amount': np.random.randint(5000, 100000, n),
    'close_month': np.random.choice(months, n),
})
