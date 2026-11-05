import numpy as np
import pandas as pd

np.random.seed(42)
n = 200
regions = ['North','South','East','West']
reps = ['Alice','Bob','Carol','Dave','Eve','Frank']
stages = ['Closed Won','Closed Lost','Negotiation','Proposal']
months = pd.date_range('2025-01-01','2025-12-01',freq='MS').strftime('%Y-%m').tolist()

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.35,0.25,0.2,0.2]),
    'amount': np.round(np.random.gamma(5,2000,n),2),
    'close_month': np.random.choice(months, n)
})
