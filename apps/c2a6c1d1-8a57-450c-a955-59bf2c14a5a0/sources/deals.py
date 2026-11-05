import pandas as pd
import numpy as np

np.random.seed(42)
n = 200
regions = ['North America','EMEA','APAC','LATAM']
reps = ['Alice','Bob','Carla','David','Elena','Frank']
stages = ['Prospecting','Proposal','Negotiation','Closed Won','Closed Lost']
months = pd.date_range('2025-01-01', periods=12, freq='MS').strftime('%Y-%m')

deals = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'rep': np.random.choice(reps, n),
    'stage': np.random.choice(stages, n, p=[0.2,0.2,0.2,0.25,0.15]),
    'amount': np.round(np.random.gamma(5,4000,n),2),
    'close_month': np.random.choice(months, n)
})
