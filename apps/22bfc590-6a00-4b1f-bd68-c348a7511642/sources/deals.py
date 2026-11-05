import numpy as np, pandas as pd
np.random.seed(42)

regions = ['North','South','East','West']
reps = ['Alice','Bob','Carol','Dave','Eve','Frank']
stages = ['Prospecting','Negotiation','Won','Lost']
months = pd.date_range('2025-01-01', periods=12, freq='MS').strftime('%Y-%m')

n = 200
deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.25,0.25,0.3,0.2]),
    'amount': np.random.randint(1000, 50000, n),
    'close_month': np.random.choice(months, n)
})
