import pandas as pd
import numpy as np

np.random.seed(42)

regions = ['North','South','East','West']
reps = ['Alice','Bob','Carol','Dave','Eve','Frank']
stages = ['Closed Won','Closed Lost','Negotiation','Proposal']

n = 200
deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.3,0.3,0.2,0.2]),
    'amount': np.round(np.random.uniform(1000,50000,n),2),
    'close_month': np.random.choice(pd.date_range('2026-01-01', periods=9, freq='MS').strftime('%Y-%m'), n)
})
