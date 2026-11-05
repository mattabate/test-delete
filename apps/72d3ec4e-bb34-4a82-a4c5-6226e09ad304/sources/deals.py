import pandas as pd, numpy as np
np.random.seed(42)
n=200
regions=['North','South','East','West']
reps=[f'Rep_{i}' for i in range(1,11)]
stages=['Won','Lost','Open']
months=pd.date_range('2025-01-01','2025-12-01',freq='MS').strftime('%Y-%m').tolist()
deals=pd.DataFrame({
    'region':np.random.choice(regions,n),
    'rep':np.random.choice(reps,n),
    'stage':np.random.choice(stages,n,p=[0.4,0.3,0.3]),
    'amount':np.round(np.random.uniform(1000,50000,n),2),
    'close_month':np.random.choice(months,n)
})
