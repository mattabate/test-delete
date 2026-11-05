import pandas as pd
import numpy as np

np.random.seed(42)
regions = ['North', 'South', 'East', 'West']
products = ['Widget', 'Gadget', 'Gizmo', 'Doohickey']

n = 100
orders = pd.DataFrame({
    'region': np.random.choice(regions, n),
    'product': np.random.choice(products, n),
    'amount': np.round(np.random.uniform(20, 500, n), 2),
})
