import pandas as pd
import numpy as np

np.random.seed(42)

regions = ['North','South','East','West']
reps = ['Alice','Bob','Carla','Dmitri','Elena','Farid']
stages = ['Won','Lost','Open']

n = 200
deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.4,0.3,0.3]),
    'amount': np.random.randint(1000, 50000, n),
    'close_month': np.random.choice(pd.date_range('2026-01-01', periods=12, freq='MS').strftime('%Y-%m'), n)
})
