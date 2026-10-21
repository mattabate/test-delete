import pandas as pd

data = [
    {"day": "Mon", "bananas_eaten": 240},
    {"day": "Tue", "bananas_eaten": 265},
    {"day": "Wed", "bananas_eaten": 251},
    {"day": "Thu", "bananas_eaten": 289},
    {"day": "Fri", "bananas_eaten": 312},
    {"day": "Sat", "bananas_eaten": 298},
    {"day": "Sun", "bananas_eaten": 272},
]
weekly = pd.DataFrame(data)
