import pandas as pd, numpy as np
np.random.seed(42)
n = 200
regions = ['North','South','East','West']
reps = [f'Rep {i}' for i in range(1,11)]
stages = ['Prospecting','Proposal','Negotiation','Closed Won','Closed Lost']
deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.25,0.25,0.2,0.2,0.1]),
    'amount': np.random.randint(1000, 50000, n),
    'close_month': np.random.choice(pd.date_range('2026-01-01', periods=12, freq='MS').strftime('%Y-%m'), n)
})
