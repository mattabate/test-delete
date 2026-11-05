import pandas as pd
import numpy as np

np.random.seed(42)
n = 200
regions = ['North','South','East','West']
reps = ['Alice','Bob','Carol','Dave','Eve']
stages = ['Closed Won','Closed Lost','Negotiation','Proposal']
months = ['2026-0'+str(i) if i < 10 else '2026-'+str(i) for i in range(1, 11)]

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.35, 0.25, 0.2, 0.2]),
    'amount': np.random.randint(1000, 50000, n),
    'close_month': np.random.choice(months, n)
})
